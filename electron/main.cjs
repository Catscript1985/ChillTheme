const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { execFile } = require('node:child_process');

let mainWindow;

function runPowerShell(script) {
  return new Promise((resolve, reject) => {
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], (error, stdout, stderr) => {
      if (error) reject(new Error(stderr || error.message));
      else resolve(stdout.trim());
    });
  });
}

function quotePowerShell(value) { return String(value).replace(/'/g, "''"); }
function backupPath() { return path.join(app.getPath('userData'), 'wallpaper-backup.json'); }

async function getCurrentWallpaper() {
  const value = await runPowerShell("(Get-ItemProperty -Path 'HKCU:\\Control Panel\\Desktop' -Name Wallpaper).Wallpaper");
  return value.trim();
}

async function saveOriginalWallpaper() {
  const file = backupPath();
  if (fs.existsSync(file)) return;
  try {
    const original = await getCurrentWallpaper();
    if (original && fs.existsSync(original)) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, JSON.stringify({ path: original, savedAt: Date.now() }));
    }
  } catch { /* A missing original path should not block a new wallpaper. */ }
}

async function applyNativeWallpaper(filePath) {
  await saveOriginalWallpaper();
  const escaped = quotePowerShell(filePath);
  const script = `$ErrorActionPreference='Stop'; Set-ItemProperty -Path 'HKCU:\\Control Panel\\Desktop' -Name WallpaperStyle -Value '10'; Set-ItemProperty -Path 'HKCU:\\Control Panel\\Desktop' -Name TileWallpaper -Value '0'; Add-Type @'\nusing System; using System.Runtime.InteropServices; public static class WallpaperApi { [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern bool SystemParametersInfo(int action, int param, string path, int winIni); }\n'@; if(-not [WallpaperApi]::SystemParametersInfo(20,0,'${escaped}',3)){ throw 'SystemParametersInfo failed' }`;
  await runPowerShell(script);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 820, minWidth: 980, minHeight: 680,
    backgroundColor: '#10131a', titleBarStyle: 'hiddenInset',
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false }
  });
  mainWindow.loadFile(path.join(__dirname, '..', 'src', 'index.html'));
}

ipcMain.handle('choose-image', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'], filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'] }] });
  return result.canceled ? [] : result.filePaths;
});

ipcMain.handle('set-wallpaper', async (_event, payload) => {
  if (process.platform !== 'win32') return { ok: false, message: 'Đặt nền native hiện chỉ triển khai cho Windows.' };
  if (!payload?.dataUrl) return { ok: false, message: 'Chưa có dữ liệu hình nền.' };
  const match = payload.dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
  if (!match) return { ok: false, message: 'Ảnh GIF đã được chuyển sang khung hình tương thích Windows trước khi đặt nền.' };
  const ext = match[1] === 'jpeg' || match[1] === 'jpg' ? 'jpg' : match[1];
  const wallpaperPath = path.join(os.tmpdir(), `chilltheme-wallpaper.${ext}`);
  fs.writeFileSync(wallpaperPath, Buffer.from(match[2], 'base64'));
  try {
    await applyNativeWallpaper(wallpaperPath);
    return { ok: true, message: payload.wasGif ? 'Đã thay nền Windows bằng khung hình đầu tiên của GIF. Windows native không phát GIF động.' : 'Đã thay hẳn nền Windows. Chế độ Fill đã tự khớp màn hình.' };
  } catch (error) {
    return { ok: false, message: `Không thể thay nền Windows: ${error.message}` };
  }
});

ipcMain.handle('restore-wallpaper', async () => {
  if (process.platform !== 'win32') return { ok: false, message: 'Khôi phục nền native hiện chỉ triển khai cho Windows.' };
  try {
    const file = backupPath();
    if (!fs.existsSync(file)) return { ok: false, message: 'Chưa có nền gốc được lưu trong ChillTheme.' };
    const original = JSON.parse(fs.readFileSync(file, 'utf8')).path;
    if (!original || !fs.existsSync(original)) return { ok: false, message: 'Không tìm thấy file nền gốc trên máy.' };
    await applyNativeWallpaper(original);
    return { ok: true, message: 'Đã khôi phục nền Windows trước khi dùng ChillTheme.' };
  } catch (error) {
    return { ok: false, message: `Không thể khôi phục nền gốc: ${error.message}` };
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
