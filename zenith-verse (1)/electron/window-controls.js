const { contextBridge, ipcRenderer } = require('electron');

console.log('Window controls preload script loading...');

// Simple window controls API
const windowControls = {
  minimize: () => {
    console.log('Window controls: minimize called');
    ipcRenderer.send('window-minimize');
  },
  maximize: () => {
    console.log('Window controls: maximize called');
    ipcRenderer.send('window-maximize');
  },
  close: () => {
    console.log('Window controls: close called');
    ipcRenderer.send('window-close');
  },
  isMaximized: () => {
    console.log('Window controls: isMaximized called');
    return ipcRenderer.sendSync('window-is-maximized');
  },
  onMaximized: (callback) => {
    ipcRenderer.on('window-maximized', callback);
  },
  onUnmaximized: (callback) => {
    ipcRenderer.on('window-unmaximized', callback);
  }
};

// Expose window controls
contextBridge.exposeInMainWorld('windowControls', windowControls);

console.log('Window controls API exposed');
