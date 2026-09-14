# Vẽ tay — cinematic tutorial skill

Skill tạo video hướng dẫn tiếng Việt: tư liệu thật, nét vẽ dẫn mắt, giọng Adam và hai bộ màu với template sáng/tối. AI đọc `sys/skill/cinematic-tutorial-video/SKILL.md`, lập nội dung cảnh để người dùng duyệt, sau đó sản xuất trên máy local.

## Bắt đầu

Yêu cầu: Node.js 20.15 trở lên, npm, Python 3.12, uv, FFmpeg/ffprobe và Chrome. Bộ công cụ hiện được kiểm tra trên Linux; cấu hình trình duyệt bằng `CHROME_PATH` khi cần.

```sh
node sys/engine/studio.mjs setup
node sys/engine/studio.mjs doctor
node sys/engine/studio.mjs new-video-from-topic --slug bai-hoc --topic "Chủ đề cần hướng dẫn" --duration 30
```

`setup` có thể tải mô hình giọng đọc miễn phí; những lần tạo giọng sau dùng local. Agent điền các cảnh và viết bộ dựng riêng cho dự án dưới `sys/work/<slug>/`. Các lệnh không tự sinh kịch bản hoặc hoạt ảnh bằng một mô hình AI tích hợp.

```sh
python3 sys/engine/timing.py sys/work/bai-hoc/speech.json --output sys/work/bai-hoc/timeline.json
node sys/engine/studio.mjs preview --slug bai-hoc --start 0 --end 5
node sys/engine/studio.mjs render --slug bai-hoc
```

Đọc quy tắc và định dạng thời gian trong `sys/skill/cinematic-tutorial-video/references/pause-policy.md`. Renderer nhận đường dẫn manifest, timeline đã kiểm tra, thư mục đầu ra và khoảng preview; phải sử dụng timeline chung cho lời, phụ đề và điểm nhấn hình.

## Dữ liệu và giới hạn hiện tại

- `sys/skill`, `sys/engine`, `sys/templates`: lõi dùng lại được đưa vào Git.
- `sys/work`, `sys/models`, `sys/cache`, `sys/logs`, môi trường và thư viện đã cài: chỉ ở local.
- `video/<nhóm>/<video>/`: sản phẩm xuất ra, không đưa vào Git.
- Mã và kết quả demo, các phiên bản giọng thử, sơ đồ kiến trúc không có trong bản phát hành này.

Skill được khám phá qua `.agents/skills`; các ứng dụng có quyền đọc/ghi và chạy lệnh local cũng có thể đọc trực tiếp SKILL.md. Chưa hoàn thiện bộ cài riêng và kiểm chứng trên tất cả ứng dụng desktop.

Không yêu cầu dịch vụ trả phí. Giữ ghi nhận nguồn tư liệu nội bộ; chỉ hiện nguồn khi cần cho số liệu, trích dẫn, phát biểu theo nguồn hoặc giấy phép. Logo do chủ dự án cung cấp; các thư viện và mô hình giữ giấy phép riêng của nhà phát hành.
