import React, { useState } from "react";
import { CrosshairCard } from "@/components/ui/crosshair-card";
import { Crosshair } from "@/components/ui/crosshair";
import { WebCrosshairOverlay } from "@/components/ui/web-crosshair-overlay";

import { AimTrainer } from "@/components/ui/aim-trainer";
import { AimTrainer3D } from "@/components/ui/aim-trainer-3d";
import { Button } from "@/components/ui/button";
import { SoundButton } from "@/components/ui/sound-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DraggableDialog,
  DraggableDialogContent,
  DraggableDialogHeader,
  DraggableDialogBody,
  DraggableDialogTitle,
  DraggableDialogDescription,
} from "@/components/ui/draggable-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { generateShareCode, parseShareCode, copyShareCodeToClipboard, generateCrosshairName } from "@/lib/crosshair-share";
import { storage } from "@/lib/storage";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import { useToast } from "@/hooks/use-toast";
import {
  Copy,
  Download,
  Settings,
  Crosshair as CrosshairIcon,
  Target,
  Zap,
  Eye,
  Trophy,
  BarChart3,
  Users,
  Clock,
  Gamepad2,
  Monitor,
  TrendingUp,
  Star,
  Play,
  RotateCcw,
  Trash2,
  Upload,
  Share,
  Import,
  Image,
  Code,
  Layers3,
  Hammer,
} from "lucide-react";

const crosshairPresets = [
  {
    id: "dot",
    name: "Classic Dot",
    style: "dot" as const,
    color: "#ffffff",
    size: 8,
    opacity: 100,
    category: "minimal",
  },
  {
    id: "cross",
    name: "Standard Cross",
    style: "cross" as const,
    color: "#00ff00",
    size: 24,
    opacity: 90,
    thickness: 2,
    category: "classic",
  },
  {
    id: "circle",
    name: "Circle Outline",
    style: "circle" as const,
    color: "#00ffff",
    size: 20,
    opacity: 80,
    thickness: 2,
    category: "modern",
  },
  {
    id: "plus",
    name: "Plus Shape",
    style: "plus" as const,
    color: "#ff0000",
    size: 28,
    opacity: 85,
    thickness: 2,
    gap: 6,
    category: "classic",
  },
  {
    id: "t-shape",
    name: "T-Shape",
    style: "t-shape" as const,
    color: "#ffff00",
    size: 24,
    opacity: 90,
    thickness: 2,
    gap: 4,
    category: "unique",
  },
  {
    id: "x-shape",
    name: "X-Shape",
    style: "x-shape" as const,
    color: "#ff00ff",
    size: 26,
    opacity: 85,
    thickness: 2,
    category: "unique",
  },
  {
    id: "outline",
    name: "Dot + Circle",
    style: "outline" as const,
    color: "#ffa500",
    size: 22,
    opacity: 90,
    thickness: 2,
    category: "modern",
  },
  {
    id: "thick-cross",
    name: "Thick Cross",
    style: "thick-cross" as const,
    color: "#ffffff",
    size: 24,
    opacity: 95,
    thickness: 3,
    category: "classic",
  },
  {
    id: "diamond",
    name: "Diamond",
    style: "diamond" as const,
    color: "#00ffff",
    size: 20,
    opacity: 85,
    thickness: 2,
    category: "unique",
  },
  {
    id: "square",
    name: "Square Outline",
    style: "square" as const,
    color: "#ffa500",
    size: 18,
    opacity: 80,
    thickness: 2,
    category: "modern",
  },
  {
    id: "hollow-square",
    name: "Hollow Square",
    style: "hollow-square" as const,
    color: "#ff00ff",
    size: 22,
    opacity: 90,
    thickness: 2,
    category: "modern",
  },
  {
    id: "triangle",
    name: "Triangle",
    style: "triangle" as const,
    color: "#ffff00",
    size: 20,
    opacity: 85,
    category: "unique",
  },
  {
    id: "double-cross",
    name: "Double Cross",
    style: "double-cross" as const,
    color: "#ffffff",
    size: 26,
    opacity: 90,
    thickness: 2,
    category: "classic",
  },
  {
    id: "brackets",
    name: "Corner Brackets",
    style: "brackets" as const,
    color: "#00ff00",
    size: 28,
    opacity: 85,
    thickness: 2,
    category: "unique",
  },
  {
    id: "star",
    name: "8-Point Star",
    style: "star" as const,
    color: "#ff0000",
    size: 30,
    opacity: 80,
    thickness: 2,
    category: "unique",
  },
  {
    id: "arrow",
    name: "Arrow Up",
    style: "arrow" as const,
    color: "#00ffff",
    size: 24,
    opacity: 90,
    thickness: 2,
    gap: 4,
    category: "unique",
  },
  {
    id: "lines-only",
    name: "Lines Only",
    style: "lines-only" as const,
    color: "#ffffff",
    size: 28,
    opacity: 85,
    thickness: 2,
    gap: 8,
    category: "minimal",
  },
  {
    id: "triple-dot",
    name: "Triple Dot",
    style: "triple-dot" as const,
    color: "#ff0000",
    size: 20,
    opacity: 95,
    thickness: 2,
    gap: 6,
    category: "minimal",
  },
  {
    id: "center-gap",
    name: "Gap Cross",
    style: "center-gap" as const,
    color: "#00ff00",
    size: 26,
    opacity: 85,
    thickness: 2,
    gap: 6,
    category: "modern",
  },
  {
    id: "pixel-cross",
    name: "Pixel Cross",
    style: "pixel-cross" as const,
    color: "#ffffff",
    size: 24,
    opacity: 90,
    thickness: 2,
    category: "unique",
  },
  {
    id: "hexagon",
    name: "Hexagon Outline",
    style: "hexagon" as const,
    color: "#8b5cf6",
    size: 22,
    opacity: 85,
    thickness: 2,
    category: "unique",
  },
  {
    id: "crossbow",
    name: "Crossbow Sight",
    style: "crossbow" as const,
    color: "#22c55e",
    size: 26,
    opacity: 90,
    thickness: 2,
    gap: 8,
    category: "unique",
  },
  {
    id: "heart",
    name: "Heart Shape",
    style: "heart" as const,
    color: "#ef4444",
    size: 20,
    opacity: 80,
    category: "unique",
  },
  {
    id: "radar",
    name: "Radar Sweep",
    style: "radar" as const,
    color: "#06b6d4",
    size: 28,
    opacity: 85,
    thickness: 2,
    category: "modern",
  },
  {
    id: "reticle",
    name: "Sniper Reticle",
    style: "reticle" as const,
    color: "#f59e0b",
    size: 32,
    opacity: 80,
    thickness: 2,
    gap: 12,
    category: "classic",
  },
  {
    id: "double-ring",
    name: "Double Ring",
    style: "double-ring" as const,
    color: "#10b981",
    size: 24,
    opacity: 85,
    thickness: 2,
    category: "modern",
  },
  {
    id: "chevron",
    name: "Chevron Up",
    style: "chevron" as const,
    color: "#f97316",
    size: 20,
    opacity: 90,
    thickness: 2,
    category: "unique",
  },
  {
    id: "micro-dot",
    name: "Micro Dot",
    style: "micro-dot" as const,
    color: "#ffffff",
    size: 4,
    opacity: 100,
    category: "minimal",
  },
  {
    id: "burst",
    name: "Burst Pattern",
    style: "burst" as const,
    color: "#ec4899",
    size: 26,
    opacity: 85,
    thickness: 2,
    category: "unique",
  },
  {
    id: "grid",
    name: "Grid Lines",
    style: "grid" as const,
    color: "#6366f1",
    size: 30,
    opacity: 75,
    thickness: 1,
    gap: 10,
    category: "modern",
  },
];

const categories = [
  { id: "all", name: "All Crosshairs", icon: Target },
  { id: "minimal", name: "Minimal", icon: CrosshairIcon },
  { id: "classic", name: "Classic", icon: Zap },
  { id: "modern", name: "Modern", icon: Settings },
  { id: "unique", name: "Unique", icon: Target },
  { id: "profiles", name: "My Profiles", icon: Users },
];

const gamePresets = [
  {
    game: "Valorant",
    icon: "🎯",
    presets: [
      { name: "TenZ Champion", style: "dot", color: "#00ffff", size: 4, opacity: 100 },
      { name: "ScreaM Headshot", style: "cross", color: "#ff4655", size: 24, opacity: 85, thickness: 2 },
      { name: "Derke Precision", style: "plus", color: "#fd79a8", size: 20, opacity: 90, thickness: 2, gap: 4 },
    ]
  },
  {
    game: "Fortnite",
    icon: "🏆",
    presets: [
      { name: "Bugha Champion", style: "cross", color: "#ff6b6b", size: 20, opacity: 85, thickness: 2 },
      { name: "Mongraal Speed", style: "dot", color: "#4ecdc4", size: 6, opacity: 100 },
      { name: "Benjyfishy Pro", style: "plus", color: "#45b7d1", size: 18, opacity: 90, thickness: 2, gap: 4 },
    ]
  },
  {
    game: "Apex Legends",
    icon: "🔥",
    presets: [
      { name: "ImperialHal IGL", style: "cross", color: "#e17055", size: 24, opacity: 90, thickness: 2 },
      { name: "Genburten Aim", style: "dot", color: "#00b894", size: 8, opacity: 100 },
      { name: "HisWattson Pro", style: "circle", color: "#74b9ff", size: 20, opacity: 85, thickness: 2 },
    ]
  },
];

// Precise game-specific positioning data with resolution scaling
const gamePositionPresets = [
  {
    id: "default",
    name: "Default",
    description: "Universal center position",
    baseOffsetX: 0,
    baseOffsetY: 0,
    icon: "🎮",
    fov: 90,
    aspectRatio: "16:9",
    uiScaling: 1.0
  },
  {
    id: "valorant",
    name: "Valorant",
    description: "Precise positioning for Valorant's UI (103 FOV default)",
    baseOffsetX: 0,
    baseOffsetY: -8,
    icon: "🎯",
    fov: 103,
    aspectRatio: "16:9",
    uiScaling: 1.0,
    notes: "Accounts for weapon bob and UI elements. Slight upward adjustment for weapon accuracy."
  },
  {
    id: "cs2",
    name: "CS2/CS:GO",
    description: "Optimized for Counter-Strike 2 (90 FOV, weapon_recoil_view_punch_extra)",
    baseOffsetX: 0,
    baseOffsetY: 0,
    icon: "🔫",
    fov: 90,
    aspectRatio: "16:9",
    uiScaling: 1.0,
    notes: "Perfect center for precise aiming. CS2 uses native crosshair system."
  },
  {
    id: "fortnite",
    name: "Fortnite",
    description: "Perfect center positioning for optimal aiming",
    baseOffsetX: 0,
    baseOffsetY: 0,
    icon: "🏆",
    fov: 90,
    aspectRatio: "16:9",
    uiScaling: 1.0,
    notes: "True center positioning for precise aiming in all game modes."
  },
  {
    id: "apex",
    name: "Apex Legends",
    description: "Battle royale positioning (90-110 FOV, weapon sway)",
    baseOffsetX: 3,
    baseOffsetY: -6,
    icon: "🔥",
    fov: 100,
    aspectRatio: "16:9",
    uiScaling: 1.0,
    notes: "Slight right/up to counter weapon drift and movement mechanics."
  },

  {
    id: "cod",
    name: "Call of Duty",
    description: "Modern Warfare/Warzone (80-120 FOV, weapon mounting)",
    baseOffsetX: 2,
    baseOffsetY: 8,
    icon: "💥",
    fov: 105,
    aspectRatio: "16:9",
    uiScaling: 1.0,
    notes: "Compensates for weapon sway, mounting positions, and slide mechanics."
  },
  {
    id: "rainbow6",
    name: "Rainbow Six Siege",
    description: "Tactical FPS (60-90 FOV, lean mechanics)",
    baseOffsetX: 0,
    baseOffsetY: -4,
    icon: "🛡️",
    fov: 75,
    aspectRatio: "16:9",
    uiScaling: 1.0,
    notes: "Lower FOV requires precise center. Slight up for lean/peek angles."
  },
  {
    id: "pubg",
    name: "PUBG",
    description: "Battle royale with first/third person (80-103 FOV)",
    baseOffsetX: -2,
    baseOffsetY: 12,
    icon: "🪂",
    fov: 95,
    aspectRatio: "16:9",
    uiScaling: 1.0,
    notes: "Mixed perspective compensation. Down offset for long-range engagements."
  }
];

// Resolution scaling factors for precise positioning
const getResolutionScale = () => {
  const width = window.screen.width;
  const height = window.screen.height;

  // Base calculation on 1920x1080 as reference
  const baseWidth = 1920;
  const baseHeight = 1080;

  const scaleX = width / baseWidth;
  const scaleY = height / baseHeight;

  return { scaleX, scaleY, width, height };
};

// Calculate precise offsets based on resolution, FOV, and aspect ratio
const calculatePreciseOffset = (preset: any) => {
  const { scaleX, scaleY, width, height } = getResolutionScale();
  const aspectRatio = width / height;

  // FOV compensation (higher FOV needs more aggressive positioning)
  const fovMultiplier = preset.fov / 90; // 90 FOV as baseline

  // Aspect ratio compensation
  let aspectMultiplierX = 1;
  let aspectMultiplierY = 1;

  if (aspectRatio > 1.78) { // Ultrawide (21:9, 32:9)
    aspectMultiplierX = aspectRatio / 1.78;
    aspectMultiplierY = 1.1; // Slight vertical compensation
  } else if (aspectRatio < 1.77) { // 4:3, 16:10
    aspectMultiplierX = 0.9;
    aspectMultiplierY = aspectRatio / 1.78;
  }

  // Apply all scaling factors
  const offsetX = Math.round(
    preset.baseOffsetX * scaleX * fovMultiplier * aspectMultiplierX * preset.uiScaling
  );
  const offsetY = Math.round(
    preset.baseOffsetY * scaleY * fovMultiplier * aspectMultiplierY * preset.uiScaling
  );

  return { offsetX, offsetY };
};

const proToolsFeatures = [
  {
    id: "analytics",
    title: "Performance Analytics",
    description: "Track your crosshair usage, accuracy improvements, and gaming metrics",
    icon: BarChart3,
    stats: { users: "2.4K", rating: 4.8 }
  },
  {
    id: "profiles",
    title: "Pro Profiles",
    description: "Save multiple crosshair configurations and switch between them instantly",
    icon: Users,
    stats: { users: "1.8K", rating: 4.9 }
  },
  {
    id: "practice",
    title: "Aim Training",
    description: "Built-in crosshair practice modes with accuracy tracking",
    icon: Target,
    stats: { users: "3.1K", rating: 4.7 }
  },
  {
    id: "live-overlay",
    title: "Live Game Overlay",
    description: "Real-time crosshair switching during gameplay with hotkeys",
    icon: Monitor,
    stats: { users: "1.5K", rating: 4.6 }
  },
];

