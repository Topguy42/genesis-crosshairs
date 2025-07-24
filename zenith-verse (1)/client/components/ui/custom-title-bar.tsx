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

  const handleMinimize = () => {
    if (inElectron) {
      (window as any).electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if (inElectron) {
      (window as any).electronAPI.maximizeWindow();
    }
  };

  const handleClose = () => {
    if (inElectron) {
      (window as any).electronAPI.closeWindow();
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
          {/* Optional status indicators can go here */}
        </div>
      </div>

      {/* Right side - Window controls */}
      <div className="flex items-center h-full border-l border-border/20">
        {/* Minimize */}
        <button
          onClick={handleMinimize}
          className={cn(
            "h-full w-12 flex items-center justify-center group",
            "hover:bg-yellow-500/20 hover:text-yellow-500 transition-all duration-150",
            "text-foreground/70 hover:text-yellow-500",
            "border-r border-border/10"
          )}
          style={{ WebkitAppRegion: 'no-drag' as any }}
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
            "hover:bg-green-500/20 hover:text-green-500 transition-all duration-150",
            "text-foreground/70 hover:text-green-500",
            "border-r border-border/10"
          )}
          style={{ WebkitAppRegion: 'no-drag' as any }}
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
          style={{ WebkitAppRegion: 'no-drag' as any }}
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
