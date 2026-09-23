const { app, BrowserWindow, ipcMain, dialog, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { execFile } = require('node:child_process');

let mainWindow;
let tray;
let liveWindows = [];
let isQuitting = false;

function runPowerShell(script) {
  return new Promise((resolve, reject) => {
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], (error, stdout, stderr) => {
      if (error) reject(new Error(stderr || error.message));
      else resolve(stdout.trim());
    });
  });
}

function closeLiveWallpaper() {
  liveWindows.forEach((window) => { if (!window.isDestroyed()) window.close(); });
  liveWindows = [];
}

async function attachToWorkerW(window) {
  const childHandle = window.getNativeWindowHandle().readBigUInt64LE(0).toString();
  const script = `$ErrorActionPreference='Stop'; Add-Type @'
using System; using System.Runtime.InteropServices;
public static class Shell { [DllImport("user32.dll")] public static extern IntPtr FindWindow(string c,string n); [DllImport("user32.dll")] public static extern IntPtr FindWindowEx(IntPtr p,IntPtr c,string s,string n); [DllImport("user32.dll")] public static extern IntPtr SendMessageTimeout(IntPtr h,uint m,IntPtr w,IntPtr l,uint f,uint t,out IntPtr r); [DllImport("user32.dll")] public static extern IntPtr SetParent(IntPtr c,IntPtr p); }
'@; $prog=[Shell]::FindWindow('Progman','Program Manager'); [IntPtr]$r=[IntPtr]::Zero; [Shell]::SendMessageTimeout($prog,0x052C,[IntPtr]::Zero,[IntPtr]::Zero,0,1000,[ref]$r)|Out-Null; $worker=[Shell]::FindWindowEx([IntPtr]::Zero,[IntPtr]::Zero,'WorkerW',$null); if($worker -eq [IntPtr]::Zero){$worker=$prog}; [Shell]::SetParent([IntPtr]${childHandle},$worker)|Out-Null; $worker.ToInt64()`;
  return Number(await runPowerShell(script));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 820, minWidth: 980, minHeight: 680,
    backgroundColor: '#10131a', titleBarStyle: 'hiddenInset',
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false }
  });
  mainWindow.loadFile(path.join(__dirname, '..', 'src', 'index.html'));
  mainWindow.on('close', (event) => { if (!isQuitting) { event.preventDefault(); mainWindow.hide(); } });
}

function createTray() {
  tray = new Tray(nativeImage.createEmpty());
  tray.setToolTip('ChillTheme — Live Wallpaper');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Mở ChillTheme', click: () => { mainWindow.show(); mainWindow.focus(); } },
    { label: 'Dừng live wallpaper', click: () => { closeLiveWallpaper(); mainWindow.show(); } },
    { type: 'separator' },
    { label: 'Thoát ChillTheme', click: () => { isQuitting = true; app.quit(); } }
  ]));
  tray.on('double-click', () => { mainWindow.show(); mainWindow.focus(); });
}

ipcMain.handle('choose-image', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'], filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'] }] });
  return result.canceled ? [] : result.filePaths;
});

ipcMain.handle('set-wallpaper', async (_event, payload) => {
  if (process.platform !== 'win32') return { ok: false, message: 'Đặt hình nền trực tiếp hiện được triển khai cho Windows.' };
  if (!payload?.dataUrl) return { ok: false, message: 'Chưa có dữ liệu hình nền.' };
  if (payload.kind === 'gif') {
    const match = payload.dataUrl.match(/^data:image\/gif;base64,(.+)$/);
    if (!match) return { ok: false, message: 'GIF không hợp lệ.' };
    const gifPath = path.join(os.tmpdir(), 'chilltheme-live-wallpaper.gif');
    fs.writeFileSync(gifPath, Buffer.from(match[1], 'base64'));
    closeLiveWallpaper();
    const displays = screen.getAllDisplays();
    const left = Math.min(...displays.map((display) => display.bounds.x));
    const top = Math.min(...displays.map((display) => display.bounds.y));
    const right = Math.max(...displays.map((display) => display.bounds.x + display.bounds.width));
    const bottom = Math.max(...displays.map((display) => display.bounds.y + display.bounds.height));
    const window = new BrowserWindow({
      x: left, y: top, width: right - left, height: bottom - top,
      frame: false, resizable: false, movable: false, skipTaskbar: true,
      focusable: false, fullscreenable: false, show: true,
      title: 'ChillTheme Live Wallpaper',
      webPreferences: { contextIsolation: true, nodeIntegration: false }
    });
    window.setIgnoreMouseEvents(true);
    await window.loadFile(path.join(__dirname, 'live-wallpaper.html'), { hash: encodeURIComponent(gifPath) });
    await attachToWorkerW(window);
    window.setAlwaysOnBottom(true, 'normal');
    liveWindows = [window];
    mainWindow.hide();
    return { ok: true, message: `Đã chuyển GIF xuống nền desktop trên ${displays.length} màn hình. ChillTheme đang chạy ở khay hệ thống.` };
  }
  const match = payload.dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
  if (!match) return { ok: false, message: 'Định dạng ảnh chưa được hỗ trợ để đặt làm hình nền.' };
  const ext = match[1] === 'jpeg' || match[1] === 'jpg' ? 'jpg' : match[1];
  const wallpaperPath = path.join(os.tmpdir(), `chilltheme-wallpaper.${ext}`);
  fs.writeFileSync(wallpaperPath, Buffer.from(match[2], 'base64'));
  const escaped = wallpaperPath.replace(/'/g, "''");
  const script = `Add-Type @'\nusing System;\nusing System.Runtime.InteropServices;\npublic class Wallpaper { [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni); }\n'@; [Wallpaper]::SystemParametersInfo(20, 0, '${escaped}', 3)`;
  try { await runPowerShell(script); return { ok: true, message: 'Đã thay hình nền Windows.' }; }
  catch (error) { return { ok: false, message: `Không thể thay hình nền: ${error.message}` }; }
});

ipcMain.handle('stop-live-wallpaper', () => { closeLiveWallpaper(); mainWindow.show(); mainWindow.focus(); return { ok: true }; });

app.whenReady().then(() => {
  createWindow();
  createTray();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('before-quit', () => { isQuitting = true; closeLiveWallpaper(); });
app.on('window-all-closed', () => { /* Keep ChillTheme available in the system tray. */ });
