import React, { useState, useEffect, useCallback } from "react";
import { Minus, Square, X, Target, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { isElectron } from "@/lib/electron-utils";

interface CustomTitleBarProps {
  title?: string;
  className?: string;
}

export const CustomTitleBar: React.FC<CustomTitleBarProps> = ({
  title = "Genesis Crosshairs",
  className
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [platform, setPlatform] = useState<string>('');
  const inElectron = isElectron();

  useEffect(() => {
    console.log('CustomTitleBar useEffect - inElectron:', inElectron);
    console.log('electronAPI available:', !!(window as any).electronAPI);
    console.log('electronAPI methods:', (window as any).electronAPI ? Object.keys((window as any).electronAPI) : 'N/A');

    if (!inElectron) return;

    const electronAPI = (window as any).electronAPI;

    // Detect platform
    if ((window as any).platform) {
      setPlatform((window as any).platform.platform);
    }

    // Check initial maximized state
    electronAPI.isWindowMaximized().then((maximized: boolean) => {
      setIsMaximized(maximized);
    });

    // Listen for window state changes
    const handleMaximized = () => setIsMaximized(true);
    const handleUnmaximized = () => setIsMaximized(false);

    electronAPI.onWindowMaximized(handleMaximized);
    electronAPI.onWindowUnmaximized(handleUnmaximized);

    return () => {
      electronAPI.removeAllListeners('window-maximized');
      electronAPI.removeAllListeners('window-unmaximized');
    };
  }, [inElectron]);

  const handleMinimize = async () => {
    console.log('Minimize button clicked');
    if ((window as any).electronAPI?.minimizeWindow) {
      try {
        const success = await (window as any).electronAPI.minimizeWindow();
        console.log('Minimize operation success:', success);
      } catch (error) {
        console.error('Minimize failed:', error);
      }
    } else {
      console.error('electronAPI.minimizeWindow not available');
    }
  };

  const handleMaximize = async () => {
    console.log('Maximize button clicked');
    if ((window as any).electronAPI?.maximizeWindow) {
      try {
        const success = await (window as any).electronAPI.maximizeWindow();
        console.log('Maximize operation success:', success);
      } catch (error) {
        console.error('Maximize failed:', error);
      }
    } else {
      console.error('electronAPI.maximizeWindow not available');
    }
  };

  const handleClose = async () => {
    console.log('Close button clicked');
    if ((window as any).electronAPI?.closeWindow) {
      try {
        const success = await (window as any).electronAPI.closeWindow();
        console.log('Close operation success:', success);
      } catch (error) {
        console.error('Close failed:', error);
      }
    } else {
      console.error('electronAPI.closeWindow not available');
    }
  };

  const handleDoubleClick = useCallback(() => {
    if (inElectron) {
      (window as any).electronAPI.maximizeWindow();
    }
  }, [inElectron]);

  // Render with limited functionality if not in Electron
  const showWindowControls = inElectron;

  return (
    <div
      className={cn(
        "flex items-center justify-between h-9 bg-background/95 backdrop-blur border-b border-border/30 select-none",
        "drag-region", // Custom class for draggable area
        isMaximized && "bg-card/90", // Slight visual change when maximized
        className
      )}
      style={{
        WebkitAppRegion: 'drag' as any,
        userSelect: 'none'
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Left side - App icon and title */}
      <div className="flex items-center space-x-3 px-4 h-full">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 bg-gradient-to-br from-gaming-purple to-gaming-blue rounded flex items-center justify-center">
            <Target className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-medium text-foreground">
            {title}
          </span>
        </div>
      </div>

      {/* Center - Status indicators */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
          {/* Debug info for testing */}
          {inElectron && (
            <span className="text-xs">
              API: {(window as any).electronAPI ? '✓' : '✗'}
            </span>
          )}
        </div>
      </div>

      {/* Right side - Window controls */}
      <div className="flex items-center h-full border-l border-border/20">
        {/* Minimize */}
        <button
          onClick={handleMinimize}
          className={cn(
            "h-full w-12 flex items-center justify-center group",
            "hover:bg-yellow-500/20 transition-all duration-150",
            "text-foreground/70 hover:text-yellow-500",
            "border-r border-border/10"
          )}
          style={{
            WebkitAppRegion: 'no-drag' as any,
            userSelect: 'none'
          }}
          aria-label="Minimize"
          title="Minimize (Ctrl+M)"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Maximize/Restore */}
        <button
          onClick={handleMaximize}
          className={cn(
            "h-full w-12 flex items-center justify-center group",
            "hover:bg-green-500/20 transition-all duration-150",
            "text-foreground/70 hover:text-green-500",
            "border-r border-border/10"
          )}
          style={{
            WebkitAppRegion: 'no-drag' as any,
            userSelect: 'none'
          }}
          aria-label={isMaximized ? "Restore" : "Maximize"}
          title={isMaximized ? "Restore (F11 for fullscreen)" : "Maximize (F11 for fullscreen)"}
        >
          {isMaximized ? (
            <Copy className="w-4 h-4" />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </button>

        {/* Close */}
        <button
          onClick={handleClose}
          className={cn(
            "h-full w-12 flex items-center justify-center group",
            "hover:bg-red-500 hover:text-white transition-all duration-150",
            "text-foreground/70"
          )}
          style={{
            WebkitAppRegion: 'no-drag' as any,
            userSelect: 'none'
          }}
          aria-label="Close"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CustomTitleBar;
