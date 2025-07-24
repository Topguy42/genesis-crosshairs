# Genesis Crosshairs - Gaming Overlay Desktop App

Transform your crosshair selector into a powerful desktop gaming overlay that works with any game!

## 🎮 Features

- **System-wide crosshair overlay** - Works with any game or application
- **Global hotkeys** - Toggle crosshair with F1 or Ctrl+Shift+C
- **Always-on-top transparent overlay** - Crosshair appears over everything
- **Click-through overlay** - Doesn't interfere with gameplay
- **Real-time crosshair customization** - Change settings while gaming
- **Persistent settings** - Your crosshair preferences are saved

## 🚀 Quick Start

### Development Mode

1. Install Electron dependencies:

```bash
npm install electron electron-builder --save-dev
```

2. Start the React app in development:

```bash
npm run dev
```

3. In a new terminal, run the Electron app:

```bash
npm run electron:dev
```

### Production Build

1. Build the React app:

```bash
npm run build:client
```

2. Package for your platform:

**Windows:**

```bash
npm run dist:win
```

**macOS:**

```bash
npm run dist:mac
```

**Linux:**

```bash
npm run dist:linux
```

The built application will be in the `release/` folder.

## 🎯 How to Use

### Main Interface

1. Launch Genesis Crosshairs
2. Select and customize your crosshair
3. Click "Preview On Screen" or press F1 to show overlay

### Gaming Overlay

- **F1** or **Ctrl+Shift+C** - Toggle crosshair overlay
- **ESC** - Hide overlay (when main app is focused)
- Crosshair appears as transparent overlay over any game

### Hotkeys (Global)

- `F1` - Toggle crosshair overlay
- `Ctrl+Shift+C` - Alternative toggle
- Works even when other applications are focused

## 🔧 Configuration

The app automatically saves your crosshair settings including:

- Style (dot, cross, circle, etc.)
- Color and opacity
- Size and thickness
- Last used visibility state

## 📦 Distribution

### For Windows Users

- Creates `.exe` installer with NSIS
- Automatically creates desktop and start menu shortcuts
- Supports Windows 10/11

### For macOS Users

- Creates `.dmg` installer
- Supports macOS 10.14+
- Code signing available (requires Apple Developer account)

### For Linux Users

- Creates `.AppImage` package
- Universal Linux distribution support
- No installation required - just download and run

## 🛠️ Advanced Features

### Auto-start with System

The app can be configured to start with your system and minimize to system tray.

### Game-specific Profiles

Future feature: Save different crosshair configurations for different games.

### Performance Optimized

- Minimal CPU/GPU impact
- Hardware acceleration enabled
- Optimized for gaming performance

## 🎨 Customization

All crosshair styles from the web version are available:

- Classic styles: Dot, Cross, Plus, T-Shape
- Modern styles: Circle, Hollow Square, Gap Cross
- Unique styles: Diamond, Star, Brackets, Arrow
- Gaming styles: Pixel Cross, Triple Dot, Lines Only

## 🐛 Troubleshooting

**Overlay not showing:**

- Try pressing F1 twice to refresh
- Check if another overlay app is conflicting
- Restart the application

**Hotkeys not working:**

- Ensure the app is running (check system tray)
- Try the alternative hotkey Ctrl+Shift+C
- Restart with administrator privileges (Windows)

**Performance issues:**

- Close unnecessary background applications
- Update graphics drivers
- Disable other overlay software

## 🔒 Security

The app uses secure IPC communication and doesn't require internet access during gaming. All crosshair rendering is done locally.

## 📄 License

Professional gaming tool for competitive players. See LICENSE file for details.
