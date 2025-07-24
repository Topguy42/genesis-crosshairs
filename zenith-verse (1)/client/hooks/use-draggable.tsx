import React, { useState, useRef, useCallback } from 'react';
import { useSoundEffects } from './use-sound-effects';

interface Position {
  x: number;
  y: number;
}

interface UseDraggableOptions {
  disableTransform?: boolean;
  constrainToWindow?: boolean;
  enableDesktopDragging?: boolean; // For gaming overlay mode
}

export function useDraggable(options: UseDraggableOptions = {}) {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const elementRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({
    isDragging: false,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    mouseStart: { x: 0, y: 0 }
  });

  // Keep dragStateRef.currentPosition in sync with position state
  React.useEffect(() => {
    dragStateRef.current.currentPosition = position;
  }, [position]);
  
  const { playSound } = useSoundEffects();

  const updatePosition = useCallback((newPosition: Position) => {
    let constrainedPosition = newPosition;

    // In gaming overlay mode, allow unrestricted positioning for desktop-wide dragging
    const isGamingOverlayMode = document.body.classList.contains("gaming-overlay-mode");

    // Apply window constraints if enabled and not in gaming overlay mode
    if (options.constrainToWindow && !options.enableDesktopDragging && !isGamingOverlayMode && elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Calculate boundaries with padding
      const padding = 20;
      const maxX = windowWidth - rect.width - padding;
      const minX = padding;
      const maxY = windowHeight - rect.height - padding;
      const minY = padding;

      constrainedPosition = {
        x: Math.max(minX, Math.min(maxX, newPosition.x)),
        y: Math.max(minY, Math.min(maxY, newPosition.y))
      };
    }

    dragStateRef.current.currentPosition = constrainedPosition;

    if (options.disableTransform) {
      // For dialogs and components that manage positioning through React state
      setPosition(constrainedPosition);
    } else if (elementRef.current) {
      // For direct transform manipulation
      elementRef.current.style.transform = `translate3d(${constrainedPosition.x}px, ${constrainedPosition.y}px, 0)`;
    }
  }, [options.disableTransform, options.constrainToWindow, options.enableDesktopDragging]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!elementRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = elementRef.current.getBoundingClientRect();



    // Store initial state
    dragStateRef.current = {
      isDragging: true,
      startPosition: { ...dragStateRef.current.currentPosition },
      currentPosition: { ...dragStateRef.current.currentPosition },
      mouseStart: { x: e.clientX, y: e.clientY }
    };

    setIsDragging(true);
    playSound('drag', 0.2);

    // Optimize element for dragging
    if (elementRef.current) {
      elementRef.current.style.userSelect = 'none';
      elementRef.current.style.willChange = 'transform';
      document.body.style.cursor = 'grabbing';
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current.isDragging) return;

      const deltaX = e.clientX - dragStateRef.current.mouseStart.x;
      const deltaY = e.clientY - dragStateRef.current.mouseStart.y;
      
      const newPosition = {
        x: dragStateRef.current.startPosition.x + deltaX,
        y: dragStateRef.current.startPosition.y + deltaY
      };



      requestAnimationFrame(() => updatePosition(newPosition));
    };

    const handleMouseUp = () => {
      dragStateRef.current.isDragging = false;
      setIsDragging(false);
      playSound('release', 0.15);

      // Restore element styles
      if (elementRef.current) {
        elementRef.current.style.userSelect = '';
        elementRef.current.style.willChange = '';
        document.body.style.cursor = '';
      }

      // Clean up event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Final position sync
      setPosition({ ...dragStateRef.current.currentPosition });
    };

    // Add global event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseup', handleMouseUp);

  }, [updatePosition, playSound]);

  const resetPosition = useCallback(() => {
    const resetPos = { x: 0, y: 0 };
    dragStateRef.current.currentPosition = resetPos;
    dragStateRef.current.startPosition = resetPos;
    setPosition(resetPos);
    
    if (elementRef.current && !options.disableTransform) {
      elementRef.current.style.transform = 'translate3d(0px, 0px, 0)';
    }
  }, [options.disableTransform]);

  return {
    position,
    isDragging,
    elementRef,
    handleMouseDown,
    resetPosition
  };
}
