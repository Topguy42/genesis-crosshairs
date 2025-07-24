import React, { useState, useEffect } from 'react';
import { Crosshair } from './crosshair';
import { Button } from './button';
import { X, Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WebCrosshairOverlayProps {
  isActive: boolean;
  onToggle: () => void;
  crosshairSettings: {
    style: string;
    color: string;
    size: number;
    opacity: number;
    thickness?: number;
    gap?: number;
    offsetX?: number;
    offsetY?: number;
  } | null;
}

export function WebCrosshairOverlay({ 
  isActive, 
  onToggle, 
  crosshairSettings 
}: WebCrosshairOverlayProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (isActive && showControls) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isActive, showControls]);

  // Show controls on mouse movement
  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = () => {
      setShowControls(true);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isActive]);

  // Handle fullscreen toggle
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.warn('Fullscreen not supported or denied');
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        onToggle();
      }
      if (e.key === 'F11' && isActive) {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isActive, onToggle]);

  if (!isActive || !crosshairSettings) return null;

  return (
    <>
      {/* Fullscreen Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[9999] bg-transparent pointer-events-none",
          "flex items-center justify-center"
        )}
        style={{
          background: isFullscreen ? 'transparent' : 'rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Crosshair Container */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) translate(${crosshairSettings.offsetX || 0}px, ${crosshairSettings.offsetY || 0}px)`,
          }}
        >
          <Crosshair
            style={crosshairSettings.style as any}
            color={crosshairSettings.color}
            size={crosshairSettings.size}
            opacity={crosshairSettings.opacity}
            thickness={crosshairSettings.thickness}
            gap={crosshairSettings.gap}
          />
        </div>

        {/* Overlay Controls */}
        <div
          className={cn(
            "absolute top-4 right-4 flex items-center space-x-2 pointer-events-auto",
            "transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0 hover:opacity-100"
          )}
        >
          {/* Fullscreen Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="bg-black/50 text-white border-white/20 hover:bg-black/70"
            title={isFullscreen ? "Exit Fullscreen (F11)" : "Enter Fullscreen (F11)"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>

          {/* Hide Crosshair */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggle}
            className="bg-black/50 text-white border-white/20 hover:bg-black/70"
            title="Hide Crosshair (ESC)"
          >
            <EyeOff className="w-4 h-4" />
          </Button>
        </div>

        {/* Instructions */}
        <div
          className={cn(
            "absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto",
            "bg-black/50 text-white px-4 py-2 rounded-lg text-sm",
            "transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="text-center">
            <div className="font-medium mb-1">Web Overlay Mode</div>
            <div className="text-xs opacity-80">
              Press F11 for fullscreen • ESC to exit • Mouse to show controls
            </div>
            <div className="text-xs opacity-60 mt-1">
              For true system-wide overlay, download the desktop app
            </div>
          </div>
        </div>
      </div>

      {/* Background Click Handler */}
      <div
        className="fixed inset-0 z-[9998] pointer-events-auto"
        onClick={(e) => {
          // Only close if clicking the background, not the controls
          if (e.target === e.currentTarget) {
            setShowControls(!showControls);
          }
        }}
      />
    </>
  );
}
