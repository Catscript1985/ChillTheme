# ChillTheme

Ứng dụng desktop để lưu thư viện hình nền cá nhân, xem ảnh/GIF và đặt ảnh tĩnh làm hình nền máy. ChillTheme hiện được đóng gói cho **Windows, macOS và Linux**.

## Tải trực tiếp

Các file cài đặt được build tự động bằng GitHub Actions và đính kèm trong bản phát hành mới nhất:

| Hệ điều hành | Tải xuống |
|---|---|
| [![Windows](https://img.shields.io/badge/Windows-10%2F11-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-Windows-x64.exe) | [Tải bản Windows x64](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-Windows-x64.exe) |
| [![macOS](https://img.shields.io/badge/macOS-12%2B-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-macOS-arm64.dmg) | [Tải bản macOS Apple Silicon](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-macOS-arm64.dmg) · [Intel](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-macOS-x64.dmg) |
| [![Linux](https://img.shields.io/badge/Linux-x64-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-Linux-x86_64.AppImage) | [Tải AppImage Linux x64](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-Linux-x86_64.AppImage) · [DEB](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-Linux-x86_64.deb) |

> Nếu link tải báo chưa có file, hãy mở mục [Releases](https://github.com/Catscript1985/ChillTheme/releases) và chọn bản phát hành mới nhất. GitHub Actions sẽ tạo file sau mỗi tag phiên bản dạng `v0.1.0`.

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
- GIF được phát động trong giao diện xem trước và đã có phân loại `GIF / LIVE`.

## Build thủ công

```bash
npm run build
```

Lệnh trên tạo bộ cài theo hệ điều hành của máy đang build. Khi push tag phiên bản, GitHub Actions sẽ build riêng trên runner Windows, macOS và Ubuntu rồi đính kèm file vào GitHub Release.

## Ghi chú kiến trúc

Dữ liệu ảnh hiện được lưu trong `localStorage` để có thể chạy ngay không cần backend. Đây là lớp prototype; phiên bản tiếp theo nên thay bằng SQLite/IndexedDB cho thư viện lớn, sau đó kết nối Auth và object storage để đồng bộ tài khoản giữa các thiết bị.

Windows không có API wallpaper mặc định nhận GIF trực tiếp. Để biến GIF/video thành live wallpaper thực sự, cần thêm một wallpaper engine native chạy sau desktop icons; UI và IPC đã được tách riêng để bổ sung engine đó mà không đổi luồng người dùng.
