# Nét — vẽ tay thuần

Nhánh `ve-tay-thuan`: AI nhận đề tài, sáng tác câu chuyện bằng hình và dựng video tiếng Việt 165–180 giây, 1080×1920, 30fps. Hình thuần nét vẽ, lời Adam, phụ đề SRT riêng. Quy trình chính nằm trong [skill](sys/skill/cinematic-tutorial-video/SKILL.md); AGENTS, CLAUDE và GEMINI cùng dẫn về đó.

## Cài và kiểm tra

Môi trường cần: Linux, Node.js 20.15+ (khuyến nghị bản LTS hỗ trợ import.meta.dirname), npm, uv, Python 3.12, FFmpeg/ffprobe có libx264 và Google Chrome. Nếu Chrome ở nơi khác, đặt CHROME_PATH. Cần mạng để cài thư viện và tải mô hình lần đầu; chưa xác nhận macOS/Windows. Máy thử có RAM 16 GB; tạo giọng xong rồi dựng từng video.

```sh
git clone --branch ve-tay-thuan https://github.com/hongphuoc6104/vetay.git
cd vetay
node sys/engine/studio.mjs setup
node sys/engine/studio.mjs doctor
```

Setup tạo môi trường Python, cài phụ thuộc khóa phiên bản của Node và tải Adam vào `sys/models`. Voice sử dụng đúng kho này ở chế độ offline. Doctor thực sự mở mô hình/preset, kiểm tra font, Chrome và bộ mã hóa. Không commit mô hình, audio, video hoặc cache.

## Giao việc cho AI

> Đọc AGENTS.md và skill trong repo. Tạo video thuần vẽ tiếng Việt khoảng 3 phút về [đề tài], dùng Adam và quy trình kiểm tra có sẵn. Tự hoàn thiện kịch bản, đồng bộ lời–hình và xuất video.

AI cần quyền đọc/ghi file và chạy công cụ local. Skill đóng gói quy tắc và công cụ; AI vẫn sáng tác hình theo đề tài. Chưa khẳng định mọi AI đều tạo chất lượng như nhau.

Các lệnh `new-video-from-topic`, `voice`, `validate`, `preview`, `render`, `resume` được hướng dẫn trong [quy trình](sys/skill/cinematic-tutorial-video/references/drawing-first.md), kèm ví dụ cây cầu có lời khoảng 3 phút và lệnh tái tạo. Đầu ra chính: `video/<category>/<slug>/final.mp4`, `final.srt`, `cover.png`, kịch bản, nguồn và báo cáo. Bản khung cũ chỉ còn trong mã tương thích để kiểm thử.

## Kiểm thử và đóng gói

```sh
npm --prefix sys/engine test
npm --prefix sys/engine run test:drawing
npm --prefix sys/engine run test:transport
python3 sys/engine/package-core.py --help
```

Xem [kết quả kiểm chứng](sys/skill/cinematic-tutorial-video/references/verification.md) để biết phạm vi đã thử và giới hạn thực tế.

## Nhận diện Bản đồ học thuật

Intro đường bản đồ 1,5 giây, chỉ đổi từ khóa; outro có avatar, tên kênh và lời Adam đã dựng sẵn. Studio tự ghép và dịch phụ đề. Mỗi project cần `keyword` 1–4 từ. Thân bài mặc định 158,5–173,5 giây để tổng video giữ 165–180 giây. Xem [hướng dẫn nhận diện](sys/skill/cinematic-tutorial-video/references/identity.md). Media nhận diện có phiên bản là ngoại lệ duy nhất được commit; audio/video từng tập vẫn chỉ lưu local.
