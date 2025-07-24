import { cn } from "@/lib/utils";

// Helper function to convert hex color to hue rotation for image filtering
function getHueRotation(hexColor: string): number {
  // Convert hex to RGB
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  // Convert RGB to HSL to get hue
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let hue = 0;
  if (diff !== 0) {
    if (max === r) {
      hue = ((g - b) / diff) % 6;
    } else if (max === g) {
      hue = (b - r) / diff + 2;
    } else {
      hue = (r - g) / diff + 4;
    }
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
  }

  return hue;
}

export interface CrosshairProps {
  style:
    | "dot"
    | "cross"
    | "circle"
    | "plus"
    | "t-shape"
    | "x-shape"
    | "outline"
    | "thick-cross"
    | "diamond"
    | "square"
    | "hollow-square"
    | "triangle"
    | "double-cross"
    | "brackets"
    | "star"
    | "arrow"
    | "lines-only"
    | "triple-dot"
    | "center-gap"
    | "pixel-cross"
    | "hexagon"
    | "crossbow"
    | "heart"
    | "radar"
    | "reticle"
    | "double-ring"
    | "chevron"
    | "micro-dot"
    | "burst"
    | "grid"
    | "custom-image";
  color: string;
  size: number;
  opacity: number;
  thickness?: number;
  gap?: number;
  offsetX?: number;
  offsetY?: number;
  imageUrl?: string;
  className?: string;
}

