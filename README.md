# ChillTheme

Ứng dụng desktop để lưu thư viện hình nền cá nhân, xem ảnh/GIF và đặt ảnh tĩnh làm hình nền máy. ChillTheme hiện được đóng gói cho **Windows, macOS và Linux**.

## Cài đặt Windows

File Windows là bộ cài `.exe` chuẩn. Khi chạy bộ cài, hãy bấm **Browse...** ở bước *Choose Install Location* để chọn ổ đĩa hoặc thư mục muốn cài ChillTheme, ví dụ `D:\Apps\ChillTheme`. Bộ cài không cài âm thầm; bạn có thể đổi vị trí trước khi bấm Install.

Thư viện ảnh của bản MVP hiện được lưu trong dữ liệu người dùng của Electron trên máy. Việc chọn thư mục ở trình cài quyết định vị trí cài ứng dụng; tính năng chọn riêng ổ lưu thư viện ảnh sẽ được tách thành một tùy chọn trong app ở bản tiếp theo để không làm mất dữ liệu khi nâng cấp.

## Tải trực tiếp

Các file cài đặt đã được build tự động và đính kèm trong release [v0.1.4](https://github.com/Catscript1985/ChillTheme/releases/tag/v0.1.4):

| Hệ điều hành | Tải xuống |
|---|---|
| [![Windows](https://img.shields.io/badge/Windows-10%2F11-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/Catscript1985/ChillTheme/releases/download/v0.1.4/ChillTheme-Windows-x64.exe) | [Tải bản Windows x64](https://github.com/Catscript1985/ChillTheme/releases/download/v0.1.4/ChillTheme-Windows-x64.exe) |
| [![macOS](https://img.shields.io/badge/macOS-12%2B-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/Catscript1985/ChillTheme/releases/download/v0.1.4/ChillTheme-macOS-arm64.dmg) | [Tải bản macOS Apple Silicon](https://github.com/Catscript1985/ChillTheme/releases/download/v0.1.4/ChillTheme-macOS-arm64.dmg) · [Intel](https://github.com/Catscript1985/ChillTheme/releases/download/v0.1.4/ChillTheme-macOS-x64.dmg) |
| [![Linux](https://img.shields.io/badge/Linux-x64-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/Catscript1985/ChillTheme/releases/download/v0.1.4/ChillTheme-Linux-x86_64.AppImage) | [Tải AppImage Linux x64](https://github.com/Catscript1985/ChillTheme/releases/download/v0.1.4/ChillTheme-Linux-x86_64.AppImage) · [DEB](https://github.com/Catscript1985/ChillTheme/releases/download/v0.1.4/ChillTheme-Linux-amd64.deb) |

> **Lưu ý:** Repository hiện đang ở chế độ Private. Bạn cần đăng nhập GitHub bằng tài khoản đã được cấp quyền vào repo trước khi tải; nếu chưa đăng nhập, GitHub có thể hiển thị `404`. Có thể mở [release v0.1.4](https://github.com/Catscript1985/ChillTheme/releases/tag/v0.1.4) để xem toàn bộ file.

### Các nền tảng được hỗ trợ

- ![Windows logo](https://img.icons8.com/color/24/windows-11.png) **Windows 10/11 x64** — bản cài đặt NSIS và bản portable.
- ![Apple logo](https://img.icons8.com/ios-filled/24/ffffff/mac-os.png) **macOS 12 trở lên** — Apple Silicon và Intel.
- ![Linux logo](https://img.icons8.com/color/24/linux.png) **Linux x64** — AppImage và Debian `.deb`.

## Chạy nhanh từ mã nguồn

```bash
npm install
npm start
```

## Chức năng MVP

- Chế độ đăng nhập demo lưu cục bộ trên thiết bị.
- Upload nhiều ảnh JPG, PNG, WebP và GIF.
- Thư viện dạng lưới, lọc ảnh tĩnh/GIF.
- Màn hình chi tiết ảnh.
- Xóa ảnh khỏi thư viện.
- Đặt ảnh tĩnh làm hình nền Windows qua PowerShell `SystemParametersInfo`.
- Đặt GIF làm **live wallpaper Windows**: GIF được phát lặp trên tất cả màn hình ở lớp nền phía sau cửa sổ ứng dụng.
- Sau khi đặt GIF, cửa sổ ChillTheme tự ẩn xuống **system tray** như các app wallpaper trên Steam; bấm biểu tượng tray để mở lại, dừng wallpaper hoặc thoát app.
- GIF vẫn được phát động trong giao diện xem trước và có phân loại `GIF / LIVE`.

## Build thủ công

```bash
npm run build
```

Hoặc build riêng từng nền tảng:

```bash
npm run build:win
npm run build:mac
npm run build:linux
```

Lệnh trên tạo bộ cài theo hệ điều hành của máy đang build. Khi push tag phiên bản, GitHub Actions sẽ build riêng trên runner Windows, macOS và Ubuntu rồi đính kèm file vào GitHub Release.

## Ghi chú kiến trúc

Dữ liệu ảnh hiện được lưu trong `localStorage` để có thể chạy ngay không cần backend. Đây là lớp prototype; phiên bản tiếp theo nên thay bằng SQLite/IndexedDB cho thư viện lớn, sau đó kết nối Auth và object storage để đồng bộ tài khoản giữa các thiết bị.

Windows không có API wallpaper mặc định nhận GIF trực tiếp. ChillTheme dùng `WorkerW` của Windows để gắn một cửa sổ nền không tương tác phía sau desktop icons, phủ theo virtual desktop và phát GIF lặp. App chính được giữ trong system tray để wallpaper tiếp tục chạy giống các ứng dụng wallpaper trên Steam.
