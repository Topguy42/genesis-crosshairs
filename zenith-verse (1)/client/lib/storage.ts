import React from 'react';

// Local Storage utility for persisting app data
const STORAGE_PREFIX = 'genesis-crosshairs-';

interface StorageData {
  savedProfiles: Array<{
    id: string;
    name: string;
    crosshair: any;
    createdAt: string;
  }>;
  customizations: Record<string, {
    color: string;
    size: number;
    opacity: number;
    thickness: number;
    gap: number;
  }>;
  positionSettings: {
    offsetX: number;
    offsetY: number;
    selectedGame: string;
    gameSpecificSettings: Record<string, { offsetX: number; offsetY: number }>;
  };
  sessionStats: {
    totalSessions: number;
    totalTime: number;
    averageSession: number;
    crosshairsUsed: number;
    favoriteStyle: string;
    accuracyImprovement: number;
  };
  realTimeStats: {
    crosshairSwitches: number;
    timeSpentToday: number;
    currentSessionTime: number;
    totalClicks: number;
    activeTime: number;
    lastActivity: number;
    mostUsedCrosshair: string;
    sessionStartTime: number | null;
  };
  analyticsHistory: Array<{
    timestamp: number;
    crosshairSwitches: number;
    timeSpent: number;
    clicks: number;
  }>;
  customImages: Array<{
    id: string;
    name: string;
    url: string;
    file: File;
    createdAt: string;
  }>;
  activeCategory: string;
  selectedCrosshair: string | null;
  showCustomization: boolean;
}

// Storage keys
const STORAGE_KEYS = {
  SAVED_PROFILES: `${STORAGE_PREFIX}saved-profiles`,
  CUSTOMIZATIONS: `${STORAGE_PREFIX}customizations`,
  POSITION_SETTINGS: `${STORAGE_PREFIX}position-settings`,
  SESSION_STATS: `${STORAGE_PREFIX}session-stats`,
  REALTIME_STATS: `${STORAGE_PREFIX}realtime-stats`,
  ANALYTICS_HISTORY: `${STORAGE_PREFIX}analytics-history`,
  CUSTOM_IMAGES: `${STORAGE_PREFIX}custom-images`,
  ACTIVE_CATEGORY: `${STORAGE_PREFIX}active-category`,
  SELECTED_CROSSHAIR: `${STORAGE_PREFIX}selected-crosshair`,
  SHOW_CUSTOMIZATION: `${STORAGE_PREFIX}show-customization`,
} as const;

// Utility functions
function safeJsonParse<T>(data: string | null, fallback: T): T {
  if (!data) return fallback;
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.warn('Failed to parse stored data:', error);
    return fallback;
  }
}

function safeJsonStringify(data: any): string | null {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.warn('Failed to stringify data:', error);
    return null;
  }
}

