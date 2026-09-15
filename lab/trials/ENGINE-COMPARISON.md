# So sánh hai bộ dựng

Cùng hai cảnh, nhân vật, đạo cụ, lời kể và mốc phụ đề; xuất dọc1080×1920,30fps,15giây. Cả hai có450khung video, track âm thanh15giây mono48kHz. PCM giải mã từ hai MP4 có cùng SHA256 trong kiểm tra. Các khung2/6/10giây đã được so sánh: nội dung tương ứng; thanh tiến trình Motion Canvas cao hơn khoảng40pixel, chữ/viền có sai khác nhỏ giữa DOM và canvas.

| Bộ dựng | Lượt xuất đầy đủ | Ghi chú |
|---|---:|---|
| Remotion |58,14giây|Một khung xử lý mỗi lần, clip từng cảnh rồi nối|
| Motion Canvas |32,86giây|Xuất PNG rồi ghép âm thanh bằng FFmpeg|

Đây là một lượt đo trên máy đang chạy ứng dụng khác, cache đã ấm; không phải benchmark hiệu năng tổng quát. Motion Canvas xuất451PNG gồm mốc cuối, MP4 giới hạn đúng450khung. RAM đo của Motion Canvas không gồm máy chủ Vite, nên không so trực tiếp với tổng cây tiến trình Remotion.

Chọn Remotion làm bộ dựng chính cho bản thử hiện tại vì đã hỗ trợ bốn phong cách, đầu vào tập, cache cảnh, phụ đề và kiểm tra. Motion Canvas là ứng viên tối ưu tốc độ và vẽ nét; cần chuyển đủ các mẫu rồi đo lại trước khi thay bộ dựng chính. Không kết luận Remotion nhanh hơn.

Đầu ra local: cache/trials/benchmark/final.mp4 và cache/trials/motion-benchmark/final.mp4. Đoạn vẽ nét10giây: cache/trials/motion-reveal/preview.mp4.
