// Crosshair Share Code System
// Generates short codes like "GC-A5B9K" for sharing crosshair configurations

interface ShareableCrosshair {
  style: string;
  color: string;
  size: number;
  opacity: number;
  thickness?: number;
  gap?: number;
  offsetX?: number;
  offsetY?: number;
  imageUrl?: string;
  name?: string;
}

// Base62 characters for compact encoding
const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

// Style mappings for compact encoding
const STYLE_MAP: Record<string, number> = {
  'dot': 0, 'cross': 1, 'circle': 2, 'plus': 3, 't-shape': 4, 'x-shape': 5,
  'outline': 6, 'thick-cross': 7, 'diamond': 8, 'square': 9, 'hollow-square': 10,
  'triangle': 11, 'double-cross': 12, 'brackets': 13, 'star': 14, 'arrow': 15,
  'lines-only': 16, 'triple-dot': 17, 'center-gap': 18, 'pixel-cross': 19,
  'hexagon': 20, 'crossbow': 21, 'heart': 22, 'radar': 23, 'reticle': 24,
  'double-ring': 25, 'chevron': 26, 'micro-dot': 27, 'burst': 28, 'grid': 29,
  'custom-image': 30
};

const STYLE_REVERSE_MAP = Object.fromEntries(
  Object.entries(STYLE_MAP).map(([k, v]) => [v, k])
);

// Color shortcuts for popular gaming colors
const COLOR_SHORTCUTS: Record<string, string> = {
  '#ffffff': 'W', '#00ff00': 'G', '#ff0000': 'R', '#00ffff': 'C',
  '#ffff00': 'Y', '#ff00ff': 'M', '#ffa500': 'O', '#8b5cf6': 'P'
};

const COLOR_REVERSE_SHORTCUTS = Object.fromEntries(
  Object.entries(COLOR_SHORTCUTS).map(([k, v]) => [v, k])
);

function encodeNumber(num: number): string {
  if (typeof num !== 'number' || !isFinite(num)) {
    throw new Error(`Invalid number for encoding: ${num}`);
  }

  if (num < 0) {
    throw new Error(`Negative numbers not supported for encoding: ${num}`);
  }

  if (num === 0) return '0';

  let result = '';
  while (num > 0) {
    result = BASE62_CHARS[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result;
}

function decodeNumber(str: string): number {
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    const charIndex = BASE62_CHARS.indexOf(str[i]);
    if (charIndex === -1) throw new Error('Invalid character in code');
    result = result * 62 + charIndex;
  }
  return result;
}

function encodeColor(color: string): string {
  if (typeof color !== 'string') {
    throw new Error(`Invalid color type: ${typeof color}`);
  }

  // Check for color shortcuts first
  if (COLOR_SHORTCUTS[color]) {
    return COLOR_SHORTCUTS[color];
  }

  // Validate hex color format
  if (!color.startsWith('#') || (color.length !== 4 && color.length !== 7)) {
    throw new Error(`Invalid color format: ${color}`);
  }

  // Encode hex color (remove # and convert to base62)
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);

  if (isNaN(num)) {
    throw new Error(`Invalid hex color: ${color}`);
  }

  return encodeNumber(num);
}

function decodeColor(encoded: string): string {
  // Check for color shortcuts first
  if (COLOR_REVERSE_SHORTCUTS[encoded]) {
    return COLOR_REVERSE_SHORTCUTS[encoded];
  }
  
  // Decode as number and convert back to hex
  try {
    const num = decodeNumber(encoded);
    const hex = num.toString(16).padStart(6, '0');
    return `#${hex}`;
  } catch {
    return '#ffffff'; // Default fallback
  }
}

