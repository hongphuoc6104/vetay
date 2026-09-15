# Quy trình video hai bước

Agent mới bắt đầu ở đây. Quy trình này nhận một đề tài mới, không yêu cầu đọc lịch sử trò chuyện. Hai tập shadow-key và speaker là ví dụ tái tạo, không phải khuôn cảnh bắt buộc.

## 1. Chuẩn bị

Đọc yêu cầu người dùng, xác định một câu hỏi/câu chuyện đủ hẹp. Mặc định tiếng Việt, phổ thông 15+, 30 giây, 1080×1920, 30 fps, 2D. Nếu chỉ được yêu cầu chuẩn bị, dừng sau gói sẵn sàng. Nếu được yêu cầu làm hoàn chỉnh thì tự tiếp tục sản xuất.

Chạy từ gốc repository:

```sh
python3 lab/video-workflow/workflow.py doctor
python3 lab/video-workflow/workflow.py init ten-tap
```

Hoàn thiện `episodes/ten-tap/`:

- `episode.json`: id, title, domain (`story`/`science`), audience, language, duration, width, height, fps, status; scenes, assets, sources.
- Mỗi scene: id duy nhất, text lời kể, seconds dự kiến, action, camera. Tổng seconds bằng duration. Có thể thêm audio là đường dẫn WAV PCM tương đối để dùng lời đọc đã có.
- assets: path tương đối trong gói, source, license. Hình tự vẽ bằng mã cũng được ghi nguồn là original. Không chỉ dẫn đến tệp tình cờ tồn tại trong cache.
- sources: mỗi mục có url và claim được hỗ trợ; bắt buộc cho khoa học. Người chuẩn bị phải thật sự đọc nguồn, không chỉ thêm URL để vượt kiểm tra.
- `script.md`: nội dung hoàn chỉnh, câu chuyện/kết luận và lời kể.
- `design.md`: bảng màu, bộ phận, điểm xoay, lớp che, ánh sáng, vùng chữ. Hình phải thể hiện hành động/cơ chế; không dùng chữ dài hoặc dịch chuyển nhẹ thay nội dung.
- `checks.md`: các mốc cần xem, các điều không được sai, trạng thái kiểm tra thực tế.
- `handoff.md`: đã làm gì, còn thiếu gì, cách tiếp tục, nguồn và giới hạn; không để agent sau phải tự quyết nội dung cốt lõi.
- `scene.tsx`: xuất mặc định hàm generator `(view, timeline)`. timeline có duration và scenes với start/end/duration theo giây. Chuyển động dùng thời gian này, không ghi cứng thời lượng tập. Không tự tạo phụ đề; bộ dựng chung thêm chúng.

Truyện phải có hành động và hậu quả nhìn thấy được, kết thúc có chủ đích, ghi hư cấu. Khoa học phải có nguồn gốc đáng tin cậy, ánh xạ phát biểu với nguồn, ghi mô hình giản lược. Cơ chế chưa xác minh là lý do dừng chuẩn bị.

```sh
python3 lab/video-workflow/workflow.py validate ten-tap
python3 lab/video-workflow/workflow.py rough ten-tap
```

Xem opening.png, key.png, ending.png và thêm khung cho bố cục mới; xem bản rough. Sửa khớp, lớp che, va chạm chữ và logic. Chỉ khi đã kiểm tra, chạy:

```sh
python3 lab/video-workflow/workflow.py ready ten-tap
```

Lệnh ready ghi dấu xác nhận kỹ thuật trong cache, không thay thế kiểm tra của agent. Khi bàn giao sang máy/cache khác, agent nhận chạy lại rough và ready. Mọi thay đổi gói sau đó làm dấu sẵn sàng hết hiệu lực.

## 2. Sản xuất

Đọc toàn bộ gói, đặc biệt handoff và checks. Chạy validate và doctor. Nếu ready thiếu do đổi cache, khôi phục bằng rough/ready; không viết tay dấu xác nhận.

```sh
python3 lab/video-workflow/workflow.py produce ten-tap --scale 0.5
python3 lab/video-workflow/workflow.py produce ten-tap --scale 1
python3 lab/video-workflow/workflow.py check ten-tap
```

Lời đọc local tạo từng câu và lưu cache. Các cảnh được điều chỉnh trong tổng thời lượng để chứa giọng thật. Nếu tổng lời đọc quá dài, công cụ dừng: agent rút gọn câu giữ đúng ý, cập nhật gói, chạy rough/ready rồi sản xuất lại. Không tăng tốc thêm, không cắt cuối câu. Phụ đề là thời gian ước lượng theo cụm chữ, không phải forced alignment.

