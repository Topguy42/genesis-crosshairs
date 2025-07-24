import { useEffect, useState, useRef } from "react";
import { Crosshair, CrosshairProps } from "./crosshair";
import { cn } from "@/lib/utils";
import { isElectron } from "@/lib/electron-utils";

interface CrosshairOverlayProps {
  crosshair: CrosshairProps | null;
  isVisible: boolean;
  onHide?: () => void;
  className?: string;
}

export function CrosshairOverlay({
  crosshair,
  isVisible,
  onHide,
  className,
}: CrosshairOverlayProps) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [currentCrosshair, setCurrentCrosshair] = useState<CrosshairProps | null>(null);
  const [screenCenter, setScreenCenter] = useState({ x: 0, y: 0 });
  const [windowPosition, setWindowPosition] = useState({ x: 0, y: 0 });

  // Calculate screen center position for true center positioning
  useEffect(() => {
    const updatePositions = () => {
      if (isElectron()) {
        try {
          // In Electron, get screen dimensions and window position for true center
          const screenWidth = window.screen.width;
          const screenHeight = window.screen.height;

          // Try multiple methods to get window position
          const windowX = window.screenX ?? window.screenLeft ?? 0;
          const windowY = window.screenY ?? window.screenTop ?? 0;

          // Calculate true screen center
          const trueCenterX = screenWidth / 2;
          const trueCenterY = screenHeight / 2;

          // Calculate relative position from window to screen center
          const relativeCenterX = trueCenterX - windowX - (window.innerWidth / 2);
          const relativeCenterY = trueCenterY - windowY - (window.innerHeight / 2);

          setScreenCenter({ x: relativeCenterX, y: relativeCenterY });
          setWindowPosition({ x: windowX, y: windowY });

          console.log(`Screen: ${screenWidth}x${screenHeight}, Window: ${windowX},${windowY}, Center offset: ${relativeCenterX},${relativeCenterY}`);
        } catch (error) {
          console.warn('Failed to calculate screen center:', error);
          setScreenCenter({ x: 0, y: 0 });
          setWindowPosition({ x: 0, y: 0 });
        }
      } else {
        // In browser, use viewport center (normal behavior)
        setScreenCenter({ x: 0, y: 0 });
        setWindowPosition({ x: 0, y: 0 });
      }
    };

    updatePositions();

    // Update positions when window moves or resizes
    window.addEventListener('resize', updatePositions);
    window.addEventListener('move', updatePositions);

    // Periodic update for window position changes (Electron apps)
    let positionInterval: NodeJS.Timeout | null = null;
    if (isElectron()) {
      positionInterval = setInterval(updatePositions, 100); // Update every 100ms
    }

    return () => {
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('move', updatePositions);
      if (positionInterval) {
        clearInterval(positionInterval);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible && crosshair) {
      setCurrentCrosshair(crosshair);
      setShowOverlay(true);
    } else {
      setShowOverlay(false);
      if (!isVisible) {
        setCurrentCrosshair(null);
      }
    }
  }, [isVisible, crosshair?.style, crosshair?.color, crosshair?.size, crosshair?.opacity, crosshair?.thickness, crosshair?.gap, crosshair?.offsetX, crosshair?.offsetY]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showOverlay) {
        onHide?.();
      }
    };

    if (showOverlay) {
      document.addEventListener("keydown", handleKeyPress);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [showOverlay, onHide]);

  if (!showOverlay || !currentCrosshair) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 pointer-events-none flex items-center justify-center",
        className,
      )}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 2147483647, // Maximum possible z-index
        pointerEvents: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
      }}
    >
      {/* Crosshair positioned with offsets and screen center compensation */}
      <div
        className="relative z-10"
        style={{
          transform: `translate3d(${Math.round((currentCrosshair.offsetX || 0) + screenCenter.x)}px, ${Math.round((currentCrosshair.offsetY || 0) + screenCenter.y)}px, 0px)`,
          willChange: 'transform',
          backfaceVisibility: 'hidden'
        }}
      >
        <Crosshair
          style={currentCrosshair.style}
          color={currentCrosshair.color}
          size={currentCrosshair.size}
          opacity={currentCrosshair.opacity}
          thickness={currentCrosshair.thickness}
          gap={currentCrosshair.gap}
          offsetX={currentCrosshair.offsetX}
          offsetY={currentCrosshair.offsetY}
          imageUrl={(currentCrosshair as any).imageUrl}
        />
      </div>

      {/* Minimal ESC indicator with positioning info */}
      <div className="absolute bottom-4 right-4 text-white/40 text-xs font-mono bg-black/20 px-2 py-1 rounded flex flex-col items-end">
        <div>ESC</div>
        {isElectron() && (
          <div className="text-white/30 text-xs">
            Screen Center
          </div>
        )}
      </div>
    </div>
  );
}