export async function generateShareCode(crosshair: ShareableCrosshair): Promise<string> {
  try {
    // Validate input
    if (!crosshair || typeof crosshair !== 'object') {
      throw new Error('Invalid crosshair data');
    }

    if (!crosshair.style || typeof crosshair.style !== 'string') {
      throw new Error('Invalid or missing crosshair style');
    }

    // Check if this is a custom image crosshair
    if (crosshair.style === 'custom-image' && crosshair.imageUrl) {
      return await generateImageShareCode(crosshair);
    }

    // Validate required fields for regular crosshairs
    if (typeof crosshair.color !== 'string') {
      throw new Error(`Invalid color value: ${crosshair.color} (type: ${typeof crosshair.color})`);
    }
    if (typeof crosshair.size !== 'number' || crosshair.size <= 0) {
      throw new Error(`Invalid size value: ${crosshair.size} (type: ${typeof crosshair.size})`);
    }
    if (typeof crosshair.opacity !== 'number' || crosshair.opacity <= 0) {
      throw new Error(`Invalid opacity value: ${crosshair.opacity} (type: ${typeof crosshair.opacity})`);
    }

    // Encode each component for regular crosshairs
    const style = encodeNumber(STYLE_MAP[crosshair.style] || 0);
    const color = encodeColor(crosshair.color);
    const size = encodeNumber(crosshair.size);
    const opacity = encodeNumber(crosshair.opacity);

    const thickness = encodeNumber(crosshair.thickness || 2);
    const gap = encodeNumber(crosshair.gap || 0);
    const offsetX = encodeNumber((crosshair.offsetX || 0) + 100); // Offset by 100 to handle negatives
    const offsetY = encodeNumber((crosshair.offsetY || 0) + 100);

    // Create compact representation
    const parts = [style, color, size, opacity, thickness, gap, offsetX, offsetY];
    const encoded = parts.join('.');

    // Add prefix and checksum
    const checksum = encodeNumber(encoded.length % 62);
    return `GC-${encoded}-${checksum}`;
  } catch (error) {
    throw new Error(`Failed to generate share code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function generateImageShareCode(crosshair: ShareableCrosshair): Promise<string> {
  try {
    // Validate image URL exists
    if (!crosshair.imageUrl || typeof crosshair.imageUrl !== 'string') {
      throw new Error('Invalid or missing image URL');
    }

    let imageUrl = crosshair.imageUrl;

    // If it's a blob URL, convert it to a base64 data URL for sharing
    if (crosshair.imageUrl.startsWith('blob:')) {
      try {
        // Check if the blob URL is still valid by attempting to fetch it
        const response = await fetch(crosshair.imageUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();

        if (!blob || blob.size === 0) {
          throw new Error('Empty or invalid blob data');
        }

        // Compress and convert blob to base64 data URL
        imageUrl = await compressImageForSharing(blob);
      } catch (conversionError) {
        console.error('Blob conversion error:', conversionError);
        // If blob conversion fails, we can't share this image
        // Provide a more user-friendly error message
        if (conversionError instanceof Error && conversionError.message.includes('Failed to fetch')) {
          throw new Error('Custom image is no longer available for sharing. Please re-upload the image and try again.');
        }
        throw new Error(`Failed to convert image for sharing: ${conversionError instanceof Error ? conversionError.message : 'Blob URL is invalid or expired'}`);
      }
    }

    // For custom images, create a JSON-based share code
    const imageData = {
      style: 'custom-image',
      imageUrl: imageUrl,
      size: Math.max(4, Math.min(100, crosshair.size || 32)),
      opacity: Math.max(10, Math.min(100, crosshair.opacity || 100)),
      offsetX: Math.max(-50, Math.min(50, crosshair.offsetX || 0)),
      offsetY: Math.max(-50, Math.min(50, crosshair.offsetY || 0)),
      name: (crosshair.name || 'Custom Image Crosshair').slice(0, 100)
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(imageData);

    // Validate JSON string length (base64 will be ~33% longer)
    const maxSize = 200000; // Increased limit for compressed images
    if (jsonString.length > maxSize) {
      throw new Error(`Image is too large for sharing (${Math.round(jsonString.length / 1000)}KB). Try using a smaller image or different format.`);
    }

    // Convert to base64 for sharing
    let base64Data: string;
    try {
      base64Data = btoa(jsonString);
    } catch (encodeError) {
      throw new Error('Failed to encode image data');
    }

    // Use GCI prefix for image crosshairs
    return `GCI-${base64Data}`;
  } catch (error) {
    throw new Error(`Failed to generate image share code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function parseShareCode(shareCode: string): ShareableCrosshair {
  try {
    // Validate input
    if (!shareCode || typeof shareCode !== 'string') {
      throw new Error('Share code is required');
    }

    // Trim whitespace
    shareCode = shareCode.trim();

    if (shareCode.length === 0) {
      throw new Error('Share code cannot be empty');
    }

    // Check if this is an image share code
    if (shareCode.startsWith('GCI-')) {
      return parseImageShareCode(shareCode);
    }

    // Validate format for regular crosshairs
    if (!shareCode.startsWith('GC-')) {
      throw new Error('Invalid share code format. Share codes must start with "GC-" or "GCI-"');
    }

    // Remove prefix and split
    const withoutPrefix = shareCode.slice(3);
    const parts = withoutPrefix.split('-');

    if (parts.length !== 2) {
      throw new Error('Invalid share code structure');
    }

    const [encoded, checksumStr] = parts;
    const checksum = decodeNumber(checksumStr);

    // Verify checksum
    if (encoded.length % 62 !== checksum) {
      throw new Error('Invalid share code checksum');
    }

    // Parse components
    const components = encoded.split('.');
    if (components.length !== 8) {
      throw new Error('Invalid share code components');
    }

    const [styleNum, colorStr, sizeStr, opacityStr, thicknessStr, gapStr, offsetXStr, offsetYStr] = components;

    const style = STYLE_REVERSE_MAP[decodeNumber(styleNum)] || 'cross';
    const color = decodeColor(colorStr);
    const size = decodeNumber(sizeStr);
    const opacity = decodeNumber(opacityStr);
    const thickness = decodeNumber(thicknessStr);
    const gap = decodeNumber(gapStr);
    const offsetX = decodeNumber(offsetXStr) - 100; // Remove offset
    const offsetY = decodeNumber(offsetYStr) - 100;

    return {
      style,
      color,
      size,
      opacity,
      thickness,
      gap,
      offsetX,
      offsetY
    };
  } catch (error) {
    throw new Error(`Failed to parse share code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function parseImageShareCode(shareCode: string): ShareableCrosshair {
  try {
    // Remove GCI- prefix
    let base64Data = shareCode.slice(4);

    // Validate base64 format
    if (!base64Data || base64Data.length === 0) {
      throw new Error('Empty image share code data');
    }

    // Clean the base64 string - remove any whitespace and invalid characters
    base64Data = base64Data.replace(/[^A-Za-z0-9+/=]/g, '');

    // Ensure proper base64 padding
    while (base64Data.length % 4 !== 0) {
      base64Data += '=';
    }

    // Validate base64 characters
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(base64Data)) {
      throw new Error('Invalid base64 characters in share code');
    }

    // Decode from base64
    let jsonString: string;
    try {
      jsonString = atob(base64Data);
    } catch (decodeError) {
      throw new Error('Failed to decode base64 data - corrupted share code');
    }

    // Parse JSON
    let imageData: any;
    try {
      imageData = JSON.parse(jsonString);
    } catch (parseError) {
      throw new Error('Failed to parse share code data - invalid JSON');
    }

    // Validate required fields
    if (!imageData || typeof imageData !== 'object') {
      throw new Error('Invalid image share code data structure');
    }

    if (!imageData.imageUrl || typeof imageData.imageUrl !== 'string') {
      throw new Error('Missing or invalid image URL in share code');
    }

    if (imageData.style && imageData.style !== 'custom-image') {
      throw new Error('Invalid style in image share code');
    }

    return {
      style: 'custom-image',
      color: '#ffffff', // Default color for images
      size: typeof imageData.size === 'number' ? Math.max(4, Math.min(100, imageData.size)) : 32,
      opacity: typeof imageData.opacity === 'number' ? Math.max(10, Math.min(100, imageData.opacity)) : 100,
      thickness: 2, // Not used for images
      gap: 0, // Not used for images
      offsetX: typeof imageData.offsetX === 'number' ? Math.max(-50, Math.min(50, imageData.offsetX)) : 0,
      offsetY: typeof imageData.offsetY === 'number' ? Math.max(-50, Math.min(50, imageData.offsetY)) : 0,
      imageUrl: imageData.imageUrl,
      name: typeof imageData.name === 'string' ? imageData.name.slice(0, 100) : 'Shared Custom Image'
    };
  } catch (error) {
    throw new Error(`Failed to parse image share code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateQuickShareCode(crosshair: ShareableCrosshair): Promise<string> {
  // Generate a shorter code for common configurations
  const commonStyles = ['dot', 'cross', 'circle', 'plus'];
  const commonColors = ['#ffffff', '#00ff00', '#ff0000', '#00ffff'];
  const commonSizes = [4, 8, 16, 24, 32];

  if (
    commonStyles.includes(crosshair.style) &&
    commonColors.includes(crosshair.color) &&
    commonSizes.includes(crosshair.size) &&
    crosshair.opacity === 100 &&
    !crosshair.offsetX &&
    !crosshair.offsetY
  ) {
    const styleIdx = commonStyles.indexOf(crosshair.style);
    const colorIdx = commonColors.indexOf(crosshair.color);
    const sizeIdx = commonSizes.indexOf(crosshair.size);

    const compact = styleIdx * 100 + colorIdx * 10 + sizeIdx;
    return `QC-${encodeNumber(compact)}`;
  }

  return await generateShareCode(crosshair);
}

export function parseQuickShareCode(shareCode: string): ShareableCrosshair {
  if (shareCode.startsWith('QC-')) {
    const encoded = shareCode.slice(3);
    const compact = decodeNumber(encoded);
    
    const styleIdx = Math.floor(compact / 100);
    const colorIdx = Math.floor((compact % 100) / 10);
    const sizeIdx = compact % 10;
    
    const commonStyles = ['dot', 'cross', 'circle', 'plus'];
    const commonColors = ['#ffffff', '#00ff00', '#ff0000', '#00ffff'];
    const commonSizes = [4, 8, 16, 24, 32];
    
    return {
      style: commonStyles[styleIdx] || 'cross',
      color: commonColors[colorIdx] || '#ffffff',
      size: commonSizes[sizeIdx] || 24,
      opacity: 100,
      thickness: 2,
      gap: 0,
      offsetX: 0,
      offsetY: 0
    };
  }
  
  return parseShareCode(shareCode);
}

// Utility function to compress image for sharing
async function compressImageForSharing(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set reasonable maximum dimensions for crosshair images
      const maxWidth = 128;
      const maxHeight = 128;

      let { width, height } = img;

      // Calculate scaling to fit within max dimensions while maintaining aspect ratio
      const scale = Math.min(maxWidth / width, maxHeight / height, 1);
      width = Math.floor(width * scale);
      height = Math.floor(height * scale);

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Draw the image
      ctx.drawImage(img, 0, 0, width, height);

      // Check if image has transparency by examining the alpha channel
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      let hasTransparency = false;

      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 255) {
          hasTransparency = true;
          break;
        }
      }

      // If image has transparency, use PNG to preserve it
      if (hasTransparency) {
        canvas.toBlob(
          (compressedBlob) => {
            if (!compressedBlob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Convert to base64
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              resolve(result);
            };
            reader.onerror = () => reject(new Error('Failed to read compressed image'));
            reader.readAsDataURL(compressedBlob);
          },
          'image/png'
        );
      } else {
        // No transparency, use JPEG with quality compression
        const tryCompress = (quality: number): void => {
          canvas.toBlob(
            (compressedBlob) => {
              if (!compressedBlob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              // Convert to base64
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result as string;
                const resultSize = result.length;

                // If still too large and we can reduce quality further, try again
                if (resultSize > 100000 && quality > 0.3) {
                  tryCompress(quality - 0.1);
                } else {
                  resolve(result);
                }
              };
              reader.onerror = () => reject(new Error('Failed to read compressed image'));
              reader.readAsDataURL(compressedBlob);
            },
            'image/jpeg',
            quality
          );
        };

        // Start with good quality
        tryCompress(0.8);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = URL.createObjectURL(blob);
  });
}

// Utility function to copy share code to clipboard
export async function copyShareCodeToClipboard(shareCode: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(shareCode);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = shareCode;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
}

// Generate name for shared crosshair
export function generateCrosshairName(crosshair: ShareableCrosshair): string {
  // Use provided name for custom images or if explicitly set
  if (crosshair.name) {
    return crosshair.name;
  }

  // Special handling for custom images
  if (crosshair.style === 'custom-image') {
    return 'Custom Image Crosshair';
  }

  const styleName = crosshair.style.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  const colorName = getColorName(crosshair.color);
  return `${colorName} ${styleName}`;
}

function getColorName(color: string): string {
  const colorNames: Record<string, string> = {
    '#ffffff': 'White',
    '#00ff00': 'Green',
    '#ff0000': 'Red',
    '#00ffff': 'Cyan',
    '#ffff00': 'Yellow',
    '#ff00ff': 'Magenta',
    '#ffa500': 'Orange',
    '#8b5cf6': 'Purple'
  };
  
  return colorNames[color] || 'Custom';
}
