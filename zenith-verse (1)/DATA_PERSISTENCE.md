# Data Persistence in Genesis Crosshairs

## Overview
All your crosshair configurations, settings, and progress are automatically saved to your browser's local storage. This means everything will be preserved when you close and reopen the app.

## What Gets Saved

### ✅ Automatically Persisted Data:
- **Saved Crosshair Profiles** - All your custom and imported crosshairs
- **Crosshair Customizations** - Colors, sizes, opacity, thickness, gap settings
- **Position Settings** - Offset coordinates and game-specific positions
- **Session Statistics** - Total sessions, time spent, accuracy improvements
- **Real-time Analytics** - Crosshair switches, clicks, usage patterns
- **Custom Images** - Uploaded crosshair images and their configurations
- **App Preferences** - Active category, selected crosshair, customization panel state

### 🔄 Real-time Saving
Data is automatically saved within 1 second of any change. You'll see an "Auto-Save ✓" indicator in the header confirming this feature is active.

## Data Management Features

### Export Data
- Click the "Data" button in the header
- Select "Export All Data" to download a complete backup
- File format: `genesis-crosshairs-backup-YYYY-MM-DD.json`

### Import Data
- Click the "Data" button in the header
- Select "Import Backup File" and choose your backup file
- Confirms before replacing existing data

### Clear Data
- Use the "Clear All Data" option in the Data Management dialog
- Requires double confirmation for safety
- Permanently removes all stored information

## Storage Limits

### Browser Storage
- Uses localStorage (typically 5-10MB limit per domain)
- Current usage shown in Data Management dialog
- Efficient compression keeps data small

### File Objects
- Custom images are stored as object URLs
- Large images may need re-uploading after browser restart
- Consider exporting data regularly for backup

## Troubleshooting

### Data Not Saving
1. Check if localStorage is enabled in your browser
2. Ensure you're not in private/incognito mode
3. Check available storage space
4. Try refreshing the page

### Lost Data
1. Check if you have a backup file
2. Use the Import feature to restore from backup
3. Custom images may need to be re-uploaded

### Performance Issues
1. Export data and clear storage if it becomes too large
2. Remove unused custom images
3. Clear old analytics data

## Technical Details

### Storage Keys
All data is prefixed with `genesis-crosshairs-` to avoid conflicts:
- `genesis-crosshairs-saved-profiles`
- `genesis-crosshairs-customizations`
- `genesis-crosshairs-position-settings`
- `genesis-crosshairs-session-stats`
- And more...

### Data Format
- JSON format for easy backup/restore
- Version tracking for future compatibility
- Safe parsing with fallback defaults
- Error handling for corrupted data

## Best Practices

1. **Regular Backups** - Export your data monthly
2. **Before Major Changes** - Backup before importing new data
3. **Multiple Devices** - Use export/import to sync between devices
4. **Share Safely** - Individual crosshairs can be shared via codes without exposing all data

## Privacy & Security

- All data stays on your device (localStorage only)
- No data sent to external servers
- Export files contain only crosshair data (no personal info)
- You control all backup and sharing operations
