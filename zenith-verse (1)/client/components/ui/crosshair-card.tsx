import { useState, useEffect } from "react";
import { Crosshair, CrosshairProps } from "./crosshair";
import { Button } from "./button";
import { SoundButton } from "./sound-button";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";
import { useSoundEffects } from "@/hooks/use-sound-effects";

interface CrosshairCardProps {
  name: string;
  style: CrosshairProps["style"];
  defaultColor: string;
  defaultSize: number;
  defaultOpacity: number;
  defaultThickness?: number;
  defaultGap?: number;
  isSelected?: boolean;
  onSelect?: () => void;
  showCustomization?: boolean;
  onCustomizationChange?: (settings: {
    color: string;
    size: number;
    opacity: number;
    thickness: number;
    gap: number;
  }) => void;
}

export function CrosshairCard({
  name,
  style,
  defaultColor,
  defaultSize,
  defaultOpacity,
  defaultThickness = 2,
  defaultGap = 4,
  isSelected = false,
  onSelect,
  showCustomization = false,
  onCustomizationChange,
}: CrosshairCardProps) {
  const [color, setColor] = useState(defaultColor);
  const [size, setSize] = useState(defaultSize);
  const [opacity, setOpacity] = useState(defaultOpacity);
  const [thickness, setThickness] = useState(defaultThickness);
  const [gap, setGap] = useState(defaultGap);
  const { playSound } = useSoundEffects();

  // Sync internal state with prop changes (e.g., when pro player settings are applied)
  useEffect(() => {
    setColor(defaultColor);
    setSize(defaultSize);
    setOpacity(defaultOpacity);
    setThickness(defaultThickness);
    setGap(defaultGap);
  }, [defaultColor, defaultSize, defaultOpacity, defaultThickness, defaultGap]);

  // Emit customization changes to parent
  useEffect(() => {
    if (isSelected && onCustomizationChange) {
      onCustomizationChange({
        color,
        size,
        opacity,
        thickness,
        gap,
      });
    }
  }, [color, size, opacity, thickness, gap, isSelected]);

  return (
    <Card
      className={cn(
        "transition-all duration-200 cursor-pointer hover:scale-105",
        isSelected
          ? "ring-2 ring-gaming-purple bg-gaming-purple/10"
          : "hover:ring-1 hover:ring-gaming-blue/50",
      )}
      onClick={() => {
        if (!isSelected) {
          playSound('select', 0.3);
        }
        onSelect?.();
      }}
      onMouseEnter={() => playSound('hover', 0.1)}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Preview Area */}
          <div className="w-32 h-32 bg-secondary/20 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Grid background for better visibility */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                  backgroundSize: "8px 8px",
                }}
              />
            </div>
            <Crosshair
              style={style}
              color={color}
              size={size}
              opacity={opacity}
              thickness={thickness}
              gap={gap}
            />
          </div>

          {/* Name and Selection */}
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">{name}</h3>
            {isSelected && (
              <Badge
                variant="secondary"
                className="bg-gaming-purple text-white"
              >
                Selected
              </Badge>
            )}
          </div>

          {/* Customization Controls */}
          {showCustomization && style !== "custom-image" && (
            <div className="w-full space-y-3 pt-4 border-t border-border">
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    "#ffffff",
                    "#ff0000",
                    "#00ff00",
                    "#0000ff",
                    "#ffff00",
                    "#ff00ff",
                    "#00ffff",
                    "#ffa500",
                  ].map((colorOption) => (
                    <button
                      key={colorOption}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 transition-all",
                        color === colorOption
                          ? "ring-2 ring-offset-1 ring-gaming-purple"
                          : "border-border",
                      )}
                      style={{ backgroundColor: colorOption }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setColor(colorOption);
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Size: {size}px</label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={size}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newSize = Number(e.target.value);
                    setSize(newSize);
                  }}
                  className="w-full accent-gaming-purple"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Opacity: {opacity}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={opacity}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newOpacity = Number(e.target.value);
                    setOpacity(newOpacity);
                  }}
                  className="w-full accent-gaming-purple"
                />
              </div>

              {(style === "cross" ||
                style === "plus" ||
                style === "thick-cross" ||
                style === "outline" ||
                style === "square" ||
                style === "hollow-square" ||
                style === "double-cross" ||
                style === "brackets" ||
                style === "star" ||
                style === "arrow" ||
                style === "lines-only" ||
                style === "center-gap" ||
                style === "pixel-cross" ||
                style === "hexagon" ||
                style === "crossbow" ||
                style === "radar" ||
                style === "reticle" ||
                style === "double-ring" ||
                style === "chevron" ||
                style === "burst" ||
                style === "grid") && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Thickness: {thickness}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={thickness}
                    onChange={(e) => {
                      e.stopPropagation();
                      const newThickness = Number(e.target.value);
                      setThickness(newThickness);
                    }}
                    className="w-full accent-gaming-purple"
                  />
                </div>
              )}
            </div>
          )}

          {!isSelected && (
            <SoundButton
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.();
              }}
              className="w-full bg-gaming-purple hover:bg-gaming-purple/80"
              soundType="select"
              soundVolume={0.4}
            >
              Select Crosshair
            </SoundButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
