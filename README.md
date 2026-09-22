# ChillTheme

ChillTheme là ứng dụng desktop Windows để lưu thư viện hình nền cá nhân, xem ảnh/GIF và đặt ảnh tĩnh làm hình nền máy.

## Chạy nhanh

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

## Ghi chú kiến trúc

Dữ liệu ảnh hiện được lưu trong `localStorage` để có thể chạy ngay không cần backend. Đây là lớp prototype; phiên bản tiếp theo nên thay bằng SQLite/IndexedDB cho thư viện lớn, sau đó kết nối Auth + object storage để đồng bộ tài khoản giữa các thiết bị.

Windows không có API wallpaper mặc định nhận GIF trực tiếp. Để biến GIF/video thành live wallpaper thực sự, cần thêm một wallpaper engine native chạy sau desktop icons; UI và IPC đã được tách riêng để bổ sung engine đó mà không đổi luồng người dùng.

## Build installer Windows

```bash
npm run build
```

Lệnh build cần chạy trên Windows hoặc với toolchain cross-build phù hợp.
