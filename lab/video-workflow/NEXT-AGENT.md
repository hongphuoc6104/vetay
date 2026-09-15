# Giao việc cho agent ở phiên mới

Chọn nhánh channel/science hoặc channel/storytelling. Đọc AGENTS.md, CHANNEL.md, lab/video-workflow/README.md và CHANNEL-PREPARATION.md. Không cần lịch sử hội thoại.

## Chỉ chuẩn bị

Người dùng cung cấp đề tài. Agent chọn đúng loại nội dung, thu hẹp một câu hỏi/tình huống, tạo thư mục tập bằng init, hoàn thiện hồ sơ kênh và nội dung. Chạy validate, rough; xem hình chủ đạo và sửa chuyển động. Chạy ready sau kiểm tra. Bàn giao đường dẫn gói, bản thô và giới hạn. Dừng trước tạo giọng khi yêu cầu chỉ chuẩn bị.

## Sản xuất từ gói đã có

Đọc toàn bộ gói, doctor, validate. Nếu thiếu readiness ở cache mới, xuất rough và kiểm tra trước ready. Chạy produce --scale 0.5, xem bản thử và các ảnh, sửa nếu cần; cuối cùng produce --scale 1 rồi check. Bàn giao final.mp4, subtitles.srt, key.png, index.html, báo cáo kiểm tra. Nếu thay nội dung gói phải chạy lại rough/ready; không viết tay dấu xác nhận.

## Tiêu chí báo cáo trung thực

Không gọi kiểm tra giải mã là đã xem/nghe toàn video. Báo riêng kiểm tra tự động, khung hình, nghe và xem tốc độ thường. Không gọi bài mẫu kỹ thuật là đã chứng minh chất lượng nội dung hoặc thị hiếu. Không hứa số tập/ngày trước khi đo quá trình làm tập mới.

## Sau nâng cấp hai kênh

Đọc CHANNELS.md và channels/<kênh>/CHANNEL.md. Dùng đường dẫn gói đầy đủ trong repo để sản xuất nội dung kênh; ID ngắn dành cho ví dụ hồi quy. channel.json quyết định giọng mặc định, tập có thể ghi đè. Tập mới cần kiểm tra nội dung và khung hình riêng. Không coi giọng tạm đã được người dùng chọn. Tình trạng từng pilot nằm ở handoff.md của nó, ưu tiên hơn danh sách công việc cũ ở trên.
