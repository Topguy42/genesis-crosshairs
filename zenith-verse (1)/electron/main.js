import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  screen,
  Tray,
  Menu,
} from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV === "development";

let mainWindow;
let overlayWindow;
let floatingWindows = new Map(); // Track floating dialog windows
let tray = null; // System tray for overlay control
let crosshairSettings = {
  style: "cross",
  color: "#00ff00",
  size: 24,
  opacity: 90,
  thickness: 2,
  gap: 4,
  offsetX: 0,
  offsetY: 0,
  visible: false,
};

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    resizable: true, // Explicitly enable resizing
    frame: false, // Remove default window frame for custom title bar
    titleBarStyle: 'hidden', // Hide title bar on macOS
    trafficLightPosition: { x: 20, y: 20 }, // Position macOS controls
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../public/icon.png"),
    title: "Genesis Crosshairs - Gaming Overlay",
    show: false, // Don't show until ready
    backgroundColor: '#0a0a0a', // Dark background for gaming aesthetic
    maximizable: true, // Explicitly enable maximizing
    minimizable: true, // Explicitly enable minimizing
    closable: true, // Explicitly enable closing
  });

  // Load the React app
  if (isDev) {
    mainWindow.loadURL("http://localhost:8080");
    mainWindow.webContents.openDevTools();
  } else {
    // For production builds, load the packaged app
    const isDist = !__dirname.includes("app.asar");
    let indexPath;

    if (isDist) {
      // Running from unpackaged distribution
      indexPath = path.join(__dirname, "../dist/spa/index.html");
    } else {
      // Running from app.asar package
      indexPath = path.join(__dirname, "../dist/spa/index.html");
    }

    console.log("Loading app from:", indexPath);
    console.log("Current directory:", __dirname);

    mainWindow.loadFile(indexPath).catch((error) => {
      console.error("Failed to load app:", error);
      console.error("Attempted path:", indexPath);

      // Try alternative paths
      const altPaths = [
        path.join(process.resourcesPath, "app/dist/spa/index.html"),
        path.join(__dirname, "../../dist/spa/index.html"),
        path.join(process.cwd(), "dist/spa/index.html")
      ];

      let loaded = false;
      for (const altPath of altPaths) {
        try {
          console.log("Trying alternative path:", altPath);
          mainWindow.loadFile(altPath);
          loaded = true;
          break;
        } catch (e) {
          console.log("Failed alternative path:", altPath, e.message);
        }
      }

      if (!loaded) {
        // Enable dev tools to see errors in production
        mainWindow.webContents.openDevTools();
      }
    });
  }

  // Remove the menu bar completely
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setMenu(null);

  mainWindow.on("closed", () => {
    mainWindow = null;
    // Don't quit the app - keep overlay running via system tray
    // User can quit via tray menu or global shortcut
  });

  // Prevent app from quitting when main window is closed
  mainWindow.on('close', (event) => {
    if (process.platform === 'darwin') {
      // On macOS, hide the window instead of quitting
      event.preventDefault();
      mainWindow.hide();
    } else {
      // On Windows/Linux, minimize to tray
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window state changes
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized');
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-unmaximized');
  });
}

