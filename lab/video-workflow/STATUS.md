# Trạng thái quy trình

Bộ công cụ hai bước nhận mã tập, cảnh và thời lượng từ gói, không còn giới hạn mirror/pump. Có WAV local/import, cache giọng, phụ đề, âm sự kiện, xuất thử/cuối, khóa runtime và kiểm tra tệp trước khi thay bản cuối.

Hai gói shadow-key và speaker được agent chuẩn bị tạo. Agent sản xuất độc lập đọc tài liệu, xuất chuyển động thô, phát hiện lỗi hạt khí và sửa; agent chính tiếp quản lời đọc, preview và xuất cuối. Đây là kiểm chứng bàn giao đến bước chuẩn bị/sản xuất thô, không tuyên bố agent độc lập đã tự hoàn thành toàn bộ bước cuối.

Các khung preview có giọng đã được xem. Chưa nghe toàn bộ hoặc xem toàn bộ ở tốc độ thường. Báo cáo kỹ thuật final-report.json tại cache ghi độ phân giải, thời lượng, mã kiểm tra và thời gian xuất. Không gọi full decode là đã xem/nghe.

Hồ sơ riêng của hai kênh có validator và mẫu khai báo. Những gói kỹ thuật cũ giữ tương thích. Hai tập kỹ thuật chưa thay thế vòng nội dung đời sống/paper-review; công việc đó được ghi trong NEXT-AGENT.md.

Nhánh nền main quản lý công cụ chung; hai nhánh channel/science và channel/storytelling kế thừa thay đổi công cụ, giữ CHANNEL.md riêng. Không commit dữ liệu lớn, giữ cache dưới 30 GB và dự trữ 20 GB trống.
