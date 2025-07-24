import * as React from "react";
import { Button, ButtonProps } from "./button";
import { useSoundEffects, SoundType } from "@/hooks/use-sound-effects";
import { cn } from "@/lib/utils";

interface SoundButtonProps extends ButtonProps {
  soundType?: SoundType;
  enableHoverSound?: boolean;
  soundVolume?: number;
}

export const SoundButton = React.forwardRef<HTMLButtonElement, SoundButtonProps>(
  ({ 
    soundType = 'click', 
    enableHoverSound = true, 
    soundVolume = 0.3,
    className,
    onMouseEnter,
    onClick,
    children,
    ...props 
  }, ref) => {
    const { playSound } = useSoundEffects();

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (enableHoverSound && !props.disabled) {
        playSound('hover', soundVolume * 0.5);
      }
      onMouseEnter?.(e);
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!props.disabled) {
        playSound(soundType, soundVolume);
      }
      onClick?.(e);
    };

    return (
      <Button
        ref={ref}
        className={cn(
          "transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]",
          className
        )}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

SoundButton.displayName = "SoundButton";