function createOverlayWindow() {
  // Get all display information for debugging
  const allDisplays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();

  console.log('=== OVERLAY WINDOW CREATION DEBUG ===');
  console.log('All displays:', allDisplays.map(d => ({ id: d.id, bounds: d.bounds, scaleFactor: d.scaleFactor })));
  console.log('Primary display:', primaryDisplay);

  // Use primary display bounds - this should cover the entire primary screen
  const { x, y, width, height } = primaryDisplay.bounds;

  console.log('Creating overlay with bounds:', { x, y, width, height });
  console.log('Overlay will be positioned at screen coordinates:', { x, y });
  console.log('Overlay size:', { width, height });

  overlayWindow = new BrowserWindow({
    width: width,
    height: height,
    x: x,
    y: y,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    closable: false,
    focusable: false,
    show: false,
    hasShadow: false,
    enableLargerThanScreen: true,
    fullscreenable: false,
    thickFrame: false,
    acceptFirstMouse: false,
    disableAutoHideCursor: true,
    backgroundColor: '#00000000', // Fully transparent
    roundedCorners: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "overlay-preload.js"),
      backgroundThrottling: false, // Prevent throttling when app is not focused
      offscreen: false,
    },
  });

  // Make window click-through
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });

  // Platform-specific window level settings for maximum compatibility
  if (process.platform === 'win32') {
    // Windows: Use screen-saver level for highest priority
    overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  } else if (process.platform === 'darwin') {
    // macOS: Use floating level
    overlayWindow.setAlwaysOnTop(true, 'floating');
  } else {
    // Linux: Use normal always on top
    overlayWindow.setAlwaysOnTop(true, 'normal');
  }

  // Additional visibility settings for cross-platform support
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  console.log('Overlay window created with primary display bounds:', {
    x: x,
    y: y,
    width: width,
    height: height,
    platform: process.platform,
    primary: true
  });

  // Load overlay HTML
  overlayWindow.loadFile(path.join(__dirname, "overlay.html"));

  overlayWindow.on("closed", () => {
    overlayWindow = null;
  });

  // Listen for display changes and update overlay bounds
  screen.on('display-metrics-changed', () => {
    console.log('Display metrics changed, updating overlay bounds');
    if (overlayWindow) {
      updateOverlayBounds();
      // Send updated crosshair settings to ensure proper positioning
      if (crosshairSettings.visible) {
        overlayWindow.webContents.send("update-crosshair", crosshairSettings);
      }
    }
  });

  screen.on('display-added', () => {
    console.log('Display added, updating overlay bounds');
    if (overlayWindow) {
      updateOverlayBounds();
    }
  });

  screen.on('display-removed', () => {
    console.log('Display removed, updating overlay bounds');
    if (overlayWindow) {
      updateOverlayBounds();
    }
  });
}

function updateOverlayBounds() {
  if (!overlayWindow) return;

  try {
    // Use primary display only for simplicity
    const primaryDisplay = screen.getPrimaryDisplay();
    const { x, y, width, height } = primaryDisplay.bounds;

    // Update overlay bounds
    overlayWindow.setBounds({
      x: x,
      y: y,
      width: width,
      height: height
    });

    console.log('Overlay bounds updated to primary display:', {
      x, y, width, height
    });
  } catch (error) {
    console.error('Error updating overlay bounds:', error);
  }
}

function toggleOverlay() {
  console.log('Toggle overlay called, current visible:', crosshairSettings.visible);

  if (!overlayWindow) {
    console.log('Creating new overlay window...');
    createOverlayWindow();
  }

  crosshairSettings.visible = !crosshairSettings.visible;
  console.log('Overlay visibility set to:', crosshairSettings.visible);

  if (crosshairSettings.visible) {
    // Ensure bounds are correct before showing
    updateOverlayBounds();

    overlayWindow.show();
    console.log('Overlay window shown');

    // Ensure overlay is on top of everything
    if (process.platform === 'win32') {
      overlayWindow.setAlwaysOnTop(true, 'screen-saver');
    } else if (process.platform === 'darwin') {
      overlayWindow.setAlwaysOnTop(true, 'floating');
    } else {
      overlayWindow.setAlwaysOnTop(true, 'normal');
    }

    // Ensure click-through behavior
    overlayWindow.setIgnoreMouseEvents(true, { forward: true });

    // Wait for window to be ready before sending crosshair data
    overlayWindow.webContents.once('dom-ready', () => {
      console.log('Overlay DOM ready, sending crosshair settings:', crosshairSettings);
      overlayWindow.webContents.send("update-crosshair", crosshairSettings);
    });

    // Also send immediately in case DOM is already ready
    if (overlayWindow.webContents.isLoading() === false) {
      overlayWindow.webContents.send("update-crosshair", crosshairSettings);
    }
  } else {
    overlayWindow.hide();
    console.log('Overlay window hidden');
  }

  // Notify main window of visibility change (only if main window exists)
  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      mainWindow.webContents.send("overlay-toggled", crosshairSettings.visible);
    } catch (error) {
      console.log('Could not notify main window of overlay state change:', error.message);
    }
  }
}

function createSystemTray() {
  try {
    // Create tray icon
    tray = new Tray(path.join(__dirname, "../public/icon.png"));

    // Set tray tooltip
    tray.setToolTip('Genesis Crosshairs - Gaming Overlay');

    // Create context menu
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Toggle Crosshair Overlay',
        click: toggleOverlay,
        accelerator: 'F1'
      },
      {
        type: 'separator'
      },
      {
        label: 'Show Main Window',
        click: () => {
          if (mainWindow) {
            if (mainWindow.isMinimized()) {
              mainWindow.restore();
            }
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        }
      }
    ]);

    // Set context menu
    tray.setContextMenu(contextMenu);

    // Handle tray click (Windows/Linux)
    tray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });

    console.log('System tray created successfully');
  } catch (error) {
    console.error('Failed to create system tray:', error);
  }
}

