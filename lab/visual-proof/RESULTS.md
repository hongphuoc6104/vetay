# Kết quả hai mẫu đồ họa

- Hai cảnh 22 giây, 1080×1920 thực, 30 fps, 660 khung; có lời Việt và phụ đề.
- Truyện: nhân vật và hình phản chiếu riêng, trễ động tác, rời cảnh và vẫy tay. Hình tự thiết kế, chuyển động giới hạn theo phong cách 2D.
- Khoa học: sơ đồ hút–nén–đẩy với van một chiều; đây là minh họa nguyên lý, không phải mô phỏng khí hoặc cấu tạo chung cho mọi sản phẩm. Cần piston đủ dài để tay cầm luôn ở ngoài thân bơm.
- Đã kiểm tra contact sheet và khung quan trọng, sửa vị trí tay chạm gương, cần piston và khe khí qua thành bơm.
- Kiểm tra giải mã toàn video, số khung, độ phân giải, âm thanh và thời lượng bằng `check.py`.
- Chưa kiểm chứng nghe toàn bộ giọng và chưa hoàn thành xem toàn bộ ở tốc độ thường; không coi các kiểm tra tự động thay thế việc này.
- Lời kể và tiếng hiệu ứng được tạo local. Không phát sinh phí API, không tải model mới.
- Đầu ra: `video-lab-cache/trials/visual-proof/`, gồm MP4, ảnh bìa, SRT, WAV, checks.json và index.html. Thời gian xuất thực nằm trong checks.json.
- Giới hạn: diễn xuất nhân vật còn cách điệu, ánh sáng 2D; camera khoa học giữ toàn cơ cấu, chưa có cảnh cận van riêng. Đây là hai mẫu để người dùng đánh giá, chưa khẳng định đạt chất lượng mong muốn.
