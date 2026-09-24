# ChillTheme

ChillTheme là ứng dụng desktop offline-first để lưu, xem và thay hình nền Windows qua app. Bản mới chuyển sang **Windows native wallpaper**: nền được thay thật bằng API hệ thống, không còn cửa sổ live wallpaper đè lên desktop.

## Tải bản mới nhất

Các link dưới đây luôn trỏ tới asset của **GitHub Release mới nhất**, vì vậy README không cần sửa lại tên phiên bản sau mỗi lần phát hành:

| Hệ điều hành | Tải xuống |
|---|---|
| [![Windows](https://img.shields.io/badge/Windows-10%2F11-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-Windows-x64.exe) | [Tải bản Windows x64](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-Windows-x64.exe) |
| [![macOS](https://img.shields.io/badge/macOS-12%2B-000000?style=for-the-badge&logo=apple&logoColor=white)](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-macOS-arm64.dmg) | [Apple Silicon](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-macOS-arm64.dmg) · [Intel](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-macOS-x64.dmg) |
| [![Linux](https://img.shields.io/badge/Linux-x64-FCC624?style=for-the-badge&logo=linux&logoColor=black)](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-Linux-x86_64.AppImage) | [AppImage x64](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-Linux-x86_64.AppImage) · [DEB](https://github.com/Catscript1985/ChillTheme/releases/latest/download/ChillTheme-Linux-amd64.deb) |

> Repository đang ở chế độ Private. Cần đăng nhập GitHub bằng tài khoản có quyền truy cập repo; nếu chưa đăng nhập, GitHub có thể hiển thị `404`.

## Trang giới thiệu

Mở trang giới thiệu tĩnh của ChillTheme tại **[Catscript1985.github.io/ChillTheme](https://catscript1985.github.io/ChillTheme/)**. Trang này được deploy tự động từ thư mục `docs/` bằng GitHub Pages.

## Tính năng mới

- **Thay nền Windows native:** ảnh được ghi thành file nền và gọi `SystemParametersInfo`, giống thao tác thay hình nền thủ công trong Windows; không còn lớp cửa sổ phủ lên desktop.
- **Bỏ đăng nhập:** mở app là dùng ngay, không cần email, mật khẩu hay tài khoản demo.
- **Gỡ nền ChillTheme:** app tự lưu đường dẫn nền Windows trước lần thay đầu tiên. Nút **Gỡ nền ChillTheme** khôi phục nền gốc đã lưu.
- **Tự khớp màn hình:** Windows dùng chế độ `Fill`, tự phủ ảnh theo tỷ lệ màn hình để hạn chế khoảng trống; ảnh nguồn 2K–4K được khuyến nghị để đạt độ nét tốt.
- **GIF tương thích native:** GIF được lấy khung hình đầu tiên rồi chuyển thành PNG chất lượng cao trước khi đặt làm nền. Windows native không phát GIF động trực tiếp; muốn phát động cần wallpaper engine riêng.
- **Thư viện offline:** ảnh lưu cục bộ trên thiết bị, không cần backend.

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

## Giới hạn hiện tại

Chức năng native wallpaper mới cần Windows. macOS và Linux vẫn được đóng gói để phát triển giao diện/thư viện; thao tác thay nền native sẽ được bổ sung theo API riêng của từng hệ điều hành.
