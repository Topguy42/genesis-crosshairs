import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("overlayAPI", {
  onUpdateCrosshair: (callback) => {
    ipcRenderer.on("update-crosshair", (event, settings) => callback(settings));
  },
  getPrimaryDisplayCenter: () => {
    return ipcRenderer.sendSync("get-primary-display-center");
  },
});
