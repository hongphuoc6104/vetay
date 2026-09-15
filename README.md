# Vẽ tay — cinematic tutorial skill

Skill tạo video hướng dẫn tiếng Việt: tư liệu thật, nét vẽ dẫn mắt, giọng Adam và hai bộ màu với template sáng/tối. AI đọc `sys/skill/cinematic-tutorial-video/SKILL.md`, lập nội dung cảnh để người dùng duyệt, sau đó sản xuất trên máy local.

Để giao việc cho AI khác, mở repo và yêu cầu: “Đọc AGENTS.md, dùng skill cinematic-tutorial-video tạo video về [chủ đề] cho [người xem], dài [thời lượng]. Làm theo step-by-step.md và clean-pen-direction.md; dùng bộ dựng có sẵn, trình nội dung từng cảnh để tôi duyệt.” Không cần đưa kèm cuộc trò chuyện hoặc các bản demo riêng.

## Bắt đầu

Yêu cầu: Node.js 20.15 trở lên, npm, Python 3.12, uv, FFmpeg/ffprobe và Chrome. Bộ công cụ hiện được kiểm tra trên Linux; cấu hình trình duyệt bằng `CHROME_PATH` khi cần.

```sh
node sys/engine/studio.mjs setup
node sys/engine/studio.mjs doctor
node sys/engine/studio.mjs new-video-from-topic --slug bai-hoc --topic "Chủ đề cần hướng dẫn" --duration 30
```

`setup` có thể tải mô hình giọng đọc miễn phí; những lần tạo giọng sau dùng local. Agent viết nội dung cảnh bằng các thành phần **net-cinematic-v1** dưới `sys/work/<slug>/`; renderer dùng chung giữ nền, chữ, nét bút, camera và chuyển cảnh. Không cần tự viết renderer. Các lệnh không tự sinh kịch bản bằng một mô hình AI tích hợp.

```sh
python3 sys/engine/timing.py sys/work/bai-hoc/speech.json --output sys/work/bai-hoc/timeline.json
node sys/engine/studio.mjs preview --slug bai-hoc --start 0 --end 5
node sys/engine/studio.mjs render --slug bai-hoc
```

Đọc `sys/skill/cinematic-tutorial-video/references/visual-authoring.md` để viết cảnh và `references/pause-policy.md` trong cùng thư mục để xếp lời đọc. Renderer nhận manifest, timeline đã kiểm tra, thư mục đầu ra và khoảng preview; dùng cùng timeline cho lời, phụ đề và điểm nhấn hình. Mỗi cảnh dùng theme cụ thể; auto chọn sáng cho hướng dẫn và tối cho mở/kết.

Kiểm tra bộ dựng bằng ví dụ trung tính không cần audio hoặc video demo cũ:

```sh
node sys/engine/examples/create-neutral.mjs
node sys/engine/visual/render.mjs --project sys/work/neutral/project.json --timeline sys/work/neutral/timeline.json --output sys/work/neutral/output
python3 -m unittest discover -s sys/engine/tests
node --test sys/engine/tests/visual.test.mjs
node sys/engine/tests/visual-browser.mjs
```

Ví dụ kiểm tra dài 3 giây, âm thanh im lặng có chủ đích để kiểm thử renderer. Không phải sản phẩm hướng dẫn. Video thực tế phải có giọng và qua bộ kiểm tra ngắt nghỉ. Report `visual-report.json` ghi cache, theme và khoảng đứng hình; vùng phụ đề không được dùng để che giấu nội dung đứng yên.

## Dữ liệu và giới hạn hiện tại

- `sys/skill`, `sys/engine`, `sys/templates`: lõi dùng lại được đưa vào Git.
- `sys/work`, `sys/models`, `sys/cache`, `sys/logs`, môi trường và thư viện đã cài: chỉ ở local.
- `video/<nhóm>/<video>/`: sản phẩm xuất ra, không đưa vào Git.
- Mã riêng và kết quả demo, các phiên bản giọng thử, sơ đồ kiến trúc không có trong repo. Thành phần phong cách được trích từ demo đã duyệt là lõi dùng chung và được phát hành.

Skill được khám phá qua `.agents/skills`; các ứng dụng có quyền đọc/ghi và chạy lệnh local cũng có thể đọc trực tiếp SKILL.md. Chưa hoàn thiện bộ cài riêng và kiểm chứng trên tất cả ứng dụng desktop.

Không yêu cầu dịch vụ trả phí. Giữ ghi nhận nguồn tư liệu nội bộ; chỉ hiện nguồn khi cần cho số liệu, trích dẫn, phát biểu theo nguồn hoặc giấy phép. Logo do chủ dự án cung cấp; các thư viện và mô hình giữ giấy phép riêng của nhà phát hành.

## Intro, cover and outro

New projects include `publication` metadata. The shared renderer keeps the main keyword and title visible from frame 0, extracts the configured `coverFrame` (default frame 15 at 30fps), and shows the supplied light or dark avatar in a separate final region. It writes `*-publishing.json` and `*-publishing.md` beside the MP4 with the exact cover frame and posting notes. Read [publication.md](sys/skill/cinematic-tutorial-video/references/publication.md) before authoring.

## Template-first production

Run `node sys/engine/studio.mjs templates` and read [the template workflow](sys/skill/cinematic-tutorial-video/references/templates.md). New projects use content slots with measured narration cues. The expanded templates are candidates pending visual review, not automatically approved designs. `AGENTS.md`, `CLAUDE.md` and `GEMINI.md` route local agents to the same rules; this does not prove that every desktop application auto-loads them.

The default binary renderer streams PNG data into FFmpeg and caches verified H.264 chunks instead of writing every frame as a PNG. `--transport legacy-png` remains an explicit diagnostic option. Use `studio.mjs cache` for a dry-run cache inventory. No automatic deletion of old renders is performed.
