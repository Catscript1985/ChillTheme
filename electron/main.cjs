const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { execFile } = require('node:child_process');

let mainWindow;

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
  if (!payload?.dataUrl || payload.kind === 'gif') {
    return { ok: false, message: 'GIF đã được hỗ trợ xem động trong app; live wallpaper Windows sẽ được bổ sung ở bản engine tiếp theo.' };
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
