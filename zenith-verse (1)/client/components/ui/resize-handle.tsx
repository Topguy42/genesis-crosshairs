import React from "react";
import { cn } from "@/lib/utils";
import { isElectron } from "@/lib/electron-utils";

interface ResizeHandleProps {
  className?: string;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ className }) => {
  const inElectron = isElectron();

  // Don't render if not in Electron
  if (!inElectron) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-0 right-0 w-4 h-4 cursor-se-resize",
        "bg-gradient-to-tl from-border/40 to-transparent",
        "hover:from-border/60 transition-colors duration-150",
        className
      )}
      style={{
        WebkitAppRegion: 'no-drag' as any,
      }}
      title="Resize window"
    >
      {/* Resize grip lines */}
      <div className="absolute bottom-1 right-1 space-y-0.5">
        <div className="flex space-x-0.5">
          <div className="w-0.5 h-0.5 bg-border/60 rounded-full"></div>
          <div className="w-0.5 h-0.5 bg-border/60 rounded-full"></div>
        </div>
        <div className="flex space-x-0.5">
          <div className="w-0.5 h-0.5 bg-border/60 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ResizeHandle;