export function Crosshair({
  style,
  color,
  size,
  opacity,
  thickness = 2,
  gap = 4,
  imageUrl,
  className,
}: CrosshairProps) {
  const crosshairStyle = {
    color,
    opacity: opacity / 100,
  };

  const renderCrosshair = () => {
    const centerSize = size;
    const lineLength = centerSize / 2;

    switch (style) {
      case "dot":
        return (
          <div
            className="rounded-full bg-current"
            style={{
              width: size,
              height: size,
              ...crosshairStyle,
            }}
          />
        );

      case "cross":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            {/* Horizontal line */}
            <div
              className="absolute bg-current"
              style={{
                width: centerSize,
                height: thickness,
                ...crosshairStyle,
              }}
            />
            {/* Vertical line */}
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: centerSize,
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "circle":
        return (
          <div
            className="rounded-full border-current"
            style={{
              width: size,
              height: size,
              borderWidth: thickness,
              ...crosshairStyle,
            }}
          />
        );

      case "plus":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            {/* Top */}
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: lineLength,
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                ...crosshairStyle,
              }}
            />
            {/* Bottom */}
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: lineLength,
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                ...crosshairStyle,
              }}
            />
            {/* Left */}
            <div
              className="absolute bg-current"
              style={{
                width: lineLength,
                height: thickness,
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                ...crosshairStyle,
              }}
            />
            {/* Right */}
            <div
              className="absolute bg-current"
              style={{
                width: lineLength,
                height: thickness,
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "t-shape":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            {/* Horizontal line */}
            <div
              className="absolute bg-current"
              style={{
                width: centerSize,
                height: thickness,
                top: gap,
                ...crosshairStyle,
              }}
            />
            {/* Vertical line */}
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: centerSize - gap,
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "x-shape":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            {/* Diagonal 1 */}
            <div
              className="absolute bg-current origin-center"
              style={{
                width: Math.sqrt(2) * centerSize,
                height: thickness,
                transform: "rotate(45deg)",
                ...crosshairStyle,
              }}
            />
            {/* Diagonal 2 */}
            <div
              className="absolute bg-current origin-center"
              style={{
                width: Math.sqrt(2) * centerSize,
                height: thickness,
                transform: "rotate(-45deg)",
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "outline":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            {/* Center dot */}
            <div
              className="absolute rounded-full bg-current"
              style={{
                width: thickness * 2,
                height: thickness * 2,
                ...crosshairStyle,
              }}
            />
            {/* Outer circle */}
            <div
              className="absolute rounded-full border-current"
              style={{
                width: centerSize,
                height: centerSize,
                borderWidth: thickness,
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "thick-cross":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            {/* Horizontal line */}
            <div
              className="absolute bg-current"
              style={{
                width: centerSize,
                height: thickness * 2,
                ...crosshairStyle,
              }}
            />
            {/* Vertical line */}
            <div
              className="absolute bg-current"
              style={{
                width: thickness * 2,
                height: centerSize,
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "diamond":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            <div
              className="absolute bg-current origin-center"
              style={{
                width: centerSize / Math.sqrt(2),
                height: centerSize / Math.sqrt(2),
                transform: "rotate(45deg)",
                borderRadius: "2px",
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "square":
        return (
          <div
            className="border-current"
            style={{
              width: size,
              height: size,
              borderWidth: thickness,
              ...crosshairStyle,
            }}
          />
        );

      case "hollow-square":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            <div
              className="border-current"
              style={{
                width: centerSize,
                height: centerSize,
                borderWidth: thickness,
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute rounded-full bg-current"
              style={{
                width: thickness,
                height: thickness,
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "triangle":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            <div
              className="absolute"
              style={{
                width: 0,
                height: 0,
                borderLeft: `${centerSize / 2}px solid transparent`,
                borderRight: `${centerSize / 2}px solid transparent`,
                borderBottom: `${centerSize}px solid ${color}`,
                opacity: opacity / 100,
              }}
            />
          </div>
        );

      case "double-cross":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            {/* Outer horizontal line */}
            <div
              className="absolute bg-current"
              style={{
                width: centerSize,
                height: thickness,
                ...crosshairStyle,
              }}
            />
            {/* Outer vertical line */}
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: centerSize,
                ...crosshairStyle,
              }}
            />
            {/* Inner horizontal line */}
            <div
              className="absolute bg-current"
              style={{
                width: centerSize / 2,
                height: thickness / 2,
                ...crosshairStyle,
              }}
            />
            {/* Inner vertical line */}
            <div
              className="absolute bg-current"
              style={{
                width: thickness / 2,
                height: centerSize / 2,
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "brackets":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            {/* Top-left bracket */}
            <div
              className="absolute bg-current"
              style={{
                width: lineLength,
                height: thickness,
                top: 0,
                left: 0,
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: lineLength,
                top: 0,
                left: 0,
                ...crosshairStyle,
              }}
            />
            {/* Top-right bracket */}
            <div
              className="absolute bg-current"
              style={{
                width: lineLength,
                height: thickness,
                top: 0,
                right: 0,
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: lineLength,
                top: 0,
                right: 0,
                ...crosshairStyle,
              }}
            />
            {/* Bottom-left bracket */}
            <div
              className="absolute bg-current"
              style={{
                width: lineLength,
                height: thickness,
                bottom: 0,
                left: 0,
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: lineLength,
                bottom: 0,
                left: 0,
                ...crosshairStyle,
              }}
            />
            {/* Bottom-right bracket */}
            <div
              className="absolute bg-current"
              style={{
                width: lineLength,
                height: thickness,
                bottom: 0,
                right: 0,
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: lineLength,
                bottom: 0,
                right: 0,
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "star":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            {/* Cross */}
            <div
              className="absolute bg-current"
              style={{
                width: centerSize,
                height: thickness,
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: centerSize,
                ...crosshairStyle,
              }}
            />
            {/* X */}
            <div
              className="absolute bg-current origin-center"
              style={{
                width: Math.sqrt(2) * centerSize,
                height: thickness,
                transform: "rotate(45deg)",
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current origin-center"
              style={{
                width: Math.sqrt(2) * centerSize,
                height: thickness,
                transform: "rotate(-45deg)",
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "arrow":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            {/* Vertical line */}
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: centerSize,
                ...crosshairStyle,
              }}
            />
            {/* Arrow head - left */}
            <div
              className="absolute bg-current origin-center"
              style={{
                width: lineLength,
                height: thickness,
                top: gap,
                left: "25%",
                transform: "rotate(45deg)",
                ...crosshairStyle,
              }}
            />
            {/* Arrow head - right */}
            <div
              className="absolute bg-current origin-center"
              style={{
                width: lineLength,
                height: thickness,
                top: gap,
                right: "25%",
                transform: "rotate(-45deg)",
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "lines-only":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            {/* Top line */}
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: lineLength - gap,
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                ...crosshairStyle,
              }}
            />
            {/* Bottom line */}
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: lineLength - gap,
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                ...crosshairStyle,
              }}
            />
            {/* Left line */}
            <div
              className="absolute bg-current"
              style={{
                width: lineLength - gap,
                height: thickness,
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                ...crosshairStyle,
              }}
            />
            {/* Right line */}
            <div
              className="absolute bg-current"
              style={{
                width: lineLength - gap,
                height: thickness,
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "triple-dot":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            {/* Center dot */}
            <div
              className="absolute rounded-full bg-current"
              style={{
                width: thickness * 2,
                height: thickness * 2,
                ...crosshairStyle,
              }}
            />
            {/* Left dot */}
            <div
              className="absolute rounded-full bg-current"
              style={{
                width: thickness,
                height: thickness,
                left: gap,
                top: "50%",
                transform: "translateY(-50%)",
                ...crosshairStyle,
              }}
            />
            {/* Right dot */}
            <div
              className="absolute rounded-full bg-current"
              style={{
                width: thickness,
                height: thickness,
                right: gap,
                top: "50%",
                transform: "translateY(-50%)",
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "center-gap":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            {/* Top line */}
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: lineLength - gap,
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                ...crosshairStyle,
              }}
            />
            {/* Bottom line */}
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: lineLength - gap,
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                ...crosshairStyle,
              }}
            />
            {/* Left line */}
            <div
              className="absolute bg-current"
              style={{
                width: lineLength - gap,
                height: thickness,
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                ...crosshairStyle,
              }}
            />
            {/* Right line */}
            <div
              className="absolute bg-current"
              style={{
                width: lineLength - gap,
                height: thickness,
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                ...crosshairStyle,
              }}
            />
            {/* Center dot */}
            <div
              className="absolute rounded-full bg-current"
              style={{
                width: thickness / 2,
                height: thickness / 2,
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "pixel-cross":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            {/* Pixelated horizontal line */}
            <div
              className="absolute bg-current"
              style={{
                width: centerSize,
                height: thickness * 2,
                imageRendering: "pixelated",
                ...crosshairStyle,
              }}
            />
            {/* Pixelated vertical line */}
            <div
              className="absolute bg-current"
              style={{
                width: thickness * 2,
                height: centerSize,
                imageRendering: "pixelated",
                ...crosshairStyle,
              }}
            />
            {/* Corner pixels for retro effect */}
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: thickness,
                top: thickness,
                left: thickness,
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: thickness,
                top: thickness,
                right: thickness,
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: thickness,
                bottom: thickness,
                left: thickness,
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: thickness,
                bottom: thickness,
                right: thickness,
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "hexagon":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            <div
              className="absolute border-current"
              style={{
                width: centerSize * 0.8,
                height: centerSize * 0.8,
                borderWidth: thickness,
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "crossbow":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            {/* Horizontal arrow */}
            <div
              className="absolute bg-current"
              style={{
                width: centerSize,
                height: thickness,
                ...crosshairStyle,
              }}
            />
            {/* Arrow heads */}
            <div
              className="absolute bg-current origin-center"
              style={{
                width: gap,
                height: thickness,
                left: gap,
                transform: "rotate(45deg)",
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current origin-center"
              style={{
                width: gap,
                height: thickness,
                left: gap,
                transform: "rotate(-45deg)",
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current origin-center"
              style={{
                width: gap,
                height: thickness,
                right: gap,
                transform: "rotate(135deg)",
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current origin-center"
              style={{
                width: gap,
                height: thickness,
                right: gap,
                transform: "rotate(-135deg)",
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "heart":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            {/* Heart shape using CSS - left lobe */}
            <div
              className="absolute bg-current"
              style={{
                width: centerSize * 0.3,
                height: centerSize * 0.4,
                borderRadius: `${centerSize * 0.3}px ${centerSize * 0.3}px 0 0`,
                left: centerSize * 0.2,
                top: centerSize * 0.15,
                transform: "rotate(-45deg)",
                transformOrigin: "0 100%",
                ...crosshairStyle,
              }}
            />
            {/* Heart shape using CSS - right lobe */}
            <div
              className="absolute bg-current"
              style={{
                width: centerSize * 0.3,
                height: centerSize * 0.4,
                borderRadius: `${centerSize * 0.3}px ${centerSize * 0.3}px 0 0`,
                right: centerSize * 0.2,
                top: centerSize * 0.15,
                transform: "rotate(45deg)",
                transformOrigin: "100% 100%",
                ...crosshairStyle,
              }}
            />
            {/* Heart shape using CSS - bottom point */}
            <div
              className="absolute bg-current"
              style={{
                width: centerSize * 0.2,
                height: centerSize * 0.2,
                left: "50%",
                top: centerSize * 0.4,
                transform: "translateX(-50%) rotate(45deg)",
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "radar":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            {/* Outer circle */}
            <div
              className="absolute rounded-full border-current"
              style={{
                width: centerSize,
                height: centerSize,
                borderWidth: thickness,
                ...crosshairStyle,
              }}
            />
            {/* Inner circle */}
            <div
              className="absolute rounded-full border-current"
              style={{
                width: centerSize * 0.6,
                height: centerSize * 0.6,
                borderWidth: thickness / 2,
                ...crosshairStyle,
              }}
            />
            {/* Sweep line */}
            <div
              className="absolute bg-current origin-bottom"
              style={{
                width: thickness / 2,
                height: centerSize / 2,
                bottom: "50%",
                left: "50%",
                transform: "translateX(-50%) rotate(45deg)",
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "reticle":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            {/* Outer circle */}
            <div
              className="absolute rounded-full border-current"
              style={{
                width: centerSize,
                height: centerSize,
                borderWidth: thickness,
                ...crosshairStyle,
              }}
            />
            {/* Cross lines */}
            <div
              className="absolute bg-current"
              style={{
                width: centerSize,
                height: thickness / 2,
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current"
              style={{
                width: thickness / 2,
                height: centerSize,
                ...crosshairStyle,
              }}
            />
            {/* Range markings */}
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: gap,
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: gap,
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current"
              style={{
                width: gap,
                height: thickness,
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current"
              style={{
                width: gap,
                height: thickness,
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "double-ring":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            {/* Outer ring */}
            <div
              className="absolute rounded-full border-current"
              style={{
                width: centerSize,
                height: centerSize,
                borderWidth: thickness,
                ...crosshairStyle,
              }}
            />
            {/* Inner ring */}
            <div
              className="absolute rounded-full border-current"
              style={{
                width: centerSize * 0.5,
                height: centerSize * 0.5,
                borderWidth: thickness,
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "chevron":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            {/* Left side of chevron */}
            <div
              className="absolute bg-current origin-center"
              style={{
                width: lineLength,
                height: thickness,
                left: "25%",
                top: "35%",
                transform: "rotate(45deg)",
                ...crosshairStyle,
              }}
            />
            {/* Right side of chevron */}
            <div
              className="absolute bg-current origin-center"
              style={{
                width: lineLength,
                height: thickness,
                right: "25%",
                top: "35%",
                transform: "rotate(-45deg)",
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "micro-dot":
        return (
          <div
            className="rounded-full bg-current"
            style={{
              width: size,
              height: size,
              ...crosshairStyle,
            }}
          />
        );

      case "burst":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            {/* Main cross */}
            <div
              className="absolute bg-current"
              style={{
                width: centerSize,
                height: thickness,
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: centerSize,
                ...crosshairStyle,
              }}
            />
            {/* Burst lines */}
            <div
              className="absolute bg-current origin-center"
              style={{
                width: lineLength,
                height: thickness / 2,
                transform: "rotate(30deg)",
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current origin-center"
              style={{
                width: lineLength,
                height: thickness / 2,
                transform: "rotate(-30deg)",
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current origin-center"
              style={{
                width: lineLength,
                height: thickness / 2,
                transform: "rotate(60deg)",
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current origin-center"
              style={{
                width: lineLength,
                height: thickness / 2,
                transform: "rotate(-60deg)",
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "grid":
        return (
          <div
            className="relative flex items-center justify-center"
            style={{ width: centerSize, height: centerSize }}
          >
            {/* Vertical lines */}
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: centerSize,
                left: centerSize / 4,
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: centerSize,
                left: "50%",
                transform: "translateX(-50%)",
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current"
              style={{
                width: thickness,
                height: centerSize,
                right: centerSize / 4,
                ...crosshairStyle,
              }}
            />
            {/* Horizontal lines */}
            <div
              className="absolute bg-current"
              style={{
                width: centerSize,
                height: thickness,
                top: centerSize / 4,
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current"
              style={{
                width: centerSize,
                height: thickness,
                top: "50%",
                transform: "translateY(-50%)",
                ...crosshairStyle,
              }}
            />
            <div
              className="absolute bg-current"
              style={{
                width: centerSize,
                height: thickness,
                bottom: centerSize / 4,
                ...crosshairStyle,
              }}
            />
          </div>
        );

      case "custom-image":
        return imageUrl ? (
          <img
            src={imageUrl}
            alt="Custom crosshair"
            className="object-contain select-none pointer-events-none"
            style={{
              width: size,
              height: size,
              opacity: opacity / 100,
              imageRendering: 'auto',
            }}
            draggable={false}
          />
        ) : (
          <div
            className="rounded-full bg-current"
            style={{
              width: size,
              height: size,
              ...crosshairStyle,
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {renderCrosshair()}
    </div>
  );
}