Xuất thử trước, xem hình rồi xuất cuối. Không coi full decode là đã xem/nghe. Ghi riêng kiểm tra kỹ thuật, khung hình, toàn video tốc độ thường và nghe toàn bộ. Những phần không thể kiểm chứng phải ghi rõ.

Đầu ra ở `$VIDEO_LAB_CACHE/video-workflow/ten-tap/`: rough.mp4, preview.mp4, final.mp4, subtitles.srt, mix.wav, timeline.json, các ảnh chủ đạo, báo cáo và index.html. final.mp4 chỉ được thay sau khi candidate.mp4 qua kiểm tra. Lưu bản cuối tốt khi lượt mới lỗi.

## Môi trường, di chuyển và khôi phục

Không đường dẫn tài khoản cố định. Mặc định cache nằm cạnh repo, dùng môi trường giọng/Playwright từ repo `vetay` cạnh đó. Máy khác cấu hình:

- VIDEO_LAB_CACHE: toàn bộ dữ liệu lớn.
- VIDEO_LAB_MC_RUNTIME: runtime Motion Canvas có node_modules.
- VIDEO_LAB_VOICE_PYTHON, VIDEO_LAB_MODELS: Python Vieneu và model offline đã có.
- VIDEO_LAB_PLAYWRIGHT: đường dẫn package Playwright.
- VIDEO_LAB_CHROME: Chrome thực thi.
- Node, npm, ffmpeg, ffprobe nằm trên PATH.

Motion Canvas đã kiểm chứng 3.17.2. Khôi phục runtime bằng `python3 lab/video-workflow/restore.py` theo khóa package đi kèm runtime/; không tải model tự động. Khi doctor thiếu voice, dùng WAV nhập hoặc thiết lập môi trường local rõ ràng. Không chuyển API trả phí.

Bộ xuất copy đầy đủ driver từ mã nguồn, không cần capture.cjs có sẵn trong cache. Runtime vẫn cần dependencies đã cài. Chỉ chạy một lượt dựng qua workflow tại một thời điểm; không đồng thời chạy bộ dựng cũ dùng cùng runtime.

Giới hạn tổng cache 30 GB, dự trữ 20 GB trống. Không xóa dữ liệu người dùng. Ghi mã/tài liệu/nguồn lên Git; không commit âm thanh, video, node_modules hoặc model.

## Tiếp tục khi lỗi

Đọc lỗi terminal và render.log trong đầu ra tập. Nếu sửa nội dung/hình, quay về rough/ready. Nếu chỉ sửa môi trường hoặc lỗi xuất, chạy lại produce. Âm thanh không đổi được tái sử dụng; video luôn xuất lại nên không lấy nhầm hình cũ. Quá trình con được kết thúc khi thất bại hoặc ngắt.

Các lỗi từng gặp cần tránh: tay không chạm đúng gương; phản chiếu dùng chung thời gian với người; cần piston quá ngắn làm tay cầm lọt vào thân; chữ chạm tay cầm; hạt khí xuyên thành hoặc van đóng. Với loa, phần tử khí dao động quanh vị trí cân bằng, sóng truyền đi nhưng hạt không bay từ loa đến tai.

## Cách giao việc

“Chuẩn bị video khoa học 30 giây về cách loa tạo âm thanh, theo lab/video-workflow. Dừng ở gói sẵn sàng sản xuất.”

“Đọc gói episodes/ten-tap và hoàn thành bước sản xuất theo lab/video-workflow; bàn giao MP4, SRT, ảnh bìa và báo cáo.”

Đây là quy trình sáng tác có agent và kiểm tra, không phải máy tự tạo mọi câu chuyện từ một dòng mô tả. Kiểm tra kỹ thuật không bảo đảm chất lượng thẩm mỹ.

### Âm thanh theo sự kiện

Hồ sơ có thể thêm `effects`: mỗi mục gồm scene (mã cảnh), offset (giây từ đầu cảnh), frequency (Hz), duration (giây), gain (0–0.08). Bộ dựng tổng hợp tiếng ngắn có độ tắt dần tại local. Đây là âm gợi ý sự kiện, không phải âm thu thực tế. Cảnh có text rỗng được giữ im lặng có chủ đích; không buộc phải thêm lời giải thích.

## Hai kênh riêng

Đọc `CHANNEL-PREPARATION.md` để thêm hợp đồng biên tập phù hợp kênh. `channel/science` và `channel/storytelling` có định hướng riêng ở `CHANNEL.md`; bộ dựng vẫn chung. Các gói cũ chưa có trường channel được chấp nhận để chạy hồi quy; gói mới phải dùng mẫu hồ sơ kênh. Validator kiểm tra đủ thông tin, không tự xác nhận tính đúng của nguồn. `NEXT-AGENT.md` là hướng dẫn bàn giao ngắn cho phiên mới.
