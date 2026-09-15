# Kiểm chứng ve-tay-thuan — Bản đồ học thuật, map-v1

Kiểm tra ngày 2026-09-16, Linux, Node 20.15, Python 3.12, Chrome và FFmpeg local.

## Đã đạt

- 7 kiểm thử Python và 27 kiểm thử Node: timing, cue/endCue, vật thể tiếp nối, thay take dài hơn, mặc định thuần vẽ, giới hạn từ khóa, ngân sách thân bài, dịch SRT và checksum media.
- Browser regression cho nét vẽ và bố cục cũ: vẽ tiến dần, đường rời, chuyển cảnh, tua, phụ đề riêng, vùng an toàn và va chạm chữ. Các kiểm thử transport trước đó đã kiểm tra checksum, ngắt giả lập, lỗi encoder và hết dung lượng.
- Clone Git sạch, cài setup theo README, tải mô hình riêng vào sys/models. Doctor mở Adam offline, nhận font, Chrome và libx264. Không symlink phụ thuộc về repo cha.
- Bộ nhận diện map-v1 có nguồn, avatar nguyên bản, 3 intro mẫu, outro MP4/WAV/SRT, ảnh bìa, video ghép mẫu, trang xem trước và manifest checksum. Clone kiểm tra được media đóng gói; không tổng hợp lại Adam cho outro.
- Đã xem khung hình ba từ khóa ở cỡ điện thoại; sửa đường teal chạm chữ. Avatar không méo; tên kênh và biểu tượng nằm tách biệt. Intro giống nhau được dùng lại từ cache, byte của outro không đổi.
- Video nhận diện mẫu: 12,5 giây, 375 khung, 1080×1920, 30fps; giải mã và phát hết tự động trong trình duyệt đạt. Preview tập cây cầu 38,5 giây cũng phát hết tự động.
- Clone tạo mới hai take cho mỗi cụm của 56 cụm lời thân bài cây cầu; timeline hợp lệ 170,5333 giây. Thân bài có 20 nhịp, 37 đối tượng; cộng intro 1,5 và outro 5 giây thành **177,0333 giây**.
- Bản toàn tập xuất thành công: H.264/AAC, 1080×1920, 30fps, **5.311 khung**, 57 mục phụ đề. Giải mã toàn bộ đạt; không holds, violations hoặc errors trong báo cáo hình. Đã xem khung hai điểm ghép; không có khung đen, avatar hoặc chữ phủ lên thân bài.
- Âm lượng file cuối đo được −15,74 LUFS, true peak −2,31 dBTP.
- Chạy resume từ clone: **0 khung dựng mới, 5.116 khung thân bài dùng lại**. SHA-256 của final.mp4 trước và sau resume giống hệt nhau.
- Gói bàn giao chứa media nhận diện có phiên bản; không chứa mô hình, node_modules, cache hoặc audio/video từng tập. Mã và nguồn dùng đường dẫn theo repo.

## Giới hạn còn lại

- Đã kiểm tra phát hết tự động mẫu 12,5 giây và preview 38,5 giây. Không ghi nhận đã xem/nghe trực tiếp toàn bộ tập 177 giây. Lượt phát tự động toàn tập đã được khởi chạy nhưng chưa có kết quả hoàn tất lúc chốt báo cáo; người dùng yêu cầu không chạy thêm kiểm tra, chuyển sang commit/push.
- Chọn take tự động dựa trên khoảng lặng; chưa xác nhận phát âm và nhịp Adam bằng nghe trực tiếp. Các số đo âm lượng không thay thế kiểm tra bằng tai.
- Lần thử agent độc lập trước đó chỉ hoàn thành kịch bản 20 nhịp và narration, bị giới hạn sử dụng trước khi viết đường vẽ thực thi/tạo giọng. Không coi đó là một video sản xuất độc lập thành công. Chưa xác nhận mọi AI hoặc ứng dụng khác đạt cùng chất lượng.
- Chưa thử Windows/macOS, nhóm người xem hoặc retention. npm ci của cây phụ thuộc hiện có báo 6 advisory (4 moderate, 2 high); preview server chỉ bind localhost.

## Sử dụng lại

Đọc identity.md và drawing-first.md. Mỗi project chỉ cần chọn keyword 1–4 từ, viết nội dung và dùng voice → validate → preview → render/resume. Tổng video giữ 165–180 giây; bộ dựng tự trừ thời lượng nhận diện khi tạo dự án và tự dịch phụ đề khi ghép. Tập cũ có thân bài gần 180 giây phải rút phần lặp; công cụ không cắt hoặc tăng tốc lời tự động.
