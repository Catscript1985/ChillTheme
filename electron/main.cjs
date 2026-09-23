const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { execFile } = require('node:child_process');

let mainWindow;
let liveWindows = [];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 980,
    minHeight: 680,
    backgroundColor: '#10131a',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  mainWindow.loadFile(path.join(__dirname, '..', 'src', 'index.html'));
}

function runPowerShell(script) {
  return new Promise((resolve, reject) => {
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], (error, stdout, stderr) => {
      if (error) reject(new Error(stderr || error.message));
      else resolve(stdout.trim());
    });
  });
}

ipcMain.handle('choose-image', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'] }]
  });
  if (result.canceled) return [];
  return result.filePaths;
});

ipcMain.handle('set-wallpaper', async (_event, payload) => {
  if (process.platform !== 'win32') {
    return { ok: false, message: 'Đặt hình nền trực tiếp hiện được triển khai cho Windows.' };
  }
  if (!payload?.dataUrl) return { ok: false, message: 'Chưa có dữ liệu hình nền.' };
  if (payload.kind === 'gif') {
    const match = payload.dataUrl.match(/^data:image\/gif;base64,(.+)$/);
    if (!match) return { ok: false, message: 'GIF không hợp lệ.' };
    const gifPath = path.join(os.tmpdir(), 'chilltheme-live-wallpaper.gif');
    fs.writeFileSync(gifPath, Buffer.from(match[1], 'base64'));
    liveWindows.forEach((window) => { if (!window.isDestroyed()) window.close(); });
    liveWindows = screen.getAllDisplays().map((display) => {
      const window = new BrowserWindow({
        x: display.bounds.x,
        y: display.bounds.y,
        width: display.bounds.width,
        height: display.bounds.height,
        frame: false,
        transparent: false,
        resizable: false,
        movable: false,
        skipTaskbar: true,
        focusable: false,
        fullscreenable: false,
        alwaysOnTop: false,
        title: 'ChillTheme Live Wallpaper',
        webPreferences: { contextIsolation: true, nodeIntegration: false }
      });
      window.setAlwaysOnBottom(true, 'normal');
      window.setIgnoreMouseEvents(true);
      window.loadFile(path.join(__dirname, 'live-wallpaper.html'), { hash: encodeURIComponent(gifPath) });
      return window;
    });
    return { ok: true, message: `Đã đặt GIF làm hình nền động trên ${liveWindows.length} màn hình.` };
  }
  const match = payload.dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
  if (!match) return { ok: false, message: 'Định dạng ảnh chưa được hỗ trợ để đặt làm hình nền.' };
  const ext = match[1] === 'jpeg' || match[1] === 'jpg' ? 'jpg' : match[1];
  const wallpaperPath = path.join(os.tmpdir(), `chilltheme-wallpaper.${ext}`);
  fs.writeFileSync(wallpaperPath, Buffer.from(match[2], 'base64'));
  const escaped = wallpaperPath.replace(/'/g, "''");
  const script = `Add-Type @'\nusing System;\nusing System.Runtime.InteropServices;\npublic class Wallpaper { [DllImport(\"user32.dll\", CharSet=CharSet.Unicode)] public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni); }\n'@; [Wallpaper]::SystemParametersInfo(20, 0, '${escaped}', 3)`;
  try {
    await runPowerShell(script);
    return { ok: true, message: 'Đã thay hình nền Windows.' };
  } catch (error) {
    return { ok: false, message: `Không thể thay hình nền: ${error.message}` };
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
