# Build Genesis Crosshairs EXE - Quick Guide

## 🚀 Super Easy Method (2 clicks!)

1. **Download this project:**

   - Click **[Download Project](#project-download)** button
   - Extract the ZIP file to your computer

2. **Double-click to build:**
   - Run `build-windows.bat` (or `build.ps1` if you prefer PowerShell)
   - Wait for it to finish (2-3 minutes)
   - Your EXE will be in the `release/` folder!

## 📋 Manual Method

If you prefer manual steps:

```bash
# 1. Install dependencies
npm install
npm install electron electron-builder --save-dev

# 2. Build the app
npm run build:client

# 3. Create Windows EXE
npm run dist:win
```

## 📦 What You Get

**File Location:** `release/Genesis Crosshairs Setup 1.0.0.exe`

**Features:**

- ✅ Professional Windows installer
- ✅ Desktop & Start Menu shortcuts
- ✅ Gaming overlay with global hotkeys (F1)
- ✅ All 20+ crosshair styles
- ✅ Works with any game
- ✅ System tray integration

## 🎮 After Installation

1. **Install the EXE** - Double-click the installer
2. **Launch** - Desktop shortcut or Start Menu
3. **Select crosshair** - Choose your style and color
4. **Press F1** - Toggle overlay in any game!

## 🔧 Requirements

- **Windows 10/11** (64-bit)
- **Node.js** (download from nodejs.org if needed)
- **5 minutes** for build process

## ⚡ Quick Start Commands

After building, the installed app hotkeys are:

- **F1** - Toggle crosshair overlay
- **Ctrl+Shift+C** - Alternative toggle
- **ESC** - Hide overlay (when app focused)

Your gaming overlay is ready! 🎯
