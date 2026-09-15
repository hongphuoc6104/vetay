# Đầu vào và cách vận hành

Một tập JSON gồm `id`, `style` (vector/sketch/kenney/quickdraw), `series`, `title`, `episode` và `scenes`.
Mỗi cảnh: `id`, `heading`, `text`, `actor` (mã trong registry hoặc chuỗi rỗng), `symbol`, `label`, tùy chọn `setting` (shop/home/street/classroom), `prop`, `external`, `audio` (WAV tuyệt đối), `fixedSeconds`.
Đố hình thêm `drawing` (tên nhóm Quick Draw) và `sample` (chỉ số trong tập mẫu local).

`registry.json` lưu đường dẫn tương đối trong cache, nguồn, giấy phép, phong cách. Khi thêm ảnh ngoài, người sử dụng phải cung cấp nguồn và giấy phép; công cụ không tự xác nhận quyền sở hữu.

Pipeline:
1. Kiểm tra đầu vào/tài nguyên. Nếu thiếu, dừng có lỗi; không thay ảnh ngẫu nhiên.
2. Giọng Adam VieNeu3.6.4 local offline CPU, atempo0.85; cache theo nội dung/cấu hình. WAV ngoài bỏ qua sinh giọng.
3. Đo thời lượng WAV, thêm0.6s giữa cảnh; fixedSeconds chỉ được dùng nếu giọng đọc ngắn hơn cảnh.
4. Phụ đề chia từng câu thành nhóm tối đa7từ, phân bố thời gian ước lượng. Chưa forced alignment, cần người nghe duyệt phát âm và nhịp.
5. Preview Remotion540×960/30fps; final1080×1920/30fps. Mỗi lần một video, tối đa2khung xử lý song song trong Remotion (benchmark giữ1để so sánh). Final cache clip hình riêng từng cảnh, nối hình và âm thanh có cùng số giây để tránh tích lũy padding AAC.
6. `qa.py` kiểm tra giải mã toàn bộ, thông số, timeline/caption và tín hiệu âm thanh; tạo contact sheet. Đây không thay thế duyệt toàn bộ âm thanh/hình ở tốc độ bình thường.

Kết quả nằm trong cache/trials/ID: prepared.json, subtitles.srt, attribution.json, preview/final.mp4, số đo, QA.
Không đưa runtime/model/video vào Git. Dùng `gallery.py` cập nhật trang xem local.

Giới hạn: render theo mẫu không có diễn xuất khuôn mặt/khẩu hình; giọng sinh mới có thể khác giữa hai máy/lần sinh (chưa bảo đảm bit-identical), nhưng cache cho phép tái sử dụng bản đã tạo. Thời gian sửa tay của người dùng chưa được đo trong đợt chạy bằng agent này.
