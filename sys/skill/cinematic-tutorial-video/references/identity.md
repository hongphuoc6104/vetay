# Bản đồ học thuật — bộ nhận diện map-v1

Nhận diện là hai đoạn tách khỏi nội dung thuần vẽ. Không thêm khung chữ, avatar hoặc lời kêu gọi vào thân bài. Intro 1,5 giây có từ khóa hiện từ frame 0, đường bản đồ và điểm sao vàng. Outro đã dựng có avatar ở giữa, tên kênh phía dưới, biểu tượng thích/theo dõi và lời Adam “Hãy follow kênh và nhấn thích nhé.” Không có nhạc.

## Tạo video

Project cần `keyword` 1–4 từ, tối đa hai dòng ở cỡ chữ cố định. Với đề tài dài, AI tự chọn từ khóa đúng nghĩa; không lấy nguyên đề tài rồi thu nhỏ chữ. Intro tự dựng/cache theo từ khóa. `sys/templates/brand/identity.json` giữ tên, phiên bản và các thiết lập dùng chung. Media outro đi cùng repo, kiểm tra checksum trước khi dùng; không tạo lại Adam mỗi video.

`studio.mjs new-video-from-topic --slug NAME --topic "TOPIC" --keyword "KEYWORD"` tạo durationRange cho **thân bài** bằng 165–180 trừ intro và outro. Với map-v1 outro 5 giây, thân bài 158,5–173,5 giây. Các mốc cue/endCue trong project và timeline vẫn tính từ đầu thân bài; bộ ghép dịch SRT sau cùng. Kết luận riêng của bài phải nằm ở cuối thân bài.

`preview` mặc định ghép intro + 28 giây đầu + 4 giây cuối thân bài + outro, tổng 38,5 giây nếu thân bài đủ dài. Đây là bản rút đoạn có chủ đích, không phải bản đầy đủ. `--start`/`--end` thay khoảng đầu được lấy. `render`/`resume` ghép toàn bộ và kiểm tra tổng 165–180 giây. Project cũ có thân bài gần 180 giây phải rút phần lặp rồi tạo lại audio và cues; không cắt hoặc tăng tốc tự động.

Đầu ra: final.mp4, final.srt, cover.png (frame intro 27, tức 0,9 giây), final-assembly.json. Thân bài và log được giữ trong sys/work. Các đoạn hình được tái sử dụng qua cache; audio ghép được chuẩn hóa chung. Không tự đăng nền tảng.

## Tái tạo bộ nhận diện

Chỉ chạy khi sửa nhận diện hoặc lời kêu gọi, không chạy cho mỗi đề tài:

1. Tạo `sys/work/brand-voice/narration.json` với một phrase `cta`, sceneId `outro`, role `body`, text đúng câu CTA trong identity.json.
2. Chạy `node sys/engine/studio.mjs voice --slug brand-voice`. Có hai take, nghe và chọn nếu môi trường hỗ trợ; ghi rõ giới hạn nếu chưa nghe.
3. Chạy `node sys/engine/identity.mjs build-outro`. Nó đo lời, giữ tối thiểu 5 giây và đủ đuôi quan sát, xuất media cùng manifest checksum vào thư mục phiên bản. Không ép giọng để vừa thời gian.
4. Chạy `node sys/engine/identity.mjs intro "AI bịa"`; thử thêm “Cửa sổ ngữ cảnh” và “Học từ phản hồi”.
5. Khi thay mẫu đã phát hành, tăng version, dựng lại và commit media được cấp phép trong sys/templates/brand/media. Source SVG/canvas và cấu hình đi cùng repo. Avatar gốc không bị sửa.

Kiểm tra đoạn mẫu, góc chuyển, ảnh bìa, câu CTA, đồng bộ SRT và tổng thời lượng. Cache intro khác từ khóa phải khác hình; outro dùng lại đúng hash. Không ghi nhận kiểm tra nghe hoặc xem toàn bộ nếu mới chạy kiểm tra giải mã.
