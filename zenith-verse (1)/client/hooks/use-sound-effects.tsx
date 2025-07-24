import { useCallback, useRef, useEffect } from 'react';

export type SoundType =
  | 'click'
  | 'hover'
  | 'success'
  | 'select'
  | 'use'
  | 'copy'
  | 'error'
  | 'drag'
  | 'release';

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isEnabledRef = useRef(true);
  const initializationAttemptedRef = useRef(false);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Try to unlock audio immediately with a silent sound
      const unlockAudio = async () => {
        try {
          const context = audioContextRef.current!;
          if (context.state === 'suspended') {
            await context.resume();
          }

          // Play a silent sound to unlock
          const oscillator = context.createOscillator();
          const gainNode = context.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(context.destination);
          gainNode.gain.setValueAtTime(0, context.currentTime);
          oscillator.start(context.currentTime);
          oscillator.stop(context.currentTime + 0.01);

          console.log('Audio unlocked with silent sound');
        } catch (error) {
          console.warn('Silent audio unlock failed:', error);
        }
      };

      // Try unlock immediately
      unlockAudio();
    }
    return audioContextRef.current;
  }, []);

  // Auto-enable audio immediately and on user interactions
  useEffect(() => {
    const enableAudio = async () => {
      try {
        const audioContext = getAudioContext();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
          console.log('AudioContext resumed successfully');
        }
        console.log('AudioContext state:', audioContext.state);
      } catch (error) {
        console.warn('Failed to enable audio:', error);
      }
    };

    // Try to enable audio immediately (will work if user has already interacted)
    enableAudio();

    // Also try on various user interactions as fallback
    const events = ['click', 'mousedown', 'keydown', 'touchstart', 'touchend', 'mouseover'];
    const enableOnce = () => {
      if (!initializationAttemptedRef.current) {
        initializationAttemptedRef.current = true;
        enableAudio();
        console.log('Audio enabled via user interaction');
      }
    };

    events.forEach(event => {
      document.addEventListener(event, enableOnce, { passive: true });
    });

    // Try again after a short delay (in case the page just loaded)
    const timeout = setTimeout(() => {
      enableAudio();
    }, 100);

    // Cleanup
    return () => {
      clearTimeout(timeout);
      events.forEach(event => {
        document.removeEventListener(event, enableOnce);
      });
    };
  }, [getAudioContext]);

  const playSound = useCallback((type: SoundType, volume: number = 0.3) => {
    if (!isEnabledRef.current) return;

    try {
      const audioContext = getAudioContext();

      // Try to resume if suspended (non-blocking)
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(err => console.warn('Resume failed:', err));
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configure sound based on type - shorter and more soothing
      switch (type) {
        case 'click':
          oscillator.frequency.setValueAtTime(520, audioContext.currentTime); // Softer C5
          oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.04);
          gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.04);
          oscillator.type = 'sine';
          break;

        case 'hover':
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime); // E5
          gainNode.gain.setValueAtTime(volume * 0.15, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.02);
          oscillator.type = 'sine';
          break;

        case 'success':
          // Gentle chord progression
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.03); // E5
          gainNode.gain.setValueAtTime(volume * 0.4, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
          oscillator.type = 'triangle';
          break;

        case 'select':
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
          oscillator.frequency.exponentialRampToValueAtTime(523, audioContext.currentTime + 0.03);
          gainNode.gain.setValueAtTime(volume * 0.25, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.03);
          oscillator.type = 'sine';
          break;

        case 'use':
          // Gentle rise
          oscillator.frequency.setValueAtTime(349, audioContext.currentTime); // F4
          oscillator.frequency.exponentialRampToValueAtTime(523, audioContext.currentTime + 0.06);
          gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.06);
          oscillator.type = 'triangle';
          break;

        case 'copy':
          // Soft double tone
          oscillator.frequency.setValueAtTime(587, audioContext.currentTime); // D5
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.025); // E5
          gainNode.gain.setValueAtTime(volume * 0.2, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.02);
          gainNode.gain.setValueAtTime(volume * 0.2, audioContext.currentTime + 0.025);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
          oscillator.type = 'sine';
          break;

        case 'error':
          oscillator.frequency.setValueAtTime(294, audioContext.currentTime); // D4
          gainNode.gain.setValueAtTime(volume * 0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.06);
          oscillator.type = 'triangle';
          break;

        case 'drag':
          oscillator.frequency.setValueAtTime(392, audioContext.currentTime); // G4
          gainNode.gain.setValueAtTime(volume * 0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.02);
          oscillator.type = 'sine';
          break;

        case 'release':
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
          oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.04);
          gainNode.gain.setValueAtTime(volume * 0.15, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.04);
          oscillator.type = 'sine';
          break;

        default:
          // Default gentle click
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
          gainNode.gain.setValueAtTime(volume * 0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.03);
          oscillator.type = 'sine';
      }

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('Sound effect failed:', error);
    }
  }, [getAudioContext]);

  const toggleSounds = useCallback(() => {
    isEnabledRef.current = !isEnabledRef.current;
    return isEnabledRef.current;
  }, []);

  const setSoundsEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
  }, []);

  return {
    playSound,
    toggleSounds,
    setSoundsEnabled,
    isEnabled: () => isEnabledRef.current,
  };
}
