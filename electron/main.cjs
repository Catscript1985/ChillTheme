const { app, BrowserWindow, ipcMain, dialog, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { execFile } = require('node:child_process');

let mainWindow;
let tray;
let overlayWindows = [];
let isQuitting = false;

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
function closeOverlayWallpaper() { overlayWindows.forEach((window) => { if (!window.isDestroyed()) window.close(); }); overlayWindows = []; }
function nativeWindowHandle(window) {
  const buffer = window.getNativeWindowHandle();
  return buffer.length >= 8 ? `0x${buffer.readBigUInt64LE().toString(16)}` : `0x${buffer.readUInt32LE().toString(16)}`;
}
async function attachToDesktopWorkerW(window) {
  if (process.platform !== 'win32') return false;
  const hwnd = nativeWindowHandle(window);
  const script = `$ErrorActionPreference='Stop'; Add-Type @'\nusing System; using System.Text; using System.Runtime.InteropServices; public static class DesktopLayer { [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern IntPtr FindWindow(string cls, string name); [DllImport("user32.dll")] public static extern IntPtr FindWindowEx(IntPtr parent, IntPtr after, string cls, string name); [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc callback, IntPtr data); [DllImport("user32.dll")] public static extern uint SendMessageTimeout(IntPtr hWnd, uint msg, IntPtr wParam, IntPtr lParam, uint flags, uint timeout, out IntPtr result); [DllImport("user32.dll")] public static extern IntPtr SetParent(IntPtr child, IntPtr parent); [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hWnd, IntPtr insertAfter, int x, int y, int cx, int cy, uint flags); public delegate bool EnumWindowsProc(IntPtr hwnd, IntPtr data); public static IntPtr FindWorkerW(){ var prog=FindWindow("Progman",null); IntPtr result; SendMessageTimeout(prog,0x052C,IntPtr.Zero,IntPtr.Zero,0,1000,out result); IntPtr worker=IntPtr.Zero; EnumWindows((top,data)=>{ var view=FindWindowEx(top,IntPtr.Zero,"SHELLDLL_DefView",null); if(view!=IntPtr.Zero) worker=FindWindowEx(IntPtr.Zero,top,"WorkerW",null); return true; },IntPtr.Zero); return worker; } }\n'@; $worker=[DesktopLayer]::FindWorkerW(); if($worker -eq [IntPtr]::Zero){ throw 'WorkerW desktop layer not found' }; [void][DesktopLayer]::SetParent([IntPtr]::new(${hwnd}),$worker); [void][DesktopLayer]::SetWindowPos([IntPtr]::new(${hwnd}),[IntPtr]::new(1),0,0,0,0,0x0017)`;
  await runPowerShell(script);
  return true;
}

async function getCurrentWallpaper() {
  return (await runPowerShell("(Get-ItemProperty -Path 'HKCU:\\Control Panel\\Desktop' -Name Wallpaper).Wallpaper")).trim();
}
async function saveOriginalWallpaper() {
  const file = backupPath();
  if (fs.existsSync(file)) return;
  try {
    const original = await getCurrentWallpaper();
    if (original && fs.existsSync(original)) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify({ path: original, savedAt: Date.now() })); }
  } catch { /* Keep applying a new wallpaper if the old path is unavailable. */ }
}
async function applyNativeWallpaper(filePath) {
  await saveOriginalWallpaper();
  const escaped = quotePowerShell(filePath);
  const script = `$ErrorActionPreference='Stop'; Set-ItemProperty -Path 'HKCU:\\Control Panel\\Desktop' -Name WallpaperStyle -Value '10'; Set-ItemProperty -Path 'HKCU:\\Control Panel\\Desktop' -Name TileWallpaper -Value '0'; Add-Type @'\nusing System; using System.Runtime.InteropServices; public static class WallpaperApi { [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern bool SystemParametersInfo(int action, int param, string path, int winIni); }\n'@; if(-not [WallpaperApi]::SystemParametersInfo(20,0,'${escaped}',3)){ throw 'SystemParametersInfo failed' }`;
  await runPowerShell(script);
}

function createWindow() {
  mainWindow = new BrowserWindow({ width: 1280, height: 820, minWidth: 980, minHeight: 680, backgroundColor: '#10131a', titleBarStyle: 'hiddenInset', webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false } });
  mainWindow.loadFile(path.join(__dirname, '..', 'src', 'index.html'));
  mainWindow.on('close', (event) => { if (!isQuitting) { event.preventDefault(); mainWindow.hide(); } });
}
function createTray() {
  tray = new Tray(nativeImage.createEmpty());
  tray.setToolTip('ChillTheme');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Mở ChillTheme', click: () => { mainWindow.show(); mainWindow.focus(); } },
    { label: 'Gỡ đè màn', click: () => closeOverlayWallpaper() },
    { type: 'separator' },
    { label: 'Thoát ChillTheme', click: () => { isQuitting = true; closeOverlayWallpaper(); app.quit(); } }
  ]));
  tray.on('double-click', () => { mainWindow.show(); mainWindow.focus(); });
}

