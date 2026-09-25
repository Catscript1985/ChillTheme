# ChillTheme

ChillTheme là ứng dụng desktop offline-first để lưu, xem và thay hình nền Windows qua app. Từ v0.3.0, bạn có thể chọn giữa **nền Windows native** hoặc **đè màn overlay**.

## Tải bản mới nhất

Các link dưới đây luôn trỏ tới asset của **GitHub Release mới nhất**:

| Hệ điều hành | Tải xuống |
|---|---|
| [![Windows](https://img.shields.io/badge/Windows-10%2F11-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-Windows-x64.exe) | [Tải bản Windows x64](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-Windows-x64.exe) |
| [![macOS](https://img.shields.io/badge/macOS-12%2B-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-macOS-arm64.dmg) | [Apple Silicon](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-macOS-arm64.dmg) · [Intel](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-macOS-x64.dmg) |
| [![Linux](https://img.shields.io/badge/Linux-x64-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-Linux-x86_64.AppImage) | [AppImage x64](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-Linux-x86_64.AppImage) · [DEB](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-Linux-amd64.deb) |

> Repository đang ở chế độ Private. Cần đăng nhập GitHub bằng tài khoản có quyền truy cập repo; nếu chưa đăng nhập, GitHub có thể hiển thị `404`.

## Hai chế độ hình nền

### 1. Thay nền Windows native

Ảnh được ghi thành file nền và gọi `SystemParametersInfo`, giống thao tác thay hình nền thủ công trong Windows. Không có cửa sổ phủ lên desktop. Ảnh được chuẩn hóa về 2560 × 1440, dùng chế độ Fill và tự căn tâm để phù hợp màn hình. Nút **Gỡ nền native** khôi phục lại nền Windows đã được ChillTheme lưu trước đó.

### 2. Đè màn overlay

Nút **Đè màn** tạo một cửa sổ overlay riêng cho từng màn hình rồi gắn vào lớp desktop `WorkerW` của Windows. Vì vậy nền động nằm sau icon desktop và sau mọi ứng dụng đang mở, không còn phủ lên cửa sổ máy tính. Ảnh được tự căn theo đúng kích thước từng display bằng `object-fit: cover`, vì vậy không còn bị nhỏ hơn màn hình hoặc xuất hiện viền đen. Hệ thống sẽ crop phần dư nhỏ nếu tỷ lệ ảnh khác tỷ lệ màn hình để giữ chủ thể ở giữa và phủ kín toàn bộ display. GIF được giữ nguyên file động ở chế độ này nên vẫn phát animation. Overlay tiếp tục chạy khi bấm nút đóng vì ChillTheme được giữ trong system tray.

- **Đè màn:** bật overlay trên tất cả màn hình.
- **Gỡ đè:** đóng riêng các cửa sổ overlay, không thay đổi nền Windows native.
- **Tắt cửa sổ app:** overlay không mất; ChillTheme tiếp tục chạy trong system tray.
- **Thoát ChillTheme từ tray:** overlay sẽ được gỡ để không để lại tiến trình nền.

## Các tính năng khác

- Không cần đăng nhập; mở app là dùng.
- Thư viện ảnh lưu cục bộ trên thiết bị.
- Upload JPG, PNG, WebP và GIF.
- GIF ở **Đè màn** giữ nguyên animation. GIF ở **Thay nền Windows native** dùng khung hình đầu tiên và chuyển thành PNG vì Windows native không phát GIF động trực tiếp.
- Nguồn ảnh 2K–4K được khuyến nghị để đạt độ nét tốt.

## Chạy từ mã nguồn

```bash
npm install
npm start
```

## Build

```bash
npm run build
```

GitHub Actions tự build Windows, macOS và Linux khi push tag phiên bản `v*.*.*`, sau đó publish asset vào GitHub Release. Các link `releases/latest/download/...` trong README luôn tự trỏ đến bản mới nhất.

## Trang giới thiệu

Mở trang giới thiệu tĩnh tại [Catscript1985.github.io/ChillTheme](https://catscript1985.github.io/ChillTheme/). Workflow deploy nằm trong `.github/workflows/pages.yml`.

## Giới hạn

Chức năng native Windows và overlay được triển khai cho Windows. macOS và Linux vẫn được đóng gói để phát triển giao diện/thư viện; cơ chế wallpaper riêng cho từng hệ điều hành sẽ được bổ sung sau.
