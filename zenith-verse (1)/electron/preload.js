import { contextBridge, ipcRenderer } from "electron";

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

  // Desktop-wide dragging support
  enableDesktopDragging: () => ipcRenderer.invoke("enable-desktop-dragging"),
  createFloatingDialog: (config) => ipcRenderer.invoke("create-floating-dialog", config),
  closeFloatingDialog: (id) => ipcRenderer.invoke("close-floating-dialog", id),
  updateFloatingDialogPosition: (config) => ipcRenderer.invoke("update-floating-dialog-position", config),

  // Window controls for custom title bar
  minimizeWindow: () => ipcRenderer.invoke("minimize-window"),
  maximizeWindow: () => ipcRenderer.invoke("maximize-window"),
  closeWindow: () => ipcRenderer.invoke("close-window"),
  isWindowMaximized: () => ipcRenderer.invoke("is-window-maximized"),

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

// Platform detection
contextBridge.exposeInMainWorld("platform", {
  isElectron: true,
  platform: process.platform,
});