ipcMain.handle('choose-image', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'], filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'] }] });
  return result.canceled ? [] : result.filePaths;
});

ipcMain.handle('set-wallpaper', async (_event, payload) => {
  if (process.platform !== 'win32') return { ok: false, message: 'Đặt nền native hiện chỉ triển khai cho Windows.' };
  if (!payload?.dataUrl) return { ok: false, message: 'Chưa có dữ liệu hình nền.' };
  const match = payload.dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
  if (!match) return { ok: false, message: 'Ảnh chưa ở định dạng tương thích Windows.' };
  const ext = match[1] === 'jpeg' || match[1] === 'jpg' ? 'jpg' : match[1];
  const wallpaperPath = path.join(os.tmpdir(), `chilltheme-wallpaper.${ext}`);
  fs.writeFileSync(wallpaperPath, Buffer.from(match[2], 'base64'));
  try { await applyNativeWallpaper(wallpaperPath); return { ok: true, message: payload.wasGif ? 'Đã thay nền Windows bằng khung hình đầu tiên của GIF.' : 'Đã thay hẳn nền Windows. Chế độ Fill đã tự khớp màn hình.' }; }
  catch (error) { return { ok: false, message: `Không thể thay nền Windows: ${error.message}` }; }
});

ipcMain.handle('restore-wallpaper', async () => {
  if (process.platform !== 'win32') return { ok: false, message: 'Khôi phục nền native hiện chỉ triển khai cho Windows.' };
  try {
    const file = backupPath();
    if (!fs.existsSync(file)) return { ok: false, message: 'Chưa có nền gốc được lưu trong ChillTheme.' };
    const original = JSON.parse(fs.readFileSync(file, 'utf8')).path;
    if (!original || !fs.existsSync(original)) return { ok: false, message: 'Không tìm thấy file nền gốc trên máy.' };
    await applyNativeWallpaper(original); return { ok: true, message: 'Đã khôi phục nền Windows trước khi dùng ChillTheme.' };
  } catch (error) { return { ok: false, message: `Không thể khôi phục nền gốc: ${error.message}` }; }
});

ipcMain.handle('set-overlay-wallpaper', async (_event, payload) => {
  if (!payload?.dataUrl) return { ok: false, message: 'Chưa có dữ liệu để đè màn.' };
  const match = payload.dataUrl.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,(.+)$/);
  if (!match) return { ok: false, message: 'Ảnh chưa ở định dạng tương thích overlay.' };
  const ext = match[1] === 'gif' ? 'gif' : 'png';
  const overlayPath = path.join(os.tmpdir(), `chilltheme-overlay.${ext}`);
  fs.writeFileSync(overlayPath, Buffer.from(match[2], 'base64'));
  closeOverlayWallpaper();
  overlayWindows = screen.getAllDisplays().map((display) => {
    const window = new BrowserWindow({ x: display.bounds.x, y: display.bounds.y, width: display.bounds.width, height: display.bounds.height, frame: false, transparent: false, backgroundColor: '#000000', resizable: false, movable: false, skipTaskbar: true, focusable: false, fullscreenable: false, show: true, title: 'ChillTheme Overlay', webPreferences: { contextIsolation: true, nodeIntegration: false } });
    window.setIgnoreMouseEvents(true);
    window.loadFile(path.join(__dirname, 'overlay-wallpaper.html'), { hash: encodeURIComponent(overlayPath) });
    window.webContents.once('did-finish-load', async () => {
      try { await attachToDesktopWorkerW(window); }
      catch (error) { console.error('WorkerW attach failed:', error.message); }
    });
    return window;
  });
  if (mainWindow && !mainWindow.isDestroyed()) { mainWindow.show(); mainWindow.focus(); }
  return { ok: true, message: `Đã đặt nền động vào lớp desktop trên ${overlayWindows.length} màn hình. Các ứng dụng khác sẽ luôn nằm phía trên.` };
});

ipcMain.handle('remove-overlay-wallpaper', () => { closeOverlayWallpaper(); return { ok: true, message: 'Đã gỡ đè màn. Nền Windows native không bị thay đổi.' }; });

app.whenReady().then(() => { createWindow(); createTray(); app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); }); });
app.on('before-quit', () => { isQuitting = true; closeOverlayWallpaper(); });
app.on('window-all-closed', () => { /* Keep overlay active while ChillTheme is hidden in the tray. */ });
