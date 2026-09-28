const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('chilltheme', {
  chooseImages: () => ipcRenderer.invoke('choose-image'),
  loadLibrary: () => ipcRenderer.invoke('load-library'),
  saveLibraryImage: (image) => ipcRenderer.invoke('save-library-image', image),
  deleteLibraryImage: (id) => ipcRenderer.invoke('delete-library-image', id),
  setWallpaper: (payload) => ipcRenderer.invoke('set-wallpaper', payload),
  restoreWallpaper: () => ipcRenderer.invoke('restore-wallpaper'),
  setOverlayWallpaper: (payload) => ipcRenderer.invoke('set-overlay-wallpaper', payload),
  removeOverlayWallpaper: () => ipcRenderer.invoke('remove-overlay-wallpaper')
});
