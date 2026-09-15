# Hai kênh, một bộ sản xuất

`main` sở hữu công cụ và các ví dụ hồi quy. `channel/science` sở hữu `channels/science`; `channel/storytelling` sở hữu `channels/storytelling`. Không nhập nội dung kênh vào main. Đồng bộ công cụ bằng merge main vào từng nhánh, giữ CHANNEL.md riêng.

## Điểm vào

Đọc AGENTS.md → NEXT-AGENT.md → README.md → CHANNEL.md của nhánh → channels/<kênh>/CHANNEL.md → episode.json và tài liệu của tập. Mỗi nhánh kênh chạy trực tiếp trong cùng worktree. Không chạy hai lượt xuất đồng thời.

Ví dụ đường dẫn gói:

```
python3 lab/video-workflow/workflow.py validate channels/science/episodes/metal-wood
python3 lab/video-workflow/workflow.py rough channels/science/episodes/metal-wood
python3 lab/video-workflow/workflow.py ready channels/science/episodes/metal-wood
python3 lab/video-workflow/workflow.py produce channels/science/episodes/metal-wood --scale 0.5
python3 lab/video-workflow/workflow.py produce channels/science/episodes/metal-wood --scale 1
python3 lab/video-workflow/workflow.py check channels/science/episodes/metal-wood
```

Thay đường dẫn bằng channels/storytelling/episodes/unread-message cho truyện. Các ví dụ cũ vẫn nhận ID shadow-key/speaker. `init` nhận đường dẫn mới nhưng chỉ tạo bản nháp, không tự tạo hợp đồng kênh hay scene hoàn chỉnh.

## Bước 1: chuẩn bị

Đọc cấu hình kênh; hoàn thiện nội dung, nguồn, thiết kế, mã cảnh, kiểm tra riêng và hướng dẫn bàn giao. Gói phải chạy rough và được xem ở các mốc chính trước ready. Ghi rõ phần chưa nghe/xem. Không đánh dấu pass vì validator chạy thành công.

Tài nguyên dùng lại được quản lý trong assets của kênh. Vì renderer đóng gói thư mục tập, tài nguyên thực sự dùng phải được đưa vào gói tập cùng phiên bản/nguồn; không import ra ngoài gói. Khi nâng phiên bản tài nguyên phải cập nhật các bản dùng có chủ đích, không tự thay tất cả tập cũ.

## Bước 2: sản xuất

Voice được kế thừa từ channel.json; trường voice trong episode.json ghi đè có chủ đích. Các trường: preset, speed (0.85–1.1), temperature (0.1–1), version, dictionary (từ → cách đọc). Không dùng temperature như nút điều khiển cảm xúc. Chỉ dùng preset có sẵn offline.

Mỗi cảnh có `text` (phụ đề) và tùy chọn `spoken_text` (lời máy đọc), `pause_before`/`pause_after` (0–3 giây). Nghỉ và WAV thật được đưa vào lịch. Không tăng tốc tự động khi quá thời lượng. `voice` xuất riêng các câu để kiểm tra trước khi dựng, không yêu cầu ready; không có nghĩa tập đã sẵn sàng.

```
python3 lab/video-workflow/workflow.py voice channels/science/episodes/metal-wood
python3 lab/video-workflow/audition.py
```

Mẫu nghe ở cache/video-workflow/voice-auditions-v2/index.html. Giọng mới phải được nghe chọn, không coi tên preset là bằng chứng về độ hay. Mặc định pilot có thể dùng giọng tạm và phải ghi rõ. Giọng hiện tại không đảm bảo đọc đúng thuật ngữ, cảm xúc hoặc tên riêng.

Cache âm thanh tính cả chữ đọc, hồ sơ giọng và mã worker; đổi hình không đổi cache giọng. Thay channel.json làm mất readiness. Mẫu TTS có tính ngẫu nhiên; WAV cache đã chọn là bản giữ ổn định, không cam kết tái sinh bit-identical nếu xóa cache.

## Đầu ra và tiếp tục

Cache/video-workflow/<kênh>/<tập>/ chứa video, WAV ghép, SRT, ảnh và báo cáo. Audio câu nằm ở cache/video-workflow/audio/ dùng chung theo hash. Không đưa media/model lên Git. Một thư mục làm việc nhưng vẫn phụ thuộc sibling vetay và video-lab-cache.

Nếu lời đọc/nguồn/hình thay đổi: sửa gói, rough, xem lại, ready, produce. Nếu lỗi môi trường: sửa môi trường rồi tiếp tục, không sửa dấu ready bằng tay. Giữ các giới hạn dung lượng trong AGENTS.md.

Kiểm tra kỹ thuật, khung hình, xem toàn bộ và nghe toàn bộ là bốn trạng thái riêng. Chưa nghe thì không chốt chất lượng phát âm/giọng. Chưa có số liệu người xem thì không kết luận hiệu quả kênh.

## Phản hồi giọng và lưu quyết định

Ghi voice_status trong channel.json và nhận xét ở tài liệu voice của kênh. Phân biệt thích chất giọng với đã duyệt cách đọc cả tập. Không dùng lại preset bị người dùng loại như lựa chọn cuối. refine_voices.py tạo mẫu theo phản hồi (khoa học Phạm Tuyên, kể chuyện thử Đức Trí/Thái Sơn) ở cache/video-workflow/voice-refinement/. Cấu hình hiện tại không cung cấp nút điều khiển cảm xúc chính xác; style của v3turbo chỉ là metadata bị bỏ qua.