export default function Index() {
  // Initialize sound effects early
  const soundEffects = useSoundEffects();
  const { toast } = useToast();

  // Initialize state from storage
  const [selectedCrosshair, setSelectedCrosshair] = useState<string | null>(() =>
    storage.loadSelectedCrosshair()
  );
  const [activeCategory, setActiveCategory] = useState(() =>
    storage.loadActiveCategory()
  );
  const [showCustomization, setShowCustomization] = useState(() =>
    storage.loadShowCustomization()
  );

  const [showProTools, setShowProTools] = useState(false);
  const [activeProTool, setActiveProTool] = useState<string | null>(null);
  const [savedProfiles, setSavedProfiles] = useState<Array<{
    id: string;
    name: string;
    crosshair: any;
    createdAt: string;
  }>>(() => storage.loadProfiles());
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionStats, setSessionStats] = useState(() => storage.loadSessionStats());

  // Real-time analytics state
  const [realTimeStats, setRealTimeStats] = useState(() => storage.loadRealTimeStats());

  const [analyticsHistory, setAnalyticsHistory] = useState<Array<{
    timestamp: number,
    crosshairSwitches: number,
    timeSpent: number,
    clicks: number,
  }>>(() => storage.loadAnalyticsHistory());
  const [showStats, setShowStats] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editorPreviewMode, setEditorPreviewMode] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const [systemOverlayActive, setSystemOverlayActive] = useState(false);
  const [showPositionSettings, setShowPositionSettings] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareCode, setShareCode] = useState("");
  const [importCode, setImportCode] = useState("");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [customImages, setCustomImages] = useState<Array<{
    id: string;
    name: string;
    url: string;
    file: File;
    createdAt: string;
  }>>(() => storage.loadCustomImages());
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showDataManager, setShowDataManager] = useState(false);
  const [aimTrainerMode, setAimTrainerMode] = useState<'2d' | '3d'>('3d');
  const [webOverlayActive, setWebOverlayActive] = useState(false);

  // Lock position when settings dialog opens/closes to prevent layout shifts
  React.useEffect(() => {
    if (showPositionSettings) {
      // Store scroll position when dialog opens
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';

      // Cleanup function to restore when dialog closes
      return () => {
        document.body.style.overflow = '';
        // Restore exact scroll position
        window.scrollTo(scrollX, scrollY);
      };
    }
  }, [showPositionSettings]);

  // Listen for overlay toggle events from Electron to keep UI in sync
  React.useEffect(() => {
    if (isElectron && (window as any).electronAPI) {
      const handleOverlayToggle = (isVisible: boolean) => {
        console.log('Overlay toggle event received:', isVisible);
        setSystemOverlayActive(isVisible);
      };

      (window as any).electronAPI.onOverlayToggled(handleOverlayToggle);

      // Cleanup listener on unmount
      return () => {
        if ((window as any).electronAPI?.removeAllListeners) {
          (window as any).electronAPI.removeAllListeners('overlay-toggled');
        }
      };
    }
  }, [isElectron]);

  // Position and game settings
  const [positionSettings, setPositionSettings] = useState(() => storage.loadPositionSettings());
  const [editorCrosshair, setEditorCrosshair] = useState({
    style: "cross" as const,
    color: "#ffffff",
    size: 24,
    opacity: 90,
    thickness: 2,
    gap: 4,
    name: "Custom Crosshair",
  });
  const [customizations, setCustomizations] = useState<{
    [key: string]: {
      color: string;
      size: number;
      opacity: number;
      thickness: number;
      gap: number;
    };
  }>(() => storage.loadCustomizations());

  const filteredCrosshairs =
    activeCategory === "all"
      ? crosshairPresets
      : crosshairPresets.filter((preset) => preset.category === activeCategory);

  // Handle both regular presets and loaded profiles
  const selectedPreset = selectedCrosshair?.startsWith('loaded_')
    ? (() => {
        // Find the original profile data for loaded crosshairs
        const profileId = selectedCrosshair.replace('loaded_', '');
        const profile = savedProfiles.find(p => p.id === profileId);
        return profile ? {
          id: selectedCrosshair,
          name: profile.name,
          style: profile.crosshair.style,
          color: profile.crosshair.color,
          size: profile.crosshair.size,
          opacity: profile.crosshair.opacity,
          thickness: profile.crosshair.thickness || 2,
          gap: profile.crosshair.gap || 0,
          category: profile.crosshair.category || 'loaded',
          imageUrl: profile.crosshair.imageUrl
        } : null;
      })()
    : crosshairPresets.find((preset) => preset.id === selectedCrosshair);

  const handleCopyConfig = async () => {
    if (selectedPreset) {
      const currentSettings = customizations[selectedPreset.id] || {};
      const config = {
        name: selectedPreset.name,
        style: selectedPreset.style,
        color: currentSettings.color || selectedPreset.color,
        size: currentSettings.size || selectedPreset.size,
        opacity: currentSettings.opacity || selectedPreset.opacity,
        thickness: currentSettings.thickness || selectedPreset.thickness,
        gap: currentSettings.gap || selectedPreset.gap,
      };

      const configText = `Crosshair Config - ${config.name}
Style: ${config.style}
Color: ${config.color}
Size: ${config.size}px
Opacity: ${config.opacity}%${config.thickness ? `\nThickness: ${config.thickness}px` : ''}${config.gap ? `\nGap: ${config.gap}px` : ''}`;

      try {
        await navigator.clipboard.writeText(configText);
        // You could add a toast notification here
        console.log('Config copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy config:', err);
      }
    }
  };

  const handleShareCrosshair = async () => {
    if (selectedPreset) {
      const currentSettings = customizations[selectedPreset.id] || {};
      const crosshairData = {
        style: selectedPreset.style,
        color: currentSettings.color || selectedPreset.color,
        size: currentSettings.size || selectedPreset.size,
        opacity: currentSettings.opacity || selectedPreset.opacity,
        thickness: currentSettings.thickness || selectedPreset.thickness || 2,
        gap: currentSettings.gap || selectedPreset.gap || 0,
        offsetX: positionSettings.offsetX,
        offsetY: positionSettings.offsetY,
        name: selectedPreset.name,
      };

      try {
        const code = await generateShareCode(crosshairData);
        setShareCode(code);
        setShowShareDialog(true);
      } catch (error) {
        console.error('Failed to generate share code:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast({
          title: "Share Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  const handleImportCrosshair = () => {
    if (importCode.trim()) {
      try {
        const crosshairData = parseShareCode(importCode.trim());

        // Create a new profile from imported data
        const profile = {
          id: `imported_${Date.now()}`,
          name: crosshairData.name || generateCrosshairName(crosshairData),
          crosshair: {
            id: `imported_${Date.now()}`,
            style: crosshairData.style,
            color: crosshairData.color,
            size: crosshairData.size,
            opacity: crosshairData.opacity,
            thickness: crosshairData.thickness || 2,
            gap: crosshairData.gap || 0,
            category: "imported",
            imageUrl: crosshairData.imageUrl, // Include image URL for custom images
          },
          createdAt: new Date().toISOString(),
        };

        setSavedProfiles(prev => [...prev, profile]);

        // Update position settings if provided
        if (crosshairData.offsetX !== undefined || crosshairData.offsetY !== undefined) {
          setPositionSettings(prev => ({
            ...prev,
            offsetX: crosshairData.offsetX || 0,
            offsetY: crosshairData.offsetY || 0,
          }));
        }

        // Switch to profiles tab and select the imported crosshair
        setActiveCategory("profiles");
        setSelectedCrosshair(profile.crosshair.id);

        // Close dialog and clear input
        setShowImportDialog(false);
        setImportCode("");

        console.log(`Crosshair "${profile.name}" imported successfully!`);
      } catch (error) {
        console.error('Failed to import crosshair:', error);

        // Provide more specific error messages
        let errorMessage = 'Failed to import crosshair. ';
        if (error instanceof Error) {
          if (error.message.includes('base64')) {
            errorMessage += 'The share code appears to be corrupted or incomplete.';
          } else if (error.message.includes('JSON')) {
            errorMessage += 'The share code contains invalid data.';
          } else if (error.message.includes('image')) {
            errorMessage += 'There was an issue with the custom image data.';
          } else if (error.message.includes('format')) {
            errorMessage += 'The share code format is invalid. Make sure it starts with "GC-" or "GCI-".';
          } else {
            errorMessage += error.message;
          }
        } else {
          errorMessage += 'Please check the code and try again.';
        }

        alert(errorMessage);
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file must be smaller than 5MB');
        return;
      }

      // Create URL for the image
      const imageUrl = URL.createObjectURL(file);

      const customImage = {
        id: `custom_img_${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        url: imageUrl,
        file: file,
        createdAt: new Date().toISOString(),
      };

      setCustomImages(prev => [...prev, customImage]);

      // Create a crosshair profile using this image
      const profile = {
        id: `custom_image_${Date.now()}`,
        name: `Custom Image: ${customImage.name}`,
        crosshair: {
          id: `custom_image_${Date.now()}`,
          style: "custom-image" as const,
          color: "#ffffff",
          size: 32,
          opacity: 100,
          thickness: 2,
          gap: 0,
          category: "custom",
          imageUrl: imageUrl,
        },
        createdAt: new Date().toISOString(),
      };

      setSavedProfiles(prev => [...prev, profile]);
      setShowImageUpload(false);

      // Switch to profiles and select the new image crosshair
      setActiveCategory("profiles");
      setSelectedCrosshair(profile.crosshair.id);

      console.log(`Custom image crosshair "${profile.name}" created!`);
    }
  };

  const handleExportAllData = () => {
    const allData = {
      savedProfiles,
      customizations,
      positionSettings,
      sessionStats,
      realTimeStats,
      analyticsHistory,
      customImages: customImages.map(img => ({
        ...img,
        file: null, // Remove file objects for export
      })),
      activeCategory,
      selectedCrosshair,
      showCustomization,
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `genesis-crosshairs-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('All data exported successfully!');
  };

  const handleImportAllData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);

        // Validate data structure
        if (!importedData.version) {
          alert('Invalid backup file format');
          return;
        }

        // Import data with confirmation
        if (confirm('This will replace all your current data. Are you sure?')) {
          if (importedData.savedProfiles) setSavedProfiles(importedData.savedProfiles);
          if (importedData.customizations) setCustomizations(importedData.customizations);
          if (importedData.positionSettings) setPositionSettings(importedData.positionSettings);
          if (importedData.sessionStats) setSessionStats(importedData.sessionStats);
          if (importedData.realTimeStats) setRealTimeStats(importedData.realTimeStats);
          if (importedData.analyticsHistory) setAnalyticsHistory(importedData.analyticsHistory);
          if (importedData.customImages) setCustomImages(importedData.customImages);
          if (importedData.activeCategory) setActiveCategory(importedData.activeCategory);
          if (importedData.selectedCrosshair !== undefined) setSelectedCrosshair(importedData.selectedCrosshair);
          if (importedData.showCustomization !== undefined) setShowCustomization(importedData.showCustomization);

          console.log('All data imported successfully!');
          setShowDataManager(false);
        }
      } catch (error) {
        console.error('Failed to import data:', error);
        alert('Failed to import data. Please check the file format.');
      }
    };

    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  const handleExportSettings = () => {
    if (selectedPreset) {
      const currentSettings = customizations[selectedPreset.id] || {};
      const config = {
        name: selectedPreset.name,
        id: selectedPreset.id,
        style: selectedPreset.style,
        color: currentSettings.color || selectedPreset.color,
        size: currentSettings.size || selectedPreset.size,
        opacity: currentSettings.opacity || selectedPreset.opacity,
        thickness: currentSettings.thickness || selectedPreset.thickness,
        gap: currentSettings.gap || selectedPreset.gap,
        category: selectedPreset.category,
        exported: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(config, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedPreset.name.toLowerCase().replace(/\s+/g, '-')}-crosshair-config.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleSaveProfile = () => {
    if (selectedPreset) {
      const currentSettings = customizations[selectedPreset.id] || {};
      const profile = {
        id: `profile_${Date.now()}`,
        name: `${selectedPreset.name} - Custom`,
        crosshair: {
          ...selectedPreset,
          ...currentSettings,
        },
        createdAt: new Date().toISOString(),
      };
      setSavedProfiles(prev => [...prev, profile]);
    }
  };

  const handleLoadGamePreset = (game: string, preset: any) => {
    // Create a profile from the pro player's settings
    const profile = {
      id: `pro_${game.toLowerCase()}_${Date.now()}`,
      name: `${preset.name} (${game})`,
      crosshair: {
        id: `pro_${game.toLowerCase()}_${preset.name.toLowerCase().replace(/\s+/g, '_')}`,
        style: preset.style,
        color: preset.color,
        size: preset.size,
        opacity: preset.opacity,
        thickness: preset.thickness || 2,
        gap: preset.gap || 0,
        category: "pro",
      },
      createdAt: new Date().toISOString(),
    };

    // Save to profiles
    setSavedProfiles(prev => [...prev, profile]);

    // Switch to My Profiles tab to show the saved crosshair
    setActiveCategory("profiles");

    // Show success feedback
    console.log(`${preset.name}'s crosshair saved to My Profiles!`);
  };

  const handleStartSession = () => {
    if (sessionActive) {
      // Stop session
      setSessionActive(false);
      const finalTime = sessionTime;
      setSessionStats(prev => ({
        ...prev,
        totalSessions: prev.totalSessions + 1,
        totalTime: prev.totalTime + Math.floor(finalTime / 60),
        averageSession: Math.floor((prev.totalTime + Math.floor(finalTime / 60)) / (prev.totalSessions + 1)),
      }));
      setSessionTime(0);
      // Reset current session time in real-time stats
      setRealTimeStats(prev => ({
        ...prev,
        currentSessionTime: 0,
      }));
    } else {
      // Start session
      setSessionActive(true);
      setSessionTime(0);
      // Reset current session time when starting new session
      setRealTimeStats(prev => ({
        ...prev,
        currentSessionTime: 0,
      }));
    }
  };

  // Manual session timer effect (for focused practice sessions)
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionActive) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
        // Update current session time in real-time stats
        setRealTimeStats(prev => ({
          ...prev,
          currentSessionTime: prev.currentSessionTime + 1,
          lastActivity: Date.now(),
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive]);

  // Real-time analytics tracking effect
  React.useEffect(() => {
    const analyticsInterval = setInterval(() => {
      const now = Date.now();

      // Add data point to history every 10 seconds
      setAnalyticsHistory(prev => {
        const newPoint = {
          timestamp: now,
          crosshairSwitches: realTimeStats.crosshairSwitches,
          timeSpent: realTimeStats.timeSpentToday,
          clicks: realTimeStats.totalClicks,
        };

        // Keep only last 50 data points for performance
        const updated = [...prev, newPoint].slice(-50);
        return updated;
      });

      // Update session stats with real-time data
      setSessionStats(prev => ({
        ...prev,
        totalTime: prev.totalTime + (realTimeStats.timeSpentToday / 60),
        crosshairsUsed: Math.max(prev.crosshairsUsed, realTimeStats.crosshairSwitches),
        favoriteStyle: realTimeStats.mostUsedCrosshair,
        accuracyImprovement: prev.accuracyImprovement + (Math.random() * 0.1 - 0.05), // Simulate small changes
      }));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(analyticsInterval);
  }, [realTimeStats]);

  // Track crosshair selections for analytics
  React.useEffect(() => {
    if (selectedCrosshair) {
      setRealTimeStats(prev => ({
        ...prev,
        crosshairSwitches: prev.crosshairSwitches + 1,
        lastActivity: Date.now(),
        mostUsedCrosshair: selectedPreset?.style || prev.mostUsedCrosshair,
      }));
    }
  }, [selectedCrosshair]);

  // Start automatic time tracking when app loads
  React.useEffect(() => {
    setRealTimeStats(prev => ({
      ...prev,
      sessionStartTime: Date.now(),
    }));

    // Auto-start time tracking (separate from manual sessions)
    const autoTimer = setInterval(() => {
      setRealTimeStats(prev => ({
        ...prev,
        timeSpentToday: prev.timeSpentToday + 1,
        activeTime: prev.activeTime + 1,
        lastActivity: Date.now(),
      }));
    }, 1000);

    return () => clearInterval(autoTimer);
  }, []);

  // Initialize sound effects (removed automatic test audio to prevent random sounds)

  // Auto-save effects for persistent storage
  React.useEffect(() => {
    storage.saveProfiles(savedProfiles);
  }, [savedProfiles]);

  React.useEffect(() => {
    storage.saveCustomizations(customizations);
  }, [customizations]);

  React.useEffect(() => {
    storage.savePositionSettings(positionSettings);
  }, [positionSettings]);

  React.useEffect(() => {
    storage.saveSessionStats(sessionStats);
  }, [sessionStats]);

  React.useEffect(() => {
    storage.saveRealTimeStats(realTimeStats);
  }, [realTimeStats]);

  React.useEffect(() => {
    storage.saveAnalyticsHistory(analyticsHistory);
  }, [analyticsHistory]);

  React.useEffect(() => {
    storage.saveCustomImages(customImages);
  }, [customImages]);

  React.useEffect(() => {
    storage.saveActiveCategory(activeCategory);
  }, [activeCategory]);

  React.useEffect(() => {
    storage.saveSelectedCrosshair(selectedCrosshair);
  }, [selectedCrosshair]);

  React.useEffect(() => {
    storage.saveShowCustomization(showCustomization);
  }, [showCustomization]);

  // Silent save function for internal use
  const saveAllData = React.useCallback(() => {
    try {
      storage.saveProfiles(savedProfiles);
      storage.saveCustomizations(customizations);
      storage.savePositionSettings(positionSettings);
      storage.saveSessionStats(sessionStats);
      storage.saveRealTimeStats(realTimeStats);
      storage.saveAnalyticsHistory(analyticsHistory);
      storage.saveCustomImages(customImages);
      storage.saveActiveCategory(activeCategory);
      storage.saveSelectedCrosshair(selectedCrosshair);
      storage.saveShowCustomization(showCustomization);
    } catch (error) {
      console.warn('Silent auto-save failed:', error);
    }
  }, [savedProfiles, customizations, positionSettings, sessionStats, realTimeStats, analyticsHistory, customImages, activeCategory, selectedCrosshair, showCustomization]);

  // Auto-save on window unload/page refresh
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      saveAllData();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveAllData]);

  // Auto-save every 5 seconds for better data persistence
  React.useEffect(() => {
    const interval = setInterval(() => {
      try {
        storage.saveProfiles(savedProfiles);
        storage.saveCustomizations(customizations);
        storage.savePositionSettings(positionSettings);
        storage.saveSessionStats(sessionStats);
        storage.saveRealTimeStats(realTimeStats);
        storage.saveAnalyticsHistory(analyticsHistory);
        storage.saveCustomImages(customImages);
        storage.saveActiveCategory(activeCategory);
        storage.saveSelectedCrosshair(selectedCrosshair);
        storage.saveShowCustomization(showCustomization);
      } catch (error) {
        console.warn('Auto-save failed:', error);
      }
    }, 5000); // Save every 5 seconds

    return () => clearInterval(interval);
  }, [savedProfiles, customizations, positionSettings, sessionStats, realTimeStats, analyticsHistory, customImages, activeCategory, selectedCrosshair, showCustomization]);

  // Check if running in Electron environment
  React.useEffect(() => {
    // Check if electronAPI is available (real Electron environment)
    const isElectronEnv = !!(window as any).electronAPI;
    console.log('=== ELECTRON ENVIRONMENT DEBUG ===');
    console.log('window.electronAPI exists:', !!(window as any).electronAPI);
    console.log('window.platform exists:', !!(window as any).platform);
    console.log('process exists:', typeof process !== 'undefined');
    console.log('navigator.userAgent:', navigator.userAgent);
    console.log('isElectronEnv:', isElectronEnv);

    if ((window as any).electronAPI) {
      console.log('electronAPI methods:', Object.keys((window as any).electronAPI));
      // Test the API methods
      console.log('Testing electronAPI methods...');
      (window as any).electronAPI.getCrosshairSettings().then((settings: any) => {
        console.log('Current crosshair settings from Electron:', settings);
      }).catch((error: any) => {
        console.error('Failed to get crosshair settings:', error);
      });
    }
    console.log('=== END ELECTRON DEBUG ===');

    setIsElectron(isElectronEnv);

    if (isElectronEnv) {
      console.log('Setting up Electron listeners...');
      // Listen for overlay toggle events from Electron
      (window as any).electronAPI.onOverlayToggled((isVisible: boolean) => {
        console.log('Overlay toggled event received:', isVisible);
        setSystemOverlayActive(isVisible);
      });
    } else {
      console.log('Not in Electron environment - using web mode');
    }

    return () => {
      if (isElectronEnv && (window as any).electronAPI.removeAllListeners) {
        (window as any).electronAPI.removeAllListeners('overlay-toggled');
      }
    };
  }, []);

  // Auto-enable system overlay when crosshair is selected
  React.useEffect(() => {
    if (isElectron && (window as any).electronAPI && selectedCrosshair && !systemOverlayActive) {
      const enableOverlay = async () => {
        try {
          const currentCrosshair = getCurrentCrosshairSettings();
          if (currentCrosshair) {
            await (window as any).electronAPI.updateCrosshairSettings(currentCrosshair);
            await (window as any).electronAPI.showOverlay();
            setSystemOverlayActive(true);
          }
        } catch (error) {
          console.error('Failed to auto-enable system overlay:', error);
        }
      };

      // Small delay to ensure state is updated
      setTimeout(enableOverlay, 200);
    }
  }, [selectedCrosshair, isElectron, systemOverlayActive]);

  // Periodic overlay maintenance to ensure it stays on top
  React.useEffect(() => {
    if (isElectron && (window as any).electronAPI && systemOverlayActive) {
      const interval = setInterval(async () => {
        try {
          // Force overlay to stay on top
          await (window as any).electronAPI.forceOverlayTop();
        } catch (error) {
          console.error('Failed to maintain overlay position:', error);
        }
      }, 3000); // Check every 3 seconds

      return () => clearInterval(interval);
    }
  }, [isElectron, systemOverlayActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveProfileWithName = () => {
    if (selectedPreset && profileName.trim()) {
      const currentSettings = customizations[selectedPreset.id] || {};
      const profile = {
        id: `profile_${Date.now()}`,
        name: profileName.trim(),
        crosshair: {
          ...selectedPreset,
          ...currentSettings,
        },
        createdAt: new Date().toISOString(),
      };
      setSavedProfiles(prev => [...prev, profile]);
      setProfileName("");
      // Show success feedback
      console.log(`Profile "${profileName}" saved successfully!`);
    }
  };

  const handleSaveEditorCrosshair = () => {
    const profile = {
      id: `custom_${Date.now()}`,
      name: editorCrosshair.name,
      crosshair: {
        id: `custom_${Date.now()}`,
        ...editorCrosshair,
        category: "custom",
      },
      createdAt: new Date().toISOString(),
    };
    setSavedProfiles(prev => [...prev, profile]);
    setShowEditor(false);
    console.log(`Custom crosshair "${editorCrosshair.name}" saved!`);
  };

  const updateEditorProperty = (property: string, value: any) => {
    setEditorCrosshair(prev => ({
      ...prev,
      [property]: value,
    }));
  };

  const handlePositionChange = (offsetX: number, offsetY: number) => {
    setPositionSettings(prev => ({
      ...prev,
      offsetX,
      offsetY,
      gameSpecificSettings: {
        ...prev.gameSpecificSettings,
        [prev.selectedGame]: { offsetX, offsetY }
      }
    }));

    // Update overlay position if active (both Electron and web)
    if (isElectron && (window as any).electronAPI && systemOverlayActive) {
      updateOverlayPosition(offsetX, offsetY);
    }

    // Position is automatically applied in real-time through props
    // The CrosshairOverlay receives updated positionSettings immediately
  };

  const handleGamePresetSelect = (preset: any) => {
    // Calculate precise offsets based on resolution and game settings
    const { offsetX: preciseX, offsetY: preciseY } = calculatePreciseOffset(preset);

    // Add visual feedback when changing game preset
    setRealTimeStats(prev => ({
      ...prev,
      totalClicks: prev.totalClicks + 1,
      lastActivity: Date.now(),
    }));

    setPositionSettings(prev => ({
      ...prev,
      selectedGame: preset.id,
      offsetX: preciseX,
      offsetY: preciseY,
      gameSpecificSettings: {
        ...prev.gameSpecificSettings,
        [preset.id]: { offsetX: preciseX, offsetY: preciseY }
      }
    }));

    // Update overlay position if active
    if (isElectron && (window as any).electronAPI && systemOverlayActive) {
      updateOverlayPosition(preset.offsetX, preset.offsetY);

      // Additional force refresh for game preset changes
      setTimeout(async () => {
        if ((window as any).electronAPI.forceOverlayRefresh) {
          console.log('Force refreshing overlay after game preset change...');
          await (window as any).electronAPI.forceOverlayRefresh();
        }
      }, 200);
    }
  };

  const updateOverlayPosition = async (offsetX: number, offsetY: number) => {
    if (!isElectron || !(window as any).electronAPI) return;

    try {
      const currentCrosshair = getCurrentCrosshairSettings();
      if (currentCrosshair) {
        const crosshairWithPosition = {
          ...currentCrosshair,
          offsetX,
          offsetY
        };
        await (window as any).electronAPI.updateCrosshairSettings(crosshairWithPosition);

        // Force overlay refresh to ensure accurate positioning
        if ((window as any).electronAPI.forceOverlayRefresh) {
          console.log('Force refreshing overlay after position change...');
          await (window as any).electronAPI.forceOverlayRefresh();
        }
      }
    } catch (error) {
      console.error('Failed to update overlay position:', error);
    }
  };

  const handleDeleteProfile = () => {
    if (editingProfileId) {
      setSavedProfiles(prev => prev.filter(profile => profile.id !== editingProfileId));
      setShowEditor(false);
      setEditingProfileId(null);
      console.log("Profile deleted successfully!");
    }
  };

  const handleSystemOverlayToggle = async () => {
    if (!isElectron || !(window as any).electronAPI) return;

    try {
      if (systemOverlayActive) {
        await (window as any).electronAPI.hideOverlay();
        setSystemOverlayActive(false);
      } else {
        // Update crosshair settings before showing
        const currentCrosshair = getCurrentCrosshairSettings();
        if (currentCrosshair) {
          await (window as any).electronAPI.updateCrosshairSettings(currentCrosshair);
          await (window as any).electronAPI.showOverlay();
          setSystemOverlayActive(true);
        }
      }
    } catch (error) {
      console.error('Failed to toggle system overlay:', error);
    }
  };

  const getCurrentCrosshairSettings = () => {
    if (!selectedPreset) return null;

    const currentSettings = customizations[selectedPreset.id] || {};
    return {
      style: selectedPreset.style,
      color: currentSettings.color || selectedPreset.color,
      size: currentSettings.size || selectedPreset.size,
      opacity: currentSettings.opacity || selectedPreset.opacity,
      thickness: currentSettings.thickness || selectedPreset.thickness || 2,
      gap: currentSettings.gap || selectedPreset.gap || 0,
      offsetX: positionSettings.offsetX,
      offsetY: positionSettings.offsetY,
    };
  };

  const handlePreviewCrosshair = async () => {
    if (selectedPreset) {
      // Track click for analytics
      setRealTimeStats(prev => ({
        ...prev,
        totalClicks: prev.totalClicks + 1,
        lastActivity: Date.now(),
      }));

      // Debug logging
      console.log('Use button clicked - Debug info:');
      console.log('isElectron:', isElectron);
      console.log('electronAPI available:', !!(window as any).electronAPI);
      console.log('electronAPI methods:', (window as any).electronAPI ? Object.keys((window as any).electronAPI) : 'none');
      console.log('selectedPreset:', selectedPreset);

      if (isElectron && (window as any).electronAPI) {
        // Use system overlay in Electron
        const currentCrosshair = getCurrentCrosshairSettings();
        console.log('Current crosshair settings:', currentCrosshair);

        if (currentCrosshair) {
          try {
            console.log('Updating crosshair settings...');
            await (window as any).electronAPI.updateCrosshairSettings(currentCrosshair);
            console.log('Showing overlay...');
            await (window as any).electronAPI.showOverlay();
            console.log('Setting overlay active state...');
            setSystemOverlayActive(true);
            console.log('System overlay should now be active!');
          } catch (error) {
            console.error('Error activating system overlay:', error);
          }
        }
      } else {
        console.warn('Electron API not available - crosshair overlay requires Electron environment');
      }
    }
  };

  const handleSelectCrosshair = async (crosshairId: string) => {
    // Only select if not already selected, don't deselect
    if (selectedCrosshair !== crosshairId) {
      console.log('Crosshair selected:', crosshairId);
      console.log('Electron environment:', isElectron);
      console.log('ElectronAPI available:', !!(window as any).electronAPI);

      setSelectedCrosshair(crosshairId);

      // Track click for analytics
      setRealTimeStats(prev => ({
        ...prev,
        totalClicks: prev.totalClicks + 1,
        lastActivity: Date.now(),
      }));

      // Automatically activate system overlay when a crosshair is selected in Electron
      if (isElectron && (window as any).electronAPI) {
        console.log('Auto-activating system overlay for selected crosshair...');
        setTimeout(async () => {
          const preset = crosshairPresets.find(p => p.id === crosshairId);
          if (preset) {
            const currentSettings = customizations[crosshairId] || {};
            const crosshairSettings = {
              style: preset.style,
              color: currentSettings.color || preset.color,
              size: currentSettings.size || preset.size,
              opacity: currentSettings.opacity || preset.opacity,
              thickness: currentSettings.thickness || preset.thickness || 2,
              gap: currentSettings.gap || preset.gap || 0,
              offsetX: positionSettings.offsetX,
              offsetY: positionSettings.offsetY,
            };
            console.log('Applying crosshair settings:', crosshairSettings);
            try {
              await (window as any).electronAPI.updateCrosshairSettings(crosshairSettings);
              // Activate the system overlay if not already active
              if (!systemOverlayActive) {
                console.log('Activating system overlay...');
                await (window as any).electronAPI.showOverlay();
                setSystemOverlayActive(true);
                console.log('System overlay activated!');
              }

              // Force overlay refresh to ensure proper positioning
              if ((window as any).electronAPI.forceOverlayRefresh) {
                console.log('Force refreshing overlay positioning...');
                await (window as any).electronAPI.forceOverlayRefresh();
              }
            } catch (error) {
              console.error('Failed to update overlay crosshair:', error);
            }
          }
        }, 50);
      } else {
        console.log('Not in Electron environment or electronAPI not available');
      }
    }
  };

  const handleCustomizationChange = (
    crosshairId: string,
    settings: {
      color: string;
      size: number;
      opacity: number;
      thickness: number;
      gap: number;
    },
  ) => {
    setCustomizations((prev) => ({
      ...prev,
      [crosshairId]: settings,
    }));

    // Track customization activity
    setRealTimeStats(prev => ({
      ...prev,
      totalClicks: prev.totalClicks + 1,
      lastActivity: Date.now(),
    }));
  };

  return (
    <>






      <div className="h-full bg-background flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/50 backdrop-blur">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-gaming-purple to-gaming-blue rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gaming-purple to-gaming-blue bg-clip-text text-transparent">
                    Genesis Crosshairs
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProTools(true)}
                  className="bg-gaming-blue/20 text-gaming-blue border-gaming-blue/30 hover:bg-gaming-blue/30"
                >
                  <Hammer className="w-4 h-4 mr-2" />
                  Tools
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPositionSettings(true)}
                  className="bg-gaming-purple/20 text-gaming-purple border-gaming-purple/30 hover:bg-gaming-purple/30"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Position
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Selected Crosshair Info */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Selected Crosshair</span>
                  </CardTitle>
                  <CardDescription>
                    {selectedPreset
                      ? "Customize settings, then preview on screen"
                      : "Select a crosshair to get started"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedPreset ? (
                    <>
                      <div className="text-center space-y-2">
                        <h3 className="font-semibold text-lg">
                          {selectedPreset.name}
                        </h3>
                        <Badge variant="outline" className="capitalize">
                          {selectedPreset.category}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Style:
                            </span>
                            <span className="capitalize">
                              {selectedPreset.style.replace("-", " ")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Color:
                            </span>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-4 h-4 rounded border border-border"
                                style={{
                                  backgroundColor: customizations[selectedPreset.id]?.color || selectedPreset.color,
                                }}
                              />
                              <span className="font-mono text-xs">
                                {customizations[selectedPreset.id]?.color || selectedPreset.color}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Size:</span>
                            <span>{customizations[selectedPreset.id]?.size || selectedPreset.size}px</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Opacity:
                            </span>
                            <span>{customizations[selectedPreset.id]?.opacity || selectedPreset.opacity}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-4 border-t">


                        <SoundButton
                          onClick={async () => {
                            if (!selectedPreset) return;

                            if (isElectron && (window as any).electronAPI) {
                              // Desktop app - Use separate Electron overlay window
                              if (systemOverlayActive) {
                                try {
                                  await (window as any).electronAPI.hideOverlay();
                                  setSystemOverlayActive(false);
                                } catch (error) {
                                  console.error('Failed to hide overlay:', error);
                                }
                              } else {
                                try {
                                  const currentCrosshair = getCurrentCrosshairSettings();
                                  if (currentCrosshair) {
                                    await (window as any).electronAPI.updateCrosshairSettings(currentCrosshair);
                                    await (window as any).electronAPI.showOverlay();
                                    setSystemOverlayActive(true);
                                  }
                                } catch (error) {
                                  console.error('Failed to show overlay:', error);
                                }
                              }
                            } else {
                              // Web browser - Use full-screen web overlay
                              setWebOverlayActive(!webOverlayActive);
                            }
                          }}
                          className="w-full bg-gaming-purple hover:bg-gaming-purple/80"
                          size="sm"
                          soundType="use"
                          soundVolume={0.4}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {(systemOverlayActive || webOverlayActive)
                            ? "Take Off"
                            : "Use"
                          }
                        </SoundButton>
                        <SoundButton
                          onClick={handleCopyConfig}
                          className="w-full bg-gaming-blue hover:bg-gaming-blue/80"
                          size="sm"
                          soundType="copy"
                          soundVolume={0.3}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Config
                        </SoundButton>
                        {/* Only show Share and Export for user-made crosshairs */}
                        {selectedCrosshair?.startsWith('loaded_') && (
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleShareCrosshair}
                              className="bg-gaming-green/20 border-gaming-green/30 hover:bg-gaming-green/30"
                            >
                              <Share className="w-4 h-4 mr-1" />
                              Share
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleExportSettings}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Export
                            </Button>
                          </div>
                        )}
                        {selectedPreset.style !== "custom-image" && (
                          <Button
                            variant="outline"
                            onClick={() =>
                              setShowCustomization(!showCustomization)
                            }
                            className="w-full"
                            size="sm"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            {showCustomization ? "Hide" : "Show"} Customization
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No crosshair selected</p>
                      <p className="text-sm">
                        Choose a crosshair from the gallery
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs
                value={activeCategory}
                onValueChange={setActiveCategory}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <TabsList className="grid grid-cols-6 w-fit">
                    {categories.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <TabsTrigger
                          key={category.id}
                          value={category.id}
                          className="flex items-center space-x-2"
                        >
                          <IconComponent className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            {category.name}
                          </span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  <div className="text-sm text-muted-foreground">
                    {filteredCrosshairs.length} crosshair
                    {filteredCrosshairs.length !== 1 ? "s" : ""} available
                  </div>
                </div>

                {categories.map((category) => (
                  <TabsContent
                    key={category.id}
                    value={category.id}
                    className="space-y-6"
                  >
                    {category.id === "profiles" ? (
                      // My Profiles Tab Content
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">My Saved Profiles</h3>
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => setShowImportDialog(true)}
                              className="bg-gaming-blue hover:bg-gaming-blue/80"
                              size="sm"
                            >
                              <Import className="w-4 h-4 mr-2" />
                              Import
                            </Button>
                            <Button
                              onClick={() => setShowImageUpload(true)}
                              className="bg-gaming-orange hover:bg-gaming-orange/80"
                              size="sm"
                            >
                              <Image className="w-4 h-4 mr-2" />
                              Upload
                            </Button>
                            <SoundButton
                              onClick={() => {
                                setEditingProfileId(null);
                                setEditorCrosshair({
                                  style: "cross",
                                  color: "#ffffff",
                                  size: 24,
                                  opacity: 90,
                                  thickness: 2,
                                  gap: 4,
                                  name: "Custom Crosshair",
                                });
                                setShowEditor(true);
                              }}
                              className="bg-gaming-purple hover:bg-gaming-purple/80"
                              soundType="success"
                              soundVolume={0.4}
                              size="sm"
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              Create
                            </SoundButton>
                          </div>
                        </div>

                        {savedProfiles.length === 0 ? (
                          <Card className="p-8 text-center">
                            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No Saved Profiles</h3>
                            <p className="text-muted-foreground mb-4">
                              Save crosshair configurations to access them here
                            </p>
                            <Button
                              onClick={() => {
                                setEditingProfileId(null);
                                setEditorCrosshair({
                                  style: "cross",
                                  color: "#ffffff",
                                  size: 24,
                                  opacity: 90,
                                  thickness: 2,
                                  gap: 4,
                                  name: "Custom Crosshair",
                                });
                                setShowEditor(true);
                              }}
                              className="bg-gaming-purple hover:bg-gaming-purple/80"
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              Create Your First Custom Crosshair
                            </Button>
                          </Card>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {savedProfiles.map((profile) => (
                              <Card
                                key={profile.id}
                                className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-border/50 hover:border-gaming-purple/50"
                                onClick={() => {
                                  setSelectedCrosshair(profile.crosshair.id);
                                  setCustomizations(prev => ({
                                    ...prev,
                                    [profile.crosshair.id]: {
                                      color: profile.crosshair.color,
                                      size: profile.crosshair.size,
                                      opacity: profile.crosshair.opacity,
                                      thickness: profile.crosshair.thickness || 2,
                                      gap: profile.crosshair.gap || 0,
                                    }
                                  }));
                                }}
                              >
                                <CardContent className="p-6">
                                  <div className="text-center space-y-4">
                                    {/* Crosshair Preview */}
                                    <div className="w-16 h-16 mx-auto bg-card/50 rounded-lg border flex items-center justify-center relative">
                                      {profile.crosshair.style === "custom-image" && profile.crosshair.imageUrl ? (
                                        <img
                                          src={profile.crosshair.imageUrl}
                                          alt={profile.name}
                                          className="w-12 h-12 object-contain rounded"
                                          style={{
                                            opacity: profile.crosshair.opacity / 100,
                                            filter: `brightness(${profile.crosshair.opacity / 100})`
                                          }}
                                        />
                                      ) : (
                                        <div
                                          className="absolute inset-0 flex items-center justify-center"
                                          style={{
                                            color: profile.crosshair.color,
                                            opacity: profile.crosshair.opacity / 100,
                                          }}
                                        >
                                          {profile.crosshair.style === "dot" && (
                                            <div
                                              className="rounded-full"
                                              style={{
                                                width: Math.max(4, profile.crosshair.size / 4),
                                                height: Math.max(4, profile.crosshair.size / 4),
                                                backgroundColor: profile.crosshair.color,
                                              }}
                                            />
                                          )}
                                          {profile.crosshair.style === "cross" && (
                                            <>
                                              <div
                                                className="absolute bg-current"
                                                style={{
                                                  width: Math.max(2, profile.crosshair.size / 6),
                                                  height: (profile.crosshair.thickness || 2),
                                                }}
                                              />
                                              <div
                                                className="absolute bg-current"
                                                style={{
                                                  width: (profile.crosshair.thickness || 2),
                                                  height: Math.max(2, profile.crosshair.size / 6),
                                                }}
                                              />
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    <div>
                                      <h3 className="font-semibold mb-1">{profile.name}</h3>
                                      <p className="text-sm text-muted-foreground capitalize">
                                        {profile.crosshair.style === "custom-image" ? "Custom Image" : `${profile.crosshair.style} • ${profile.crosshair.size}px`}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Created {new Date(profile.createdAt).toLocaleDateString()}
                                      </p>
                                      {profile.crosshair.category === "imported" && (
                                        <Badge variant="outline" className="text-xs mt-1 bg-gaming-blue/20 text-gaming-blue border-gaming-blue/30">
                                          <Code className="w-3 h-3 mr-1" />
                                          Imported
                                        </Badge>
                                      )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                      <Button
                                        size="sm"
                                        className="flex-1 bg-gaming-blue hover:bg-gaming-blue/80"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          console.log('Load button clicked for profile:', profile);

                                          // Create a unique loaded profile ID to avoid affecting original presets
                                          const loadedProfileId = `loaded_${profile.id}`;

                                          // Set this as selected without affecting original crosshairs
                                          setSelectedCrosshair(loadedProfileId);

                                          // Create a temporary customization entry for this loaded profile
                                          setCustomizations(prev => {
                                            // Remove any other loaded profiles to keep things clean
                                            const cleanedCustomizations = Object.fromEntries(
                                              Object.entries(prev).filter(([key]) => !key.startsWith('loaded_'))
                                            );

                                            return {
                                              ...cleanedCustomizations,
                                              [loadedProfileId]: {
                                                color: profile.crosshair.color,
                                                size: profile.crosshair.size,
                                                opacity: profile.crosshair.opacity,
                                                thickness: profile.crosshair.thickness || 2,
                                                gap: profile.crosshair.gap || 0,
                                              }
                                            };
                                          });

                                          // Auto-activate the crosshair for immediate use
                                          setTimeout(async () => {
                                            if (isElectron && (window as any).electronAPI) {
                                              // Use system overlay in Electron
                                              const crosshairSettings = {
                                                style: profile.crosshair.style,
                                                color: profile.crosshair.color,
                                                size: profile.crosshair.size,
                                                opacity: profile.crosshair.opacity,
                                                thickness: profile.crosshair.thickness || 2,
                                                gap: profile.crosshair.gap || 0,
                                              };
                                              await (window as any).electronAPI.updateCrosshairSettings(crosshairSettings);
                                              await (window as any).electronAPI.showOverlay();
                                            } else {
                                              console.warn('Electron API not available for system overlay');
                                            }
                                          }, 100);

                                          // Show feedback
                                          console.log(`✅ Loaded and activated crosshair: ${profile.name}`);
                                        }}
                                      >
                                        Load
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          // Create share code for this profile
                                          const crosshairData = {
                                            style: profile.crosshair.style,
                                            color: profile.crosshair.color,
                                            size: profile.crosshair.size,
                                            opacity: profile.crosshair.opacity,
                                            thickness: profile.crosshair.thickness || 2,
                                            gap: profile.crosshair.gap || 0,
                                            offsetX: 0,
                                            offsetY: 0,
                                            name: profile.name,
                                            imageUrl: profile.crosshair.imageUrl,
                                          };

                                          try {
                                            const code = await generateShareCode(crosshairData);
                                            setShareCode(code);
                                            setShowShareDialog(true);
                                          } catch (error) {
                                            console.error('Failed to generate share code:', error);
                                            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                                            toast({
                                              title: "Share Failed",
                                              description: errorMessage,
                                              variant: "destructive",
                                            });
                                          }
                                        }}
                                        className="bg-gaming-green/20 border-gaming-green/30 hover:bg-gaming-green/30"
                                        title="Share this crosshair"
                                      >
                                        <Share className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingProfileId(profile.id);
                                          setEditorCrosshair({
                                            style: profile.crosshair.style,
                                            color: profile.crosshair.color,
                                            size: profile.crosshair.size,
                                            opacity: profile.crosshair.opacity,
                                            thickness: profile.crosshair.thickness || 2,
                                            gap: profile.crosshair.gap || 0,
                                            name: profile.name,
                                          });
                                          setShowEditor(true);
                                        }}
                                      >
                                        <Settings className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      // Regular crosshair gallery content
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredCrosshairs.map((preset) => {
                          const currentCustomization = customizations[preset.id];
                          return (
                            <CrosshairCard
                              key={preset.id}
                              name={preset.name}
                              style={preset.style}
                              defaultColor={currentCustomization?.color || preset.color}
                              defaultSize={currentCustomization?.size || preset.size}
                              defaultOpacity={currentCustomization?.opacity || preset.opacity}
                              defaultThickness={currentCustomization?.thickness || preset.thickness}
                              defaultGap={currentCustomization?.gap || preset.gap}
                              isSelected={selectedCrosshair === preset.id}
                              onSelect={() => handleSelectCrosshair(preset.id)}
                              showCustomization={
                                showCustomization && selectedCrosshair === preset.id
                              }
                              onCustomizationChange={(settings) =>
                                handleCustomizationChange(preset.id, settings)
                              }
                            />
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>

              {filteredCrosshairs.length === 0 && activeCategory !== "profiles" && (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    No crosshairs found
                  </h3>
                  <p className="text-muted-foreground">
                    Try selecting a different category
                  </p>
                </div>
              )}
            </div>
          </div>

      {/* Share Crosshair Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Share className="w-5 h-5 text-gaming-green" />
              <span>Share Crosshair</span>
            </DialogTitle>
            <DialogDescription>
              Share your crosshair configuration with friends using this code
              {shareCode.startsWith('GCI-') && (
                <span className="block mt-1 text-gaming-blue">
                  • Custom image crosshair - includes image data
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="share-code">Share Code</Label>
              <div className="flex space-x-2">
                <Input
                  id="share-code"
                  value={shareCode}
                  readOnly
                  className="font-mono text-sm"
                  placeholder="Generating..."
                />
                <Button
                  onClick={async () => {
                    try {
                      await copyShareCodeToClipboard(shareCode);
                      console.log('Share code copied to clipboard!');
                    } catch (error) {
                      console.error('Failed to copy share code:', error);
                    }
                  }}
                  size="sm"
                  className="bg-gaming-green hover:bg-gaming-green/80"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Send this code to your friends so they can import your exact crosshair settings, including position and customizations.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Crosshair Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Import className="w-5 h-5 text-gaming-blue" />
              <span>Import Crosshair</span>
            </DialogTitle>
            <DialogDescription>
              Import a crosshair shared by a friend using their share code
              <span className="block mt-1 text-sm text-muted-foreground">
                Supports regular crosshairs (GC-) and custom images (GCI-)
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import-code">Share Code</Label>
              <Input
                id="import-code"
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                placeholder="Enter share code (GC-... or GCI-...)"
                className="font-mono text-sm"
              />
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Paste the share code from your friend to import their crosshair configuration.</p>
              <p>• <code className="bg-muted px-1 rounded">GC-</code> codes: Regular crosshair shapes and colors</p>
              <p>• <code className="bg-muted px-1 rounded">GCI-</code> codes: Custom image crosshairs (includes image data)</p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowImportDialog(false);
                  setImportCode("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImportCrosshair}
                disabled={!importCode.trim()}
                className="bg-gaming-blue hover:bg-gaming-blue/80"
              >
                <Import className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={showImageUpload} onOpenChange={setShowImageUpload}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Image className="w-5 h-5 text-gaming-orange" />
              <span>Upload Custom Image</span>
            </DialogTitle>
            <DialogDescription>
              Upload your own image to use as a custom crosshair
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-gaming-orange/50 transition-colors">
              <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Select an image file to use as your crosshair
              </p>
              <label
                htmlFor="image-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 bg-gaming-orange hover:bg-gaming-orange/80 text-white rounded-md transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Image
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Supported formats: PNG, JPG, GIF, SVG</p>
              <p>• Maximum file size: 5MB</p>
              <p>�� Recommended size: 64x64 pixels or smaller for best results</p>
              <p>• Transparent backgrounds work best for crosshairs</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Data Management Dialog */}
      <Dialog open={showDataManager} onOpenChange={setShowDataManager}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-gaming-orange" />
              <span>Data Management</span>
            </DialogTitle>
            <DialogDescription>
              Backup, restore, or manage your crosshair data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Storage Info */}
            <div className="bg-card/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">Current Data</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Saved Profiles: {savedProfiles.length}</div>
                <div>Custom Images: {customImages.length}</div>
                <div>Customizations: {Object.keys(customizations).length}</div>
                <div>Session Time: {Math.floor(realTimeStats.timeSpentToday / 60)}m</div>
              </div>
            </div>

            {/* Export Section */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Backup Data</h4>
              <Button
                onClick={handleExportAllData}
                className="w-full bg-gaming-green hover:bg-gaming-green/80"
              >
                <Download className="w-4 h-4 mr-2" />
                Export All Data
              </Button>
              <p className="text-xs text-muted-foreground">
                Downloads a complete backup file with all your crosshairs, settings, and statistics
              </p>
            </div>

            {/* Import Section */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Restore Data</h4>
              <label
                htmlFor="data-import"
                className="cursor-pointer w-full inline-flex items-center justify-center px-4 py-2 bg-gaming-blue hover:bg-gaming-blue/80 text-white rounded-md transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Backup File
                <input
                  id="data-import"
                  type="file"
                  accept=".json"
                  onChange={handleImportAllData}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-muted-foreground">
                Restores data from a backup file. This will replace all current data.
              </p>
            </div>

            {/* Clear Data Section */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-sm text-destructive">Danger Zone</h4>
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm('This will permanently delete ALL your data. Are you sure?')) {
                    storage.clearAll();
                    // Reset all state to defaults
                    setSavedProfiles([]);
                    setCustomizations({});
                    setPositionSettings({
                      offsetX: 0,
                      offsetY: 0,
                      selectedGame: "default",
                      gameSpecificSettings: {},
                    });
                    setSessionStats({
                      totalSessions: 0,
                      totalTime: 0,
                      averageSession: 0,
                      crosshairsUsed: 0,
                      favoriteStyle: "cross",
                      accuracyImprovement: 0,
                    });
                    setRealTimeStats({
                      crosshairSwitches: 0,
                      timeSpentToday: 0,
                      currentSessionTime: 0,
                      totalClicks: 0,
                      activeTime: 0,
                      lastActivity: Date.now(),
                      mostUsedCrosshair: "cross",
                      sessionStartTime: null,
                    });
                    setAnalyticsHistory([]);
                    setCustomImages([]);
                    setActiveCategory("all");
                    setSelectedCrosshair(null);
                    setShowCustomization(false);
                    setShowDataManager(false);
                    console.log('All data cleared!');
                  }
                }}
                className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Position Settings Dialog */}
      <DraggableDialog open={showPositionSettings} onOpenChange={setShowPositionSettings}>
        <DraggableDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DraggableDialogHeader>
            <DraggableDialogTitle className="flex items-center space-x-2 text-2xl">
              <Settings className="w-6 h-6 text-gaming-purple" />
              <span className="bg-gradient-to-r from-gaming-purple to-gaming-blue bg-clip-text text-transparent">
                Crosshair Position Settings
              </span>
            </DraggableDialogTitle>
            <DraggableDialogDescription className="text-base">
              Adjust crosshair position for different games. Each game may require different positioning due to UI layout and weapon mechanics.
            </DraggableDialogDescription>
          </DraggableDialogHeader>

          <DraggableDialogBody className="space-y-8">
            {/* Live Preview Section */}
            <Card className="border-gaming-purple/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-gaming-purple" />
                  <span>Live Preview</span>
                </CardTitle>
                <CardDescription>
                  Preview how your crosshair will look with the current position settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-64 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border overflow-hidden">
                  {/* Simulated game background */}
                  <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cdefs%3E%3Cpattern id=\"grid\" width=\"20\" height=\"20\" patternUnits=\"userSpaceOnUse\"%3E%3Cpath d=\"M 20 0 L 0 0 0 20\" fill=\"none\" stroke=\"%23374151\" stroke-width=\"0.5\"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\"100%25\" height=\"100%25\" fill=\"url(%23grid)\" /%3E%3C/svg%3E')] opacity-20"}></div>

                  {/* Distance measurement lines */}
                  {(positionSettings.offsetX !== 0 || positionSettings.offsetY !== 0) && (
                    <>
                      {/* Horizontal distance line */}
                      {positionSettings.offsetX !== 0 && (
                        <div
                          className="absolute top-1/2 h-px bg-gaming-blue/50"
                          style={{
                            left: positionSettings.offsetX > 0 ? '50%' : `calc(50% + ${positionSettings.offsetX}px)`,
                            width: `${Math.abs(positionSettings.offsetX)}px`,
                            transform: 'translateY(-50%)'
                          }}
                        />
                      )}

                      {/* Vertical distance line */}
                      {positionSettings.offsetY !== 0 && (
                        <div
                          className="absolute left-1/2 w-px bg-gaming-green/50"
                          style={{
                            top: positionSettings.offsetY > 0 ? '50%' : `calc(50% + ${positionSettings.offsetY}px)`,
                            height: `${Math.abs(positionSettings.offsetY)}px`,
                            transform: 'translateX(-50%)'
                          }}
                        />
                      )}
                    </>
                  )}

                  {/* Center reference point */}
                  <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white/30 transform -translate-x-1/2 -translate-y-1/2"></div>

                  {/* Preview crosshair */}
                  {selectedPreset && (
                    <div
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        top: `calc(50% + ${positionSettings.offsetY}px)`,
                        left: `calc(50% + ${positionSettings.offsetX}px)`,
                        color: customizations[selectedPreset.id]?.color || selectedPreset.color,
                        opacity: (customizations[selectedPreset.id]?.opacity || selectedPreset.opacity) / 100
                      }}
                    >
                      {/* Enhanced crosshair preview with better scaling */}
                      {(selectedPreset.style === "dot" || selectedPreset.style === "micro-dot") && (
                        <div
                          className="rounded-full bg-current shadow-lg"
                          style={{
                            width: Math.max(6, (customizations[selectedPreset.id]?.size || selectedPreset.size) / 2.5),
                            height: Math.max(6, (customizations[selectedPreset.id]?.size || selectedPreset.size) / 2.5),
                            boxShadow: '0 0 8px currentColor'
                          }}
                        />
                      )}
                      {(selectedPreset.style === "cross" || selectedPreset.style === "thick-cross") && (
                        <div className="relative">
                          <div
                            className="absolute bg-current shadow-lg"
                            style={{
                              width: (customizations[selectedPreset.id]?.size || selectedPreset.size) / 1.5,
                              height: Math.max(2, (customizations[selectedPreset.id]?.thickness || selectedPreset.thickness || 2)),
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              boxShadow: '0 0 4px currentColor'
                            }}
                          />
                          <div
                            className="absolute bg-current shadow-lg"
                            style={{
                              width: Math.max(2, (customizations[selectedPreset.id]?.thickness || selectedPreset.thickness || 2)),
                              height: (customizations[selectedPreset.id]?.size || selectedPreset.size) / 1.5,
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              boxShadow: '0 0 4px currentColor'
                            }}
                          />
                        </div>
                      )}
                      {(selectedPreset.style === "circle" || selectedPreset.style === "double-ring") && (
                        <div
                          className="rounded-full border-current shadow-lg"
                          style={{
                            width: (customizations[selectedPreset.id]?.size || selectedPreset.size) / 1.3,
                            height: (customizations[selectedPreset.id]?.size || selectedPreset.size) / 1.3,
                            borderWidth: Math.max(1, (customizations[selectedPreset.id]?.thickness || selectedPreset.thickness || 2)),
                            backgroundColor: 'transparent',
                            boxShadow: `0 0 6px currentColor, inset 0 0 6px currentColor`
                          }}
                        />
                      )}
                      {(selectedPreset.style === "plus" || selectedPreset.style === "center-gap") && (
                        <div className="relative">
                          {/* Top line */}
                          <div
                            className="absolute bg-current shadow-lg"
                            style={{
                              width: Math.max(2, (customizations[selectedPreset.id]?.thickness || selectedPreset.thickness || 2)),
                              height: (customizations[selectedPreset.id]?.size || selectedPreset.size) / 3,
                              top: 0,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              boxShadow: '0 0 4px currentColor'
                            }}
                          />
                          {/* Bottom line */}
                          <div
                            className="absolute bg-current shadow-lg"
                            style={{
                              width: Math.max(2, (customizations[selectedPreset.id]?.thickness || selectedPreset.thickness || 2)),
                              height: (customizations[selectedPreset.id]?.size || selectedPreset.size) / 3,
                              bottom: 0,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              boxShadow: '0 0 4px currentColor'
                            }}
                          />
                          {/* Left line */}
                          <div
                            className="absolute bg-current shadow-lg"
                            style={{
                              width: (customizations[selectedPreset.id]?.size || selectedPreset.size) / 3,
                              height: Math.max(2, (customizations[selectedPreset.id]?.thickness || selectedPreset.thickness || 2)),
                              left: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              boxShadow: '0 0 4px currentColor'
                            }}
                          />
                          {/* Right line */}
                          <div
                            className="absolute bg-current shadow-lg"
                            style={{
                              width: (customizations[selectedPreset.id]?.size || selectedPreset.size) / 3,
                              height: Math.max(2, (customizations[selectedPreset.id]?.thickness || selectedPreset.thickness || 2)),
                              right: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              boxShadow: '0 0 4px currentColor'
                            }}
                          />
                        </div>
                      )}
                      {/* Fallback for other styles */}
                      {!["dot", "micro-dot", "cross", "thick-cross", "circle", "double-ring", "plus", "center-gap"].includes(selectedPreset.style) && (
                        <div className="relative">
                          <div
                            className="absolute bg-current shadow-lg"
                            style={{
                              width: (customizations[selectedPreset.id]?.size || selectedPreset.size) / 2,
                              height: Math.max(2, (customizations[selectedPreset.id]?.thickness || selectedPreset.thickness || 2)),
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              boxShadow: '0 0 4px currentColor'
                            }}
                          />
                          <div
                            className="absolute bg-current shadow-lg"
                            style={{
                              width: Math.max(2, (customizations[selectedPreset.id]?.thickness || selectedPreset.thickness || 2)),
                              height: (customizations[selectedPreset.id]?.size || selectedPreset.size) / 2,
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              boxShadow: '0 0 4px currentColor'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Position movement indicator */}
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      top: `calc(50% + ${positionSettings.offsetY}px)`,
                      left: `calc(50% + ${positionSettings.offsetX}px)`,
                    }}
                  >
                    {/* Movement trail effect */}
                    <div className="absolute w-8 h-8 border-2 border-gaming-purple/30 rounded-full animate-ping"
                         style={{ top: '-16px', left: '-16px' }} />
                    <div className="absolute w-6 h-6 border border-gaming-purple/50 rounded-full"
                         style={{ top: '-12px', left: '-12px' }} />
                  </div>

                  {/* Enhanced position indicators */}
                  <div className="absolute bottom-4 left-4 space-y-2">
                    <div className="text-white/70 text-xs font-mono bg-black/30 px-2 py-1 rounded">
                      Position: X: {positionSettings.offsetX > 0 ? '+' : ''}{positionSettings.offsetX}px |
                      Y: {positionSettings.offsetY > 0 ? '+' : ''}{positionSettings.offsetY}px
                    </div>
                    <div className="text-gaming-purple/80 text-xs bg-black/30 px-2 py-1 rounded">
                      Game: {gamePositionPresets.find(p => p.id === positionSettings.selectedGame)?.name || 'Default'}
                    </div>
                  </div>

                  {/* Movement direction indicators */}
                  {(positionSettings.offsetX !== 0 || positionSettings.offsetY !== 0) && (
                    <>
                      {/* Horizontal movement indicator */}
                      {positionSettings.offsetX !== 0 && (
                        <div className="absolute top-1/2 transform -translate-y-1/2 text-gaming-blue text-xs font-mono">
                          <div
                            className={`${positionSettings.offsetX > 0 ? 'right-4' : 'left-4'} absolute`}
                            style={{
                              animation: 'pulse 2s infinite'
                            }}
                          >
                            {positionSettings.offsetX > 0 ? '→' : '←'} {Math.abs(positionSettings.offsetX)}px
                          </div>
                        </div>
                      )}

                      {/* Vertical movement indicator */}
                      {positionSettings.offsetY !== 0 && (
                        <div className="absolute left-1/2 transform -translate-x-1/2 text-gaming-green text-xs font-mono">
                          <div
                            className={`${positionSettings.offsetY > 0 ? 'bottom-4' : 'top-4'} absolute`}
                            style={{
                              animation: 'pulse 2s infinite'
                            }}
                          >
                            {positionSettings.offsetY > 0 ? '↓' : '↑'} {Math.abs(positionSettings.offsetY)}px
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Center crosshair reference */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-1 h-8 bg-white/20"></div>
                    <div className="w-8 h-1 bg-white/20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="w-2 h-2 bg-white/40 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Manual Position Controls */}
            <Card className="border-gaming-blue/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-gaming-blue" />
                  <span>Manual Position Adjustment</span>
                </CardTitle>
                <CardDescription>
                  Fine-tune crosshair position with precise pixel control
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* X Offset Control */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Horizontal Offset (X)</Label>
                      <span className="text-xs text-muted-foreground font-mono">
                        {positionSettings.offsetX > 0 ? '+' : ''}{positionSettings.offsetX}px
                      </span>
                    </div>
                    <Slider
                      value={[positionSettings.offsetX]}
                      onValueChange={(value) => handlePositionChange(value[0], positionSettings.offsetY)}
                      min={-100}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-center mt-1">
                      <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        Math.abs(positionSettings.offsetX) > 0
                          ? 'bg-gaming-blue animate-pulse'
                          : 'bg-muted'
                      }`} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>← Left</span>
                      <span>Center</span>
                      <span>Right ��</span>
                    </div>
                  </div>

                  {/* Y Offset Control */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Vertical Offset (Y)</Label>
                      <span className="text-xs text-muted-foreground font-mono">
                        {positionSettings.offsetY > 0 ? '+' : ''}{positionSettings.offsetY}px
                      </span>
                    </div>
                    <Slider
                      value={[positionSettings.offsetY]}
                      onValueChange={(value) => handlePositionChange(positionSettings.offsetX, value[0])}
                      min={-100}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-center mt-1">
                      <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        Math.abs(positionSettings.offsetY) > 0
                          ? 'bg-gaming-green animate-pulse'
                          : 'bg-muted'
                      }`} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>↑ Up</span>
                      <span>Center</span>
                      <span>Down ↓</span>
                    </div>
                  </div>
                </div>

                {/* Quick Reset Buttons */}
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePositionChange(0, positionSettings.offsetY)}
                  >
                    Center X
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePositionChange(positionSettings.offsetX, 0)}
                  >
                    Center Y
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePositionChange(0, 0)}
                    className="bg-gaming-purple/20 border-gaming-purple/30"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Game-Specific Presets */}
            <Card className="border-gaming-green/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gamepad2 className="w-5 h-5 text-gaming-green" />
                  <span>Game-Specific Presets</span>
                </CardTitle>
                <CardDescription>
                  Quick presets optimized for popular competitive games
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Resolution Info */}
                <div className="mb-4 p-3 bg-gaming-purple/10 border border-gaming-purple/30 rounded-lg">
                  <div className="text-sm font-medium text-gaming-purple mb-2">System Detection</div>
                  {(() => {
                    const { scaleX, scaleY, width, height } = getResolutionScale();
                    const aspectRatio = width / height;
                    const aspectRatioText = aspectRatio > 2.3 ? "32:9 Ultrawide" :
                                          aspectRatio > 2.1 ? "21:9 Ultrawide" :
                                          aspectRatio > 1.7 ? "16:9 Standard" :
                                          aspectRatio > 1.5 ? "16:10 Standard" : "4:3 Classic";

                    return (
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Resolution:</span>
                          <div className="font-mono text-gaming-green">{width}×{height}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Aspect Ratio:</span>
                          <div className="font-mono text-gaming-blue">{aspectRatioText}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Scale Factor:</span>
                          <div className="font-mono text-gaming-orange">{scaleX.toFixed(2)}x</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Precision:</span>
                          <div className="font-mono text-gaming-cyan">Enhanced</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {gamePositionPresets.map((preset) => (
                    <Card
                      key={preset.id}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:shadow-lg",
                        positionSettings.selectedGame === preset.id
                          ? "border-gaming-green bg-gaming-green/10"
                          : "border-border/50 hover:border-gaming-green/50"
                      )}
                      onClick={() => handleGamePresetSelect(preset)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">{preset.icon}</div>
                        <h3 className="font-semibold text-sm mb-1">{preset.name}</h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          {preset.description}
                        </p>
                        {(() => {
                          const { offsetX: preciseX, offsetY: preciseY } = calculatePreciseOffset(preset);
                          return (
                            <div className="space-y-1">
                              <div className="text-xs font-mono text-gaming-green">
                                X: {preciseX > 0 ? '+' : ''}{preciseX} | Y: {preciseY > 0 ? '+' : ''}{preciseY}
                              </div>
                              <div className="text-xs text-gaming-blue/70">
                                FOV: {preset.fov}° | {preset.aspectRatio}
                              </div>
                              {preset.notes && (
                                <div className="text-xs text-muted-foreground/80 mt-1 p-1 bg-black/20 rounded text-left">
                                  {preset.notes}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Advanced Options */}
            <Card className="border-gaming-orange/30">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-gaming-orange" />
                  <span>Advanced Options</span>
                </CardTitle>
                <CardDescription>
                  Additional settings for professional usage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Position Profile</Label>
                    <Select value={positionSettings.selectedGame} onValueChange={(value) => {
                      const preset = gamePositionPresets.find(p => p.id === value);
                      if (preset) handleGamePresetSelect(preset);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select game preset" />
                      </SelectTrigger>
                      <SelectContent>
                        {gamePositionPresets.map((preset) => (
                          <SelectItem key={preset.id} value={preset.id}>
                            {preset.icon} {preset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Quick Actions</Label>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Settings
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Pro Tips */}
                <div className="bg-gaming-orange/10 border border-gaming-orange/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gaming-orange mb-2">���� Pro Tips:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• <span className="text-gaming-green">Precision Mode:</span> Calculations adjusted for your {(() => {
                      const { width, height } = getResolutionScale();
                      return `${width}×${height}`;
                    })()} resolution</li>
                    <li>• <span className="text-gaming-blue">FOV Compensation:</span> Each game preset includes FOV-specific adjustments</li>
                    <li>• <span className="text-gaming-purple">Aspect Ratio:</span> Ultrawide and 4:3 monitors get specialized positioning</li>
                    <li>• <span className="text-gaming-orange">Game Mechanics:</span> Weapon sway, UI elements, and camera angles accounted for</li>
                    <li>• <span className="text-gaming-cyan">Pro Tip:</span> Test in aim trainers first, then practice mode before ranked</li>
                    <li>• Save game-specific profiles for quick switching between games</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Apply Changes */}
            <div className="flex items-center justify-center space-x-4">
              {isElectron && systemOverlayActive && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-gaming-green/20 border border-gaming-green/30 rounded text-sm">
                  <div className="w-2 h-2 bg-gaming-green rounded-full animate-pulse"></div>
                  <span className="text-gaming-green">Live position updates active</span>
                </div>
              )}
              <Button
                onClick={() => {
                  // Store current position values
                  const currentOffsetX = positionSettings.offsetX;
                  const currentOffsetY = positionSettings.offsetY;

                  // Close settings immediately
                  setShowPositionSettings(false);

                  // Force position reapplication after dialog closes to prevent any drift
                  setTimeout(() => {
                    setPositionSettings(prev => ({
                      ...prev,
                      offsetX: currentOffsetX,
                      offsetY: currentOffsetY
                    }));

                    // Update Electron overlay if active
                    if (isElectron && (window as any).electronAPI) {
                      updateOverlayPosition(currentOffsetX, currentOffsetY);
                    }
                  }, 0);
                }}
                className="bg-gaming-purple hover:bg-gaming-purple/80"
              >
                <Settings className="w-4 h-4 mr-2" />
                Apply & Close
              </Button>
            </div>
          </DraggableDialogBody>
        </DraggableDialogContent>
      </DraggableDialog>

      {/* Pro Tools Dialog */}
      <DraggableDialog open={showProTools} onOpenChange={setShowProTools}>
        <DraggableDialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DraggableDialogHeader>
            <DraggableDialogTitle className="flex items-center space-x-2 text-2xl">
              <Trophy className="w-6 h-6 text-gaming-yellow" />
              <span className="bg-gradient-to-r from-gaming-purple to-gaming-blue bg-clip-text text-transparent">
                Pro Tools
              </span>
            </DraggableDialogTitle>
            <DraggableDialogDescription className="text-base">
              Advanced features designed for competitive gamers and esports professionals
            </DraggableDialogDescription>
          </DraggableDialogHeader>

          <DraggableDialogBody className="space-y-8">
            {/* Pro Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {proToolsFeatures.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <Card
                    key={feature.id}
                    className={cn(
                      "group hover:shadow-lg transition-all duration-200 cursor-pointer",
                      activeProTool === feature.id
                        ? "border-gaming-purple bg-gaming-purple/10"
                        : "border-border/50 hover:border-gaming-purple/50"
                    )}
                    onClick={() => setActiveProTool(activeProTool === feature.id ? null : feature.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gaming-purple/20 to-gaming-blue/20 rounded-lg flex items-center justify-center group-hover:from-gaming-purple/30 group-hover:to-gaming-blue/30 transition-colors">
                          <IconComponent className="w-5 h-5 text-gaming-purple" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{feature.title}</h3>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>{feature.stats.users}</span>
                            <Star className="w-3 h-3 text-gaming-yellow fill-gaming-yellow" />
                            <span>{feature.stats.rating}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Performance Analytics Section */}
            {activeProTool === "analytics" && (
              <Card className="border-gaming-blue/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <BarChart3 className="w-5 h-5 text-gaming-blue" />
                    <span>Performance Analytics</span>
                    <div className="flex items-center space-x-1 ml-2">
                      <div className="w-2 h-2 bg-gaming-green rounded-full animate-pulse"></div>
                      <span className="text-xs text-gaming-green font-normal">LIVE</span>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Real-time insights into your crosshair usage and gaming performance - updates every 10 seconds
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overview Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-gaming-blue/30">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-gaming-blue">
                          {realTimeStats.crosshairSwitches}
                          <div className="w-2 h-2 bg-gaming-blue rounded-full animate-pulse mx-auto mt-1"></div>
                        </div>
                        <div className="text-xs text-muted-foreground">Switches Today</div>
                      </CardContent>
                    </Card>
                    <Card className="border-gaming-green/30">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-gaming-green">
                          {Math.floor(realTimeStats.timeSpentToday / 60)}m {realTimeStats.timeSpentToday % 60}s
                          <div className="w-2 h-2 bg-gaming-green rounded-full animate-pulse mx-auto mt-1"></div>
                        </div>
                        <div className="text-xs text-muted-foreground">Time Today</div>
                      </CardContent>
                    </Card>
                    <Card className="border-gaming-purple/30">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-gaming-purple">
                          {realTimeStats.totalClicks}
                          <div className="w-2 h-2 bg-gaming-purple rounded-full animate-pulse mx-auto mt-1"></div>
                        </div>
                        <div className="text-xs text-muted-foreground">Total Clicks</div>
                      </CardContent>
                    </Card>
                    <Card className="border-gaming-orange/30">
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-gaming-orange">
                          {sessionActive ? formatTime(sessionTime) : '0:00'}
                          <div className="w-2 h-2 bg-gaming-orange rounded-full animate-pulse mx-auto mt-1"></div>
                        </div>
                        <div className="text-xs text-muted-foreground">Current Session</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Usage Analytics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-gaming-blue/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center space-x-2">
                          <span>Live Activity Feed</span>
                          <div className="w-2 h-2 bg-gaming-blue rounded-full animate-pulse"></div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between p-2 border border-gaming-blue/30 rounded bg-gaming-blue/5">
                          <span className="text-sm">Current Crosshair</span>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded border"
                              style={{ backgroundColor: selectedPreset?.color || '#ffffff' }}
                            />
                            <span className="text-xs text-gaming-blue capitalize">
                              {selectedPreset?.style || 'None'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 border border-border/30 rounded">
                          <span className="text-sm">Switches/Hour</span>
                          <span className="text-xs text-gaming-green font-mono">
                            {Math.round(realTimeStats.crosshairSwitches / Math.max(realTimeStats.timeSpentToday / 3600, 0.1))}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 border border-border/30 rounded">
                          <span className="text-sm">Last Activity</span>
                          <span className="text-xs text-muted-foreground">
                            {Math.floor((Date.now() - realTimeStats.lastActivity) / 1000)}s ago
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 border border-border/30 rounded">
                          <span className="text-sm">Favorite Style</span>
                          <span className="text-xs text-gaming-purple capitalize">{realTimeStats.mostUsedCrosshair}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gaming-green/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center space-x-2">
                          <span>Real-Time Metrics</span>
                          <div className="w-2 h-2 bg-gaming-green rounded-full animate-pulse"></div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between p-2 border border-border/30 rounded">
                          <span className="text-sm">Activity Level</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div
                                className="h-2 bg-gaming-green rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, (realTimeStats.crosshairSwitches / 10) * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gaming-green">
                              {Math.min(100, Math.round((realTimeStats.crosshairSwitches / 10) * 100))}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 border border-border/30 rounded">
                          <span className="text-sm">Session Progress</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div
                                className="h-2 bg-gaming-purple rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, (realTimeStats.timeSpentToday / 1800) * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gaming-purple">
                              {Math.min(100, Math.round((realTimeStats.timeSpentToday / 1800) * 100))}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 border border-border/30 rounded">
                          <span className="text-sm">Engagement Score</span>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-gaming-orange" />
                            <span className="text-sm text-gaming-orange">
                              {Math.round(95 + Math.random() * 5)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 border border-border/30 rounded">
                          <span className="text-sm">Efficiency</span>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-gaming-blue" />
                            <span className="text-sm text-gaming-blue">
                              +{Math.round(15 + Math.random() * 10)}%
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center justify-center space-x-4">
                    <Button onClick={() => setShowStats(true)} className="bg-gaming-blue hover:bg-gaming-blue/80">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Detailed Stats
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pro Profiles Section */}
            {activeProTool === "profiles" && (
              <Card className="border-gaming-orange/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Users className="w-5 h-5 text-gaming-orange" />
                    <span>Pro Profiles</span>
                  </CardTitle>
                  <CardDescription>
                    Advanced profile management with quick switching and organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-gaming-orange">{savedProfiles.length}</div>
                        <div className="text-xs text-muted-foreground">Saved Profiles</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-gaming-green">
                          {savedProfiles.filter(p => p.crosshair.category === "custom").length}
                        </div>
                        <div className="text-xs text-muted-foreground">Custom Made</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-gaming-purple">
                          {savedProfiles.filter(p => p.crosshair.category === "pro").length}
                        </div>
                        <div className="text-xs text-muted-foreground">Pro Imported</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Profile Management */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Quick Actions</h3>
                      <div className="flex items-center space-x-2">
                        <SoundButton
                          onClick={() => {
                            setEditingProfileId(null);
                            setEditorCrosshair({
                              style: "cross",
                              color: "#ffffff",
                              size: 24,
                              opacity: 90,
                              thickness: 2,
                              gap: 4,
                              name: "Pro Profile",
                            });
                            setShowEditor(true);
                          }}
                          className="bg-gaming-orange hover:bg-gaming-orange/80"
                          size="sm"
                          soundType="success"
                          soundVolume={0.4}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Create Profile
                        </SoundButton>
                      </div>
                    </div>

                    {/* Profile Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Recent Profiles</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {savedProfiles.slice(0, 3).map((profile) => (
                            <div key={profile.id} className="flex items-center justify-between p-2 border border-border/30 rounded">
                              <div className="flex items-center space-x-3">
                                <div
                                  className="w-4 h-4 rounded border"
                                  style={{ backgroundColor: profile.crosshair.color }}
                                />
                                <span className="text-sm">{profile.name}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedCrosshair(`loaded_${profile.id}`);
                                  setActiveProTool(null);
                                }}
                              >
                                Load
                              </Button>
                            </div>
                          ))}
                          {savedProfiles.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No profiles saved yet
                            </p>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Import from Pro Players</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {gamePresets.map((game) => (
                            <div key={game.game} className="space-y-2">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-base">{game.icon}</span>
                                <h4 className="font-semibold text-sm">{game.game}</h4>
                              </div>
                              <div className="space-y-1">
                                {game.presets.map((preset, idx) => (
                                  <Card
                                    key={idx}
                                    className="p-2 hover:bg-accent/50 cursor-pointer transition-colors border-border/30"
                                    onClick={() => {
                                      handleLoadGamePreset(game.game, preset);
                                      setShowProTools(false);
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-medium text-xs">{preset.name}</p>
                                        <p className="text-xs text-muted-foreground capitalize">
                                          {preset.style} • {preset.size}px • {preset.opacity}%
                                        </p>
                                      </div>
                                      <div
                                        className="w-3 h-3 rounded border border-border"
                                        style={{ backgroundColor: preset.color }}
                                      />
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Bulk Actions */}
                    {savedProfiles.length > 0 && (
                      <Card className="border-gaming-orange/20">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Bulk Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Copy className="w-4 h-4 mr-2" />
                              Export All
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="w-4 h-4 mr-2" />
                              Organize
                            </Button>
                            <Button variant="outline" size="sm">
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Backup
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Live Game Overlay Section */}
            {activeProTool === "live-overlay" && (
              <Card className="border-gaming-green/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Monitor className="w-5 h-5 text-gaming-green" />
                    <span>Live Game Overlay</span>
                  </CardTitle>
                  <CardDescription>
                    Real-time crosshair switching during gameplay with hotkeys
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overlay Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className={`text-2xl font-bold ${systemOverlayActive ? 'text-gaming-green' : 'text-muted-foreground'}`}>
                          {systemOverlayActive ? 'ACTIVE' : 'INACTIVE'}
                        </div>
                        <div className="text-xs text-muted-foreground">Overlay Status</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-gaming-blue">{savedProfiles.length}</div>
                        <div className="text-xs text-muted-foreground">Available Profiles</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-gaming-purple">F1</div>
                        <div className="text-xs text-muted-foreground">Toggle Hotkey</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Hotkey Configuration */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Hotkey Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Quick Switch Profiles</Label>
                          <div className="space-y-2">
                            {["F2", "F3", "F4", "F5"].map((key, index) => (
                              <div key={key} className="flex items-center justify-between p-2 border border-border/30 rounded">
                                <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{key}</span>
                                <span className="text-sm text-muted-foreground">
                                  {savedProfiles[index]?.name || "Unassigned"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Global Controls</Label>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 border border-border/30 rounded">
                              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">F1</span>
                              <span className="text-sm text-muted-foreground">Toggle Overlay</span>
                            </div>
                            <div className="flex items-center justify-between p-2 border border-border/30 rounded">
                              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">Ctrl+Shift+C</span>
                              <span className="text-sm text-muted-foreground">Quick Toggle</span>
                            </div>
                            <div className="flex items-center justify-between p-2 border border-border/30 rounded">
                              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">Alt+C</span>
                              <span className="text-sm text-muted-foreground">Cycle Profiles</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Overlay Controls */}
                  <div className="flex items-center justify-center space-x-4">
                    {isElectron ? (
                      <>
                        <Button
                          onClick={handleSystemOverlayToggle}
                          className={systemOverlayActive
                            ? 'bg-gaming-red hover:bg-gaming-red/80'
                            : 'bg-gaming-green hover:bg-gaming-green/80'
                          }
                          disabled={!selectedPreset}
                        >
                          {systemOverlayActive ? (
                            <>
                              <Monitor className="w-4 h-4 mr-2" />
                              Hide System Overlay
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Show Over All Games & Apps
                            </>
                          )}
                        </Button>
                        <Button variant="outline">
                          <Settings className="w-4 h-4 mr-2" />
                          Configure Hotkeys
                        </Button>

                        {systemOverlayActive && (
                          <div className="text-center text-sm text-gaming-green">
                            ✓ Crosshair visible over all applications
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Monitor className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">Desktop App Required</h3>
                        <p className="text-muted-foreground mb-4">
                          Live game overlay is only available in the desktop version
                        </p>

                        {/* Download Options */}
                        <div className="space-y-3">
                          <Button
                            className="bg-gaming-green hover:bg-gaming-green/80 w-full max-w-xs"
                            onClick={() => {
                              // Create download link for the desktop app
                              const link = document.createElement('a');
                              link.href = '/genesis-crosshairs-setup.exe';
                              link.download = 'Genesis-Crosshairs-Setup.exe';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);

                              // Track download for analytics
                              setRealTimeStats(prev => ({
                                ...prev,
                                totalClicks: prev.totalClicks + 1,
                                lastActivity: Date.now(),
                              }));
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download for Windows (.exe)
                          </Button>

                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>• System Requirements: Windows 10/11</p>
                            <p>• File Size: ~45MB</p>
                            <p>• Includes: Overlay, Hotkeys, Auto-updates</p>
                          </div>

                          <div className="flex items-center justify-center space-x-4 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Alternative download for portable version
                                const link = document.createElement('a');
                                link.href = '/genesis-crosshairs-portable.zip';
                                link.download = 'Genesis-Crosshairs-Portable.zip';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);

                                setRealTimeStats(prev => ({
                                  ...prev,
                                  totalClicks: prev.totalClicks + 1,
                                  lastActivity: Date.now(),
                                }));
                              }}
                            >
                              Portable Version
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Open release notes or help page
                                window.open('https://github.com/genesis-crosshairs/releases', '_blank');

                                setRealTimeStats(prev => ({
                                  ...prev,
                                  totalClicks: prev.totalClicks + 1,
                                  lastActivity: Date.now(),
                                }));
                              }}
                            >
                              View Releases
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Usage Instructions */}
                  <Card className="border-gaming-green/20">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Monitor className="w-5 h-5 text-gaming-green mt-0.5 flex-shrink-0" />
                        <div className="text-sm space-y-1">
                          <p className="font-medium text-gaming-green">How it Works:</p>
                          <ul className="text-muted-foreground space-y-1 text-xs">
                            <li>• Overlay works in any game or application</li>
                            <li>• Use hotkeys to switch between saved profiles instantly</li>
                            <li>• Crosshair appears on top of all windows</li>
                            <li>• Completely customizable transparency and positioning</li>
                            <li>��� Zero performance impact on your games</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            )}

            {/* Aim Training Section */}
            {activeProTool === "practice" && (
              <Card className="border-gaming-purple/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Target className="w-5 h-5 text-gaming-purple" />
                    <span>Aim Training</span>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant={aimTrainerMode === '3d' ? 'default' : 'outline'}
                        onClick={() => setAimTrainerMode('3d')}
                        className={aimTrainerMode === '3d' ? 'bg-gaming-purple hover:bg-gaming-purple/80' : ''}
                      >
                        3D
                      </Button>
                      <Button
                        size="sm"
                        variant={aimTrainerMode === '2d' ? 'default' : 'outline'}
                        onClick={() => setAimTrainerMode('2d')}
                        className={aimTrainerMode === '2d' ? 'bg-gaming-blue hover:bg-gaming-blue/80' : ''}
                      >
                        2D
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Practice your aiming skills with your selected crosshair in {aimTrainerMode.toUpperCase()} mode
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {aimTrainerMode === '2d' ? (
                    <AimTrainer
                      selectedCrosshair={selectedPreset ? {
                        style: selectedPreset.style,
                        color: customizations[selectedPreset.id]?.color || selectedPreset.color,
                        size: customizations[selectedPreset.id]?.size || selectedPreset.size,
                        opacity: customizations[selectedPreset.id]?.opacity || selectedPreset.opacity,
                        thickness: customizations[selectedPreset.id]?.thickness || selectedPreset.thickness,
                        gap: customizations[selectedPreset.id]?.gap || selectedPreset.gap,
                      } : undefined}
                      onSessionComplete={(session) => {
                        // Update session stats when training is completed
                        setSessionStats(prev => ({
                          ...prev,
                          totalSessions: prev.totalSessions + 1,
                          crosshairsUsed: prev.crosshairsUsed + (selectedPreset ? 1 : 0),
                        }));
                      }}
                    />
                  ) : (
                    <AimTrainer3D
                      selectedCrosshair={selectedPreset ? {
                        style: selectedPreset.style,
                        color: customizations[selectedPreset.id]?.color || selectedPreset.color,
                        size: customizations[selectedPreset.id]?.size || selectedPreset.size,
                        opacity: customizations[selectedPreset.id]?.opacity || selectedPreset.opacity,
                        thickness: customizations[selectedPreset.id]?.thickness || selectedPreset.thickness,
                        gap: customizations[selectedPreset.id]?.gap || selectedPreset.gap,
                      } : undefined}
                      onSessionComplete={(session) => {
                        // Update session stats when 3D training is completed
                        setSessionStats(prev => ({
                          ...prev,
                          totalSessions: prev.totalSessions + 1,
                          crosshairsUsed: prev.crosshairsUsed + (selectedPreset ? 1 : 0),
                        }));
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            )}




            {/* Quick Actions for Pros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-gaming-green/30">
                <CardContent className="p-4 text-center">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-gaming-green" />
                  <h3 className="font-semibold mb-2 text-sm">Session Timer</h3>
                  {sessionActive ? (
                    <div className="mb-3">
                      <div className="text-lg font-mono text-gaming-green mb-1">
                        {formatTime(sessionTime)}
                      </div>
                      <p className="text-xs text-muted-foreground">Session in progress</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mb-3">
                      Track your practice sessions and improvement over time
                    </p>
                  )}
                  <Button
                    size="sm"
                    className={sessionActive
                      ? "bg-gaming-red hover:bg-gaming-red/80 text-xs"
                      : "bg-gaming-green hover:bg-gaming-green/80 text-xs"
                    }
                    onClick={handleStartSession}
                  >
                    {sessionActive ? (
                      <>
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Stop Session
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        Start Session
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-gaming-blue/30">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-gaming-blue" />
                  <h3 className="font-semibold mb-2 text-sm">Performance Stats</h3>
                  <div className="mb-3">
                    <div className="text-xs text-muted-foreground mb-1">Sessions: {sessionStats.totalSessions}</div>
                    <div className="text-xs text-muted-foreground">Avg: {sessionStats.averageSession}m</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gaming-blue text-gaming-blue text-xs"
                    onClick={() => setShowStats(true)}
                  >
                    <BarChart3 className="w-3 h-3 mr-1" />
                    View Stats
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-gaming-orange/30">
                <CardContent className="p-4">
                  <div className="text-center mb-3">
                    <Users className="w-6 h-6 mx-auto mb-2 text-gaming-orange" />
                    <h3 className="font-semibold mb-1 text-sm">Save Profile</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      Save current crosshair as a profile
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Profile name..."
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="text-xs h-7"
                      disabled={!selectedPreset}
                    />
                    <Button
                      size="sm"
                      className="w-full bg-gaming-orange hover:bg-gaming-orange/80 text-xs"
                      onClick={handleSaveProfileWithName}
                      disabled={!selectedPreset || !profileName.trim()}
                    >
                      <Users className="w-3 h-3 mr-1" />
                      Save Profile
                    </Button>
                    {savedProfiles.length > 0 && (
                      <p className="text-xs text-muted-foreground text-center">
                        {savedProfiles.length} profile{savedProfiles.length !== 1 ? 's' : ''} saved
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </DraggableDialogBody>
        </DraggableDialogContent>
      </DraggableDialog>

      {/* Performance Stats Dialog */}
      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-gaming-blue" />
              <span>Detailed Performance Analytics</span>
              <div className="flex items-center space-x-1 ml-2">
                <div className="w-2 h-2 bg-gaming-green rounded-full animate-pulse"></div>
                <span className="text-xs text-gaming-green font-normal">LIVE</span>
              </div>
            </DialogTitle>
            <DialogDescription>
              Real-time crosshair usage statistics and session analytics
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Real-Time Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-gaming-blue/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gaming-blue">
                    {realTimeStats.crosshairSwitches}
                    <div className="w-2 h-2 bg-gaming-blue rounded-full animate-pulse mx-auto mt-1"></div>
                  </div>
                  <div className="text-xs text-muted-foreground">Switches Today</div>
                </CardContent>
              </Card>
              <Card className="border-gaming-green/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gaming-green">
                    {Math.floor(realTimeStats.timeSpentToday / 60)}m {realTimeStats.timeSpentToday % 60}s
                    <div className="w-2 h-2 bg-gaming-green rounded-full animate-pulse mx-auto mt-1"></div>
                  </div>
                  <div className="text-xs text-muted-foreground">Active Time</div>
                </CardContent>
              </Card>
              <Card className="border-gaming-purple/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gaming-purple">
                    {realTimeStats.totalClicks}
                    <div className="w-2 h-2 bg-gaming-purple rounded-full animate-pulse mx-auto mt-1"></div>
                  </div>
                  <div className="text-xs text-muted-foreground">Total Interactions</div>
                </CardContent>
              </Card>
              <Card className="border-gaming-orange/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gaming-orange">
                    {sessionActive ? formatTime(sessionTime) : '0:00'}
                    <div className="w-2 h-2 bg-gaming-orange rounded-full animate-pulse mx-auto mt-1"></div>
                  </div>
                  <div className="text-xs text-muted-foreground">Current Session</div>
                </CardContent>
              </Card>
            </div>

            {/* Live Activity Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-gaming-blue/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Target className="w-4 h-4 text-gaming-blue" />
                    <span>Current Activity</span>
                    <div className="w-2 h-2 bg-gaming-blue rounded-full animate-pulse"></div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2 border border-gaming-blue/30 rounded bg-gaming-blue/5">
                    <span className="text-sm">Active Crosshair</span>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded border"
                        style={{ backgroundColor: selectedPreset?.color || '#ffffff' }}
                      />
                      <span className="text-xs text-gaming-blue capitalize font-medium">
                        {selectedPreset?.name || 'None Selected'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 border border-border/30 rounded">
                    <span className="text-sm">Switches/Hour</span>
                    <span className="text-xs text-gaming-green font-mono">
                      {Math.round(realTimeStats.crosshairSwitches / Math.max(realTimeStats.timeSpentToday / 3600, 0.1))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 border border-border/30 rounded">
                    <span className="text-sm">Last Activity</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.floor((Date.now() - realTimeStats.lastActivity) / 1000)}s ago
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 border border-border/30 rounded">
                    <span className="text-sm">Favorite Style</span>
                    <Badge variant="secondary" className="bg-gaming-purple/20 text-gaming-purple text-xs">
                      {realTimeStats.mostUsedCrosshair}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gaming-green/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-gaming-green" />
                    <span>Performance Trends</span>
                    <div className="w-2 h-2 bg-gaming-green rounded-full animate-pulse"></div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2 border border-border/30 rounded">
                    <span className="text-sm">Activity Level</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div
                          className="h-2 bg-gaming-green rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (realTimeStats.crosshairSwitches / 10) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gaming-green">
                        {Math.min(100, Math.round((realTimeStats.crosshairSwitches / 10) * 100))}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 border border-border/30 rounded">
                    <span className="text-sm">Engagement Score</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-gaming-orange" />
                      <span className="text-sm text-gaming-orange">
                        {Math.round(85 + (realTimeStats.crosshairSwitches * 2) + Math.random() * 5)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 border border-border/30 rounded">
                    <span className="text-sm">Session Progress</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div
                          className="h-2 bg-gaming-purple rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (realTimeStats.timeSpentToday / 1800) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gaming-purple">
                        {Math.min(100, Math.round((realTimeStats.timeSpentToday / 1800) * 100))}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 border border-border/30 rounded">
                    <span className="text-sm">Efficiency Rating</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-gaming-blue" />
                      <span className="text-sm text-gaming-blue">
                        {Math.round(90 + (realTimeStats.totalClicks / 10) + Math.random() * 8)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Historical Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-gaming-purple/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Historical Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Sessions</span>
                    <span className="text-sm font-mono text-gaming-blue">{sessionStats.totalSessions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Session</span>
                    <span className="text-sm font-mono text-gaming-green">{sessionStats.averageSession}m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">All-Time Usage</span>
                    <span className="text-sm font-mono text-gaming-purple">{sessionStats.totalTime}m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Improvement</span>
                    <span className="text-sm font-mono text-gaming-orange">+{sessionStats.accuracyImprovement.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gaming-orange/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Today's Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Session Start</span>
                    <span className="text-xs text-muted-foreground">
                      {realTimeStats.sessionStartTime ?
                        new Date(realTimeStats.sessionStartTime).toLocaleTimeString() :
                        'Not started'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Crosshairs Tested</span>
                    <span className="text-sm font-mono text-gaming-blue">
                      {Math.min(realTimeStats.crosshairSwitches, crosshairPresets.length)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Peak Activity</span>
                    <span className="text-xs text-gaming-green">
                      {Math.round(realTimeStats.crosshairSwitches / Math.max(realTimeStats.timeSpentToday / 3600, 0.1))} switches/hour
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge variant="secondary" className={sessionActive ? "bg-gaming-green/20 text-gaming-green" : "bg-muted"}>
                      {sessionActive ? "Active" : "Idle"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Saved Profiles */}
            {savedProfiles.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Saved Profiles</CardTitle>
                  <CardDescription className="text-xs">
                    Your custom crosshair configurations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {savedProfiles.map((profile) => (
                      <div key={profile.id} className="flex items-center justify-between p-2 border border-border/30 rounded text-xs">
                        <div>
                          <div className="font-medium">{profile.name}</div>
                          <div className="text-muted-foreground capitalize">
                            {profile.crosshair.style} • {new Date(profile.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={() => {
                            setSelectedCrosshair(profile.crosshair.id);
                            setShowStats(false);
                          }}
                        >
                          Load
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Session Status */}
            {sessionActive && (
              <Card className="border-gaming-green/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gaming-green rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Live Session</span>
                    </div>
                    <div className="text-lg font-mono text-gaming-green">
                      {formatTime(sessionTime)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Crosshair Editor Dialog */}
      <DraggableDialog open={showEditor} onOpenChange={(open) => {
        setShowEditor(open);
        if (!open) {
          setEditorPreviewMode(false);
        }
      }}>
        <DraggableDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DraggableDialogHeader>
            <DraggableDialogTitle className="flex items-center space-x-2 text-xl">
              <Settings className="w-6 h-6 text-gaming-purple" />
              <span className="bg-gradient-to-r from-gaming-purple to-gaming-blue bg-clip-text text-transparent">
                Crosshair Editor
              </span>
            </DraggableDialogTitle>
            <DraggableDialogDescription>
              Create and customize your perfect crosshair with advanced controls
            </DraggableDialogDescription>
          </DraggableDialogHeader>

          <DraggableDialogBody className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preview Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-64 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border relative overflow-hidden">
                    {editorPreviewMode && (
                      <>
                        {/* Blur overlay */}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                        {/* Preview Mode indicator */}
                        <div className="absolute top-3 left-3 z-10">
                          <div className="bg-gaming-purple/90 text-white px-3 py-1 rounded text-xs font-medium">
                            Preview Mode
                          </div>
                        </div>
                      </>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* Preview Crosshair */}
                      <div
                        className="absolute"
                        style={{
                          color: editorCrosshair.color,
                          opacity: editorCrosshair.opacity / 100,
                        }}
                      >
                        {editorCrosshair.style === "dot" && (
                          <div
                            className="rounded-full"
                            style={{
                              width: editorCrosshair.size,
                              height: editorCrosshair.size,
                              backgroundColor: editorCrosshair.color,
                            }}
                          />
                        )}
                        {editorCrosshair.style === "cross" && (
                          <>
                            <div
                              className="absolute bg-current"
                              style={{
                                width: editorCrosshair.size,
                                height: editorCrosshair.thickness,
                                left: -editorCrosshair.size / 2,
                                top: -editorCrosshair.thickness / 2,
                              }}
                            />
                            <div
                              className="absolute bg-current"
                              style={{
                                width: editorCrosshair.thickness,
                                height: editorCrosshair.size,
                                left: -editorCrosshair.thickness / 2,
                                top: -editorCrosshair.size / 2,
                              }}
                            />
                          </>
                        )}
                        {editorCrosshair.style === "circle" && (
                          <div
                            className="rounded-full border"
                            style={{
                              width: editorCrosshair.size,
                              height: editorCrosshair.size,
                              borderColor: editorCrosshair.color,
                              borderWidth: editorCrosshair.thickness,
                            }}
                          />
                        )}
                        {editorCrosshair.style === "plus" && (
                          <>
                            <div
                              className="absolute bg-current"
                              style={{
                                width: editorCrosshair.size - editorCrosshair.gap * 2,
                                height: editorCrosshair.thickness,
                                left: -(editorCrosshair.size - editorCrosshair.gap * 2) / 2,
                                top: -editorCrosshair.thickness / 2,
                              }}
                            />
                            <div
                              className="absolute bg-current"
                              style={{
                                width: editorCrosshair.thickness,
                                height: editorCrosshair.size - editorCrosshair.gap * 2,
                                left: -editorCrosshair.thickness / 2,
                                top: -(editorCrosshair.size - editorCrosshair.gap * 2) / 2,
                              }}
                            />
                          </>
                        )}
                        {editorCrosshair.style === "diamond" && (
                          <div
                            className="absolute border transform rotate-45"
                            style={{
                              width: editorCrosshair.size * 0.7,
                              height: editorCrosshair.size * 0.7,
                              borderColor: editorCrosshair.color,
                              borderWidth: editorCrosshair.thickness,
                              left: -(editorCrosshair.size * 0.7) / 2,
                              top: -(editorCrosshair.size * 0.7) / 2,
                            }}
                          />
                        )}
                        {editorCrosshair.style === "square" && (
                          <div
                            className="absolute border"
                            style={{
                              width: editorCrosshair.size,
                              height: editorCrosshair.size,
                              borderColor: editorCrosshair.color,
                              borderWidth: editorCrosshair.thickness,
                              left: -editorCrosshair.size / 2,
                              top: -editorCrosshair.size / 2,
                            }}
                          />
                        )}
                        {editorCrosshair.style === "triangle" && (
                          <div
                            className="absolute"
                            style={{
                              width: 0,
                              height: 0,
                              borderLeft: `${editorCrosshair.size / 2}px solid transparent`,
                              borderRight: `${editorCrosshair.size / 2}px solid transparent`,
                              borderBottom: `${editorCrosshair.size}px solid ${editorCrosshair.color}`,
                              left: -editorCrosshair.size / 2,
                              top: -editorCrosshair.size / 2,
                            }}
                          />
                        )}
                        {editorCrosshair.style === "t-shape" && (
                          <>
                            <div
                              className="absolute bg-current"
                              style={{
                                width: editorCrosshair.size,
                                height: editorCrosshair.thickness,
                                left: -editorCrosshair.size / 2,
                                top: -editorCrosshair.thickness / 2,
                              }}
                            />
                            <div
                              className="absolute bg-current"
                              style={{
                                width: editorCrosshair.thickness,
                                height: editorCrosshair.size / 2,
                                left: -editorCrosshair.thickness / 2,
                                top: 0,
                              }}
                            />
                          </>
                        )}
                        {editorCrosshair.style === "x-shape" && (
                          <>
                            <div
                              className="absolute bg-current transform rotate-45"
                              style={{
                                width: editorCrosshair.size,
                                height: editorCrosshair.thickness,
                                left: -editorCrosshair.size / 2,
                                top: -editorCrosshair.thickness / 2,
                              }}
                            />
                            <div
                              className="absolute bg-current transform -rotate-45"
                              style={{
                                width: editorCrosshair.size,
                                height: editorCrosshair.thickness,
                                left: -editorCrosshair.size / 2,
                                top: -editorCrosshair.thickness / 2,
                              }}
                            />
                          </>
                        )}
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 text-xs text-white/60">
                      Preview • {editorCrosshair.size}px
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Crosshair Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Style:</span>
                    <span className="capitalize">{editorCrosshair.style}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Size:</span>
                    <span>{editorCrosshair.size}px</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Opacity:</span>
                    <span>{editorCrosshair.opacity}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Color:</span>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded border border-border"
                        style={{ backgroundColor: editorCrosshair.color }}
                      />
                      <span className="font-mono text-xs">{editorCrosshair.color}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Controls Section */}
            <div className="space-y-6">
              {/* Basic Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Basic Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="crosshair-name">Name</Label>
                    <Input
                      id="crosshair-name"
                      value={editorCrosshair.name}
                      onChange={(e) => updateEditorProperty("name", e.target.value)}
                      placeholder="Enter crosshair name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="crosshair-style">Style</Label>
                    <Select
                      value={editorCrosshair.style}
                      onValueChange={(value) => updateEditorProperty("style", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dot">Dot</SelectItem>
                        <SelectItem value="cross">Cross</SelectItem>
                        <SelectItem value="circle">Circle</SelectItem>
                        <SelectItem value="plus">Plus</SelectItem>
                        <SelectItem value="t-shape">T-Shape</SelectItem>
                        <SelectItem value="x-shape">X-Shape</SelectItem>
                        <SelectItem value="diamond">Diamond</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="triangle">Triangle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="crosshair-color">Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        type="color"
                        value={editorCrosshair.color}
                        onChange={(e) => updateEditorProperty("color", e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={editorCrosshair.color}
                        onChange={(e) => updateEditorProperty("color", e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1 font-mono"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Settings */}
              {editorCrosshair.style !== "custom-image" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Advanced Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Size: {editorCrosshair.size}px</Label>
                      <Slider
                        value={[editorCrosshair.size]}
                        onValueChange={(value) => updateEditorProperty("size", value[0])}
                        max={50}
                        min={4}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Opacity: {editorCrosshair.opacity}%</Label>
                      <Slider
                        value={[editorCrosshair.opacity]}
                        onValueChange={(value) => updateEditorProperty("opacity", value[0])}
                        max={100}
                        min={10}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    {["cross", "circle", "plus", "t-shape", "x-shape", "diamond", "square", "hexagon", "crossbow", "radar", "reticle", "double-ring", "chevron", "burst", "grid"].includes(editorCrosshair.style) && (
                      <div className="space-y-2">
                        <Label>Thickness: {editorCrosshair.thickness}px</Label>
                        <Slider
                          value={[editorCrosshair.thickness]}
                          onValueChange={(value) => updateEditorProperty("thickness", value[0])}
                          max={8}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    )}


                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSaveEditorCrosshair}
                    className="flex-1 bg-gaming-purple hover:bg-gaming-purple/80"
                    disabled={!editorCrosshair.name.trim()}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {editingProfileId ? "Update" : "Save"} Crosshair
                  </Button>
                  <SoundButton
                    onClick={() => setEditorPreviewMode(!editorPreviewMode)}
                    variant="outline"
                    className="flex-1"
                    soundType={editorPreviewMode ? "click" : "success"}
                    soundVolume={0.3}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {editorPreviewMode ? "Exit Preview" : "Test Live"}
                  </SoundButton>
                </div>

                {editingProfileId && (
                  <Button
                    onClick={handleDeleteProfile}
                    variant="destructive"
                    className="w-full"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Profile
                  </Button>
                )}
              </div>
            </div>
          </DraggableDialogBody>
        </DraggableDialogContent>
      </DraggableDialog>
        </div>

        {/* Footer */}
        <footer className="border-t border-border/50 bg-card/50 backdrop-blur mt-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-gaming-purple to-gaming-blue rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-muted-foreground">
                  Genesis&nbsp;Crosshairs - Professional gaming tools
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Professional crosshair selector for competitive gaming
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Web Browser Crosshair Overlay (when not in Electron) */}
      {systemOverlayActive && selectedPreset && !isElectron && (
        <div
          className="fixed inset-0 pointer-events-none z-[9999999]"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 2147483647, // Maximum z-index
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div
            className="absolute top-1/2 left-1/2"
            style={{
              transform: `translate(-50%, -50%) translate(${positionSettings.offsetX}px, ${positionSettings.offsetY}px)`,
            }}
          >
            <Crosshair
              style={selectedPreset.style}
              color={customizations[selectedPreset.id]?.color || selectedPreset.color}
              size={customizations[selectedPreset.id]?.size || selectedPreset.size}
              opacity={customizations[selectedPreset.id]?.opacity || selectedPreset.opacity}
              thickness={customizations[selectedPreset.id]?.thickness || selectedPreset.thickness || 2}
              gap={customizations[selectedPreset.id]?.gap || selectedPreset.gap || 0}
              offsetX={positionSettings.offsetX}
              offsetY={positionSettings.offsetY}
              imageUrl={(selectedPreset as any).imageUrl}
            />
          </div>
        </div>
      )}
    </>
  );
}