app.whenReady().then(() => {
  createMainWindow();

  // Create overlay window immediately for instant availability
  createOverlayWindow();

  // Create system tray for overlay control
  createSystemTray();

  // Register global hotkeys
  globalShortcut.register("F1", toggleOverlay);
  globalShortcut.register("CommandOrControl+Shift+C", toggleOverlay);

  // Desktop app shortcuts
  globalShortcut.register("CommandOrControl+M", () => {
    if (mainWindow) mainWindow.minimize();
  });
  globalShortcut.register("F11", () => {
    if (mainWindow) {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });
  globalShortcut.register("CommandOrControl+Shift+Q", () => {
    // Force quit the entire application
    app.quit();
  });

  // Periodic check to ensure overlay stays on top and independent
  setInterval(() => {
    if (overlayWindow && crosshairSettings.visible) {
      // Ensure overlay stays on top
      if (process.platform === 'win32') {
        overlayWindow.setAlwaysOnTop(true, 'screen-saver');
      } else if (process.platform === 'darwin') {
        overlayWindow.setAlwaysOnTop(true, 'floating');
      } else {
        overlayWindow.setAlwaysOnTop(true, 'normal');
      }

      // Ensure overlay bounds are still correct (handles display changes)
      updateOverlayBounds();

      // Ensure click-through is maintained
      overlayWindow.setIgnoreMouseEvents(true, { forward: true });
    }
  }, 1000); // Check every second for better responsiveness

  // Handle main window events without affecting overlay
  if (mainWindow) {
    mainWindow.on('minimize', () => {
      // Overlay remains active even when main window is minimized
      console.log('Main window minimized, overlay remains active');
    });

    mainWindow.on('restore', () => {
      // Ensure overlay is still on top when main window is restored
      if (overlayWindow && crosshairSettings.visible) {
        overlayWindow.setAlwaysOnTop(true, 'screen-saver');
      }
    });

    mainWindow.on('focus', () => {
      // Ensure overlay maintains priority even when main window gets focus
      if (overlayWindow && crosshairSettings.visible) {
        overlayWindow.setAlwaysOnTop(true, 'screen-saver');
      }
    });
  }

  // Handle app activation on macOS
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

// IPC handlers
ipcMain.handle("update-crosshair-settings", (event, settings) => {
  console.log('Received crosshair settings update:', settings);
  crosshairSettings = { ...crosshairSettings, ...settings };

  if (overlayWindow && crosshairSettings.visible) {
    console.log('Sending updated settings to overlay window');

    // Ensure proper positioning by refreshing overlay bounds first
    updateOverlayBounds();

    // Wait a moment for bounds to settle, then send crosshair settings
    setTimeout(() => {
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.webContents.send("update-crosshair", crosshairSettings);
      }
    }, 100);
  }

  return crosshairSettings;
});

ipcMain.handle("get-crosshair-settings", () => {
  console.log('Returning current crosshair settings:', crosshairSettings);
  return crosshairSettings;
});

ipcMain.handle("show-overlay", () => {
  console.log('Show overlay requested, current visible:', crosshairSettings.visible);
  if (!crosshairSettings.visible) {
    toggleOverlay();
  } else if (overlayWindow) {
    // If already visible, refresh positioning to ensure accuracy
    console.log('Overlay already visible, refreshing position');
    updateOverlayBounds();
    setTimeout(() => {
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.webContents.send("update-crosshair", crosshairSettings);
      }
    }, 100);
  }
});

ipcMain.handle("hide-overlay", () => {
  console.log('Hide overlay requested, current visible:', crosshairSettings.visible);
  if (crosshairSettings.visible) {
    toggleOverlay();
  }
});

// Handle minimize to system tray functionality
ipcMain.handle("minimize-to-tray", () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

// Ensure overlay stays on top even when main window is minimized
ipcMain.handle("force-overlay-top", () => {
  if (overlayWindow && crosshairSettings.visible) {
    overlayWindow.setAlwaysOnTop(false);
    overlayWindow.setAlwaysOnTop(true, 'screen-saver');
    overlayWindow.focus();
    overlayWindow.blur(); // Remove focus to maintain click-through
  }
});

// Handle overlay repositioning
ipcMain.handle("refresh-overlay", () => {
  if (overlayWindow && crosshairSettings.visible) {
    console.log('Refreshing overlay positioning');
    updateOverlayBounds();
    setTimeout(() => {
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.webContents.send("update-crosshair", crosshairSettings);
      }
    }, 100);
  }
});

// Force overlay repositioning - useful when game presets change
ipcMain.handle("force-overlay-refresh", () => {
  if (overlayWindow) {
    console.log('Force refreshing overlay - recalculating all positioning');

    // First update bounds
    updateOverlayBounds();

    // Then ensure crosshair positioning is accurate
    if (crosshairSettings.visible) {
      setTimeout(() => {
        if (overlayWindow && !overlayWindow.isDestroyed()) {
          overlayWindow.webContents.send("update-crosshair", crosshairSettings);
        }
      }, 150);
    }

    return true;
  }
  return false;
});

// Get primary display center coordinates - SIMPLIFIED
ipcMain.on("get-primary-display-center", (event) => {
  try {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.bounds;

    // Since overlay covers the primary display exactly, center is simply:
    const centerX = width / 2;
    const centerY = height / 2;

    console.log('SIMPLIFIED primary display center:', {
      displaySize: { width, height },
      center: { x: centerX, y: centerY }
    });

    event.returnValue = {
      x: centerX,
      y: centerY,
      displaySize: { width, height }
    };
  } catch (error) {
    console.error('Error calculating primary display center:', error);
    // Simple fallback
    event.returnValue = {
      x: 960, // Common center for 1920x1080
      y: 540
    };
  }
});

// Enable desktop-wide dragging mode
ipcMain.handle("enable-desktop-dragging", () => {
  // This tells the renderer that it can create floating windows for dialogs
  return {
    enabled: true,
    displays: screen.getAllDisplays().map(display => display.bounds)
  };
});

// Create floating window for dialog content
ipcMain.handle("create-floating-dialog", async (event, { content, bounds, id }) => {
  const floatingWindow = new BrowserWindow({
    width: bounds.width || 600,
    height: bounds.height || 400,
    x: bounds.x,
    y: bounds.y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: true,
    movable: true,
    minimizable: false,
    maximizable: false,
    closable: true,
    focusable: true,
    show: false,
    hasShadow: true,
    enableLargerThanScreen: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Store the floating window
  floatingWindows.set(id, floatingWindow);

  // Load content - for now, redirect to main app with dialog state
  if (isDev) {
    floatingWindow.loadURL(`http://localhost:8080/?floating=${id}`);
  } else {
    const isDist = !__dirname.includes("app.asar");
    let indexPath;
    if (isDist) {
      indexPath = path.join(__dirname, "../dist/spa/index.html");
    } else {
      indexPath = path.join(__dirname, "../dist/spa/index.html");
    }
    floatingWindow.loadFile(indexPath);
  }

  floatingWindow.once('ready-to-show', () => {
    floatingWindow.show();
  });

  floatingWindow.on('closed', () => {
    floatingWindows.delete(id);
  });

  return id;
});

// Close floating dialog
ipcMain.handle("close-floating-dialog", (event, id) => {
  const floatingWindow = floatingWindows.get(id);
  if (floatingWindow) {
    floatingWindow.close();
    floatingWindows.delete(id);
    return true;
  }
  return false;
});

// Update floating dialog position
ipcMain.handle("update-floating-dialog-position", (event, { id, x, y }) => {
  const floatingWindow = floatingWindows.get(id);
  if (floatingWindow) {
    floatingWindow.setPosition(x, y);
    return true;
  }
  return false;
});

// Native Windows-style window control handlers
ipcMain.handle("minimize-window", () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    console.log('Minimizing window using native method');
    mainWindow.minimize();
    return true;
  }
  return false;
});

ipcMain.handle("maximize-window", () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    console.log('Toggling maximize state using native method');
    if (mainWindow.isMaximized()) {
      mainWindow.restore(); // Use restore() instead of unmaximize() for better Windows compatibility
    } else {
      mainWindow.maximize();
    }
    return true;
  }
  return false;
});

ipcMain.handle("close-window", () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    console.log('Closing window using native method');
    mainWindow.close();
    return true;
  }
  return false;
});

ipcMain.handle("is-window-maximized", () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    return mainWindow.isMaximized();
  }
  return false;
});
