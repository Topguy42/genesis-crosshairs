import { contextBridge, ipcRenderer } from "electron";

console.log('Preload script loading...');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  updateCrosshairSettings: (settings) =>
    ipcRenderer.invoke("update-crosshair-settings", settings),
  getCrosshairSettings: () => ipcRenderer.invoke("get-crosshair-settings"),
  showOverlay: () => ipcRenderer.invoke("show-overlay"),
  hideOverlay: () => ipcRenderer.invoke("hide-overlay"),
  minimizeToTray: () => ipcRenderer.invoke("minimize-to-tray"),
  forceOverlayTop: () => ipcRenderer.invoke("force-overlay-top"),
  refreshOverlay: () => ipcRenderer.invoke("refresh-overlay"),
  forceOverlayRefresh: () => ipcRenderer.invoke("force-overlay-refresh"),

  // Desktop-wide dragging support
  enableDesktopDragging: () => ipcRenderer.invoke("enable-desktop-dragging"),
  createFloatingDialog: (config) => ipcRenderer.invoke("create-floating-dialog", config),
  closeFloatingDialog: (id) => ipcRenderer.invoke("close-floating-dialog", id),
  updateFloatingDialogPosition: (config) => ipcRenderer.invoke("update-floating-dialog-position", config),

  // Native Windows-style window controls
  minimizeWindow: async () => {
    try {
      const result = await ipcRenderer.invoke("minimize-window");
      console.log('Minimize result:', result);
      return result;
    } catch (error) {
      console.error('Failed to minimize:', error);
      return false;
    }
  },
  maximizeWindow: async () => {
    try {
      const result = await ipcRenderer.invoke("maximize-window");
      console.log('Maximize result:', result);
      return result;
    } catch (error) {
      console.error('Failed to maximize:', error);
      return false;
    }
  },
  closeWindow: async () => {
    try {
      const result = await ipcRenderer.invoke("close-window");
      console.log('Close result:', result);
      return result;
    } catch (error) {
      console.error('Failed to close:', error);
      return false;
    }
  },
  isWindowMaximized: async () => {
    try {
      return await ipcRenderer.invoke("is-window-maximized");
    } catch (error) {
      console.error('Failed to get maximized state:', error);
      return false;
    }
  },

  // Listen for window state changes
  onWindowMaximized: (callback) => {
    ipcRenderer.on("window-maximized", callback);
  },
  onWindowUnmaximized: (callback) => {
    ipcRenderer.on("window-unmaximized", callback);
  },

  // Listen for overlay toggle events
  onOverlayToggled: (callback) => {
    ipcRenderer.on("overlay-toggled", (event, isVisible) =>
      callback(isVisible),
    );
  },

  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
});

console.log('electronAPI exposed to main world');

// Platform detection
contextBridge.exposeInMainWorld("platform", {
  isElectron: true,
  platform: process.platform,
});

console.log('Preload script completed successfully');
