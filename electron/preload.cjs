const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('chilltheme', {
  chooseImages: () => ipcRenderer.invoke('choose-image'),
  setWallpaper: (payload) => ipcRenderer.invoke('set-wallpaper', payload)
});