// Storage operations
export const storage = {
  // Save individual data types
  saveProfiles: (profiles: StorageData['savedProfiles']) => {
    const data = safeJsonStringify(profiles);
    if (data) localStorage.setItem(STORAGE_KEYS.SAVED_PROFILES, data);
  },

  loadProfiles: (): StorageData['savedProfiles'] => {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.SAVED_PROFILES), []);
  },

  saveCustomizations: (customizations: StorageData['customizations']) => {
    const data = safeJsonStringify(customizations);
    if (data) localStorage.setItem(STORAGE_KEYS.CUSTOMIZATIONS, data);
  },

  loadCustomizations: (): StorageData['customizations'] => {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.CUSTOMIZATIONS), {});
  },

  savePositionSettings: (settings: StorageData['positionSettings']) => {
    const data = safeJsonStringify(settings);
    if (data) localStorage.setItem(STORAGE_KEYS.POSITION_SETTINGS, data);
  },

  loadPositionSettings: (): StorageData['positionSettings'] => {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.POSITION_SETTINGS), {
      offsetX: 0,
      offsetY: 0,
      selectedGame: "default",
      gameSpecificSettings: {},
    });
  },

  saveSessionStats: (stats: StorageData['sessionStats']) => {
    const data = safeJsonStringify(stats);
    if (data) localStorage.setItem(STORAGE_KEYS.SESSION_STATS, data);
  },

  loadSessionStats: (): StorageData['sessionStats'] => {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.SESSION_STATS), {
      totalSessions: 0,
      totalTime: 0,
      averageSession: 0,
      crosshairsUsed: 0,
      favoriteStyle: "cross",
      accuracyImprovement: 0,
    });
  },

  saveRealTimeStats: (stats: StorageData['realTimeStats']) => {
    const data = safeJsonStringify(stats);
    if (data) localStorage.setItem(STORAGE_KEYS.REALTIME_STATS, data);
  },

  loadRealTimeStats: (): StorageData['realTimeStats'] => {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.REALTIME_STATS), {
      crosshairSwitches: 0,
      timeSpentToday: 0,
      currentSessionTime: 0,
      totalClicks: 0,
      activeTime: 0,
      lastActivity: Date.now(),
      mostUsedCrosshair: "cross",
      sessionStartTime: null,
    });
  },

  saveAnalyticsHistory: (history: StorageData['analyticsHistory']) => {
    const data = safeJsonStringify(history);
    if (data) localStorage.setItem(STORAGE_KEYS.ANALYTICS_HISTORY, data);
  },

  loadAnalyticsHistory: (): StorageData['analyticsHistory'] => {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.ANALYTICS_HISTORY), []);
  },

  saveCustomImages: (images: StorageData['customImages']) => {
    // Note: We can't store File objects directly, so we'll store image data as base64
    const serializedImages = images.map(img => ({
      ...img,
      file: null, // Remove file object, keep URL for access
    }));
    
    const data = safeJsonStringify(serializedImages);
    if (data) localStorage.setItem(STORAGE_KEYS.CUSTOM_IMAGES, data);
  },

  loadCustomImages: (): StorageData['customImages'] => {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.CUSTOM_IMAGES), []);
  },

  saveActiveCategory: (category: string) => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CATEGORY, category);
  },

  loadActiveCategory: (): string => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CATEGORY) || "all";
  },

  saveSelectedCrosshair: (crosshair: string | null) => {
    if (crosshair) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_CROSSHAIR, crosshair);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_CROSSHAIR);
    }
  },

  loadSelectedCrosshair: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_CROSSHAIR);
  },

  saveShowCustomization: (show: boolean) => {
    localStorage.setItem(STORAGE_KEYS.SHOW_CUSTOMIZATION, show.toString());
  },

  loadShowCustomization: (): boolean => {
    const stored = localStorage.getItem(STORAGE_KEYS.SHOW_CUSTOMIZATION);
    return stored === 'true';
  },

  // Bulk operations
  saveAll: (data: Partial<StorageData>) => {
    if (data.savedProfiles) storage.saveProfiles(data.savedProfiles);
    if (data.customizations) storage.saveCustomizations(data.customizations);
    if (data.positionSettings) storage.savePositionSettings(data.positionSettings);
    if (data.sessionStats) storage.saveSessionStats(data.sessionStats);
    if (data.realTimeStats) storage.saveRealTimeStats(data.realTimeStats);
    if (data.analyticsHistory) storage.saveAnalyticsHistory(data.analyticsHistory);
    if (data.customImages) storage.saveCustomImages(data.customImages);
    if (data.activeCategory) storage.saveActiveCategory(data.activeCategory);
    if (data.selectedCrosshair !== undefined) storage.saveSelectedCrosshair(data.selectedCrosshair);
    if (data.showCustomization !== undefined) storage.saveShowCustomization(data.showCustomization);
  },

  loadAll: (): StorageData => {
    return {
      savedProfiles: storage.loadProfiles(),
      customizations: storage.loadCustomizations(),
      positionSettings: storage.loadPositionSettings(),
      sessionStats: storage.loadSessionStats(),
      realTimeStats: storage.loadRealTimeStats(),
      analyticsHistory: storage.loadAnalyticsHistory(),
      customImages: storage.loadCustomImages(),
      activeCategory: storage.loadActiveCategory(),
      selectedCrosshair: storage.loadSelectedCrosshair(),
      showCustomization: storage.loadShowCustomization(),
    };
  },

  // Clear all data
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  // Get storage usage info
  getStorageInfo: () => {
    const keys = Object.values(STORAGE_KEYS);
    let totalSize = 0;
    const itemSizes: Record<string, number> = {};

    keys.forEach(key => {
      const item = localStorage.getItem(key);
      const size = item ? new Blob([item]).size : 0;
      itemSizes[key] = size;
      totalSize += size;
    });

    return {
      totalSize,
      itemSizes,
      totalItems: keys.length,
    };
  },
};

// Auto-save hook for React
export function useAutoSave<T>(key: keyof typeof STORAGE_KEYS, value: T, delay = 1000) {
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      try {
        const data = safeJsonStringify(value);
        if (data) localStorage.setItem(STORAGE_KEYS[key], data);
      } catch (error) {
        console.warn(`Failed to auto-save ${key}:`, error);
      }
    }, delay);

    return () => clearTimeout(timeoutRef.current);
  }, [value, key, delay]);
}

export default storage;
