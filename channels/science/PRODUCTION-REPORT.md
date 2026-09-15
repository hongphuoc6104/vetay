## Quyết định hiện hành — người dùng đã chốt

Giọng mặc định: **Phạm Tuyên**, speed 1.0, temperature 0.7, version 3. Người dùng đã xác nhận cả hai video ổn và chốt hai giọng. Không thử/chọn lại giọng hoặc đổi người kể nếu không được yêu cầu. Điều chỉnh lời và khoảng nghỉ theo nội dung; kiểm tra phát âm mỗi tập. Ghi chú chờ duyệt ở phần lịch sử phía dưới đã hết hiệu lực về lựa chọn giọng.

# Pilot metal-wood — 2026-09-16

Đã xuất rough, preview và final. Final: 30 giây, 1080×1920, 30 fps, 900 khung; kiểm giải mã đạt. Lượt xuất cuối 48.9 giây, không tính tạo giọng/chuẩn bị/sửa hình. SHA256: `8374c370c80b7d2de9db7fd1d17665a9250e1786b17e6fdadd325103eebf8b4d`.

Đầu ra: `$VIDEO_LAB_CACHE/video-workflow/science/metal-wood/` gồm final.mp4, subtitles.srt, mix.wav, key.png, index.html và báo cáo JSON. Câu đọc cache riêng dùng chung.

Nguồn Exploratorium/ACS đã được agent chuẩn bị kiểm tra, ledger ghi vị trí/giới hạn. Đã xem mở/giữa/cuối rough và các khung preview có phụ đề: tiếp xúc đúng, dòng nhiệt sau chạm, không có hạt vật chất bay theo dòng nhiệt. Phụ đề không che cơ chế. Thời gian phụ đề không chồng hoặc vượt thời lượng; chưa forced alignment.

Giọng Phạm Tuyên, tốc độ gốc. Người dùng thích nền giọng, vẫn yêu cầu tinh chỉnh cách truyền đạt. Mẫu câu đã chỉnh theo giọng giải thích tự nhiên; không tuyên bố đã duyệt giọng cả tập. Mẫu tinh chỉnh ở `$VIDEO_LAB_CACHE/video-workflow/voice-refinement/`.

Nghe toàn bộ: chưa kiểm chứng. Xem toàn bộ tốc độ thường: chưa kiểm chứng. Khung hình/decode không thay thế hai việc đó. Pilot chỉ kiểm chứng explain; paper-review/tutorial/news/scientific-writing mới có hướng dẫn chuẩn bị, chưa kiểm chứng bằng video.

Agent riêng chuẩn bị, agent chính tích hợp và sản xuất. Chưa kiểm chứng agent sản xuất độc lập hoàn tất tới bản cuối trong lượt này.
