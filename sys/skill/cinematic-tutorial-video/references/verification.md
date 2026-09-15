# Kiểm chứng ve-tay-thuan — 2026-09-16

## Đã kiểm tra

- 7 kiểm thử Python và 24 kiểm thử Node: timing, cue/endCue, giữ vật thể, thay take dài hơn, mặc định thuần vẽ và tương thích cũ.
- Browser drawing: nét phát triển, nhấc bút giữa đường rời, chuyển cảnh, tua xác định, SRT riêng, vùng an toàn và va chạm chữ.
- Browser hồi quy: các mẫu cũ, intro/outro của upstream vẫn hoạt động trong mã tương thích.
- Transport: PNG nhị phân, giới hạn khung đang xử lý, checksum cache, ngắt trình duyệt, lỗi encoder và hết dung lượng giả lập; không công bố đoạn hỏng.
- Clone Git local sạch, cài bằng setup theo README: tải mô hình mới vào sys/models; doctor mở Adam offline, nhận font, Chrome và libx264. Không symlink phụ thuộc vào repo cha.
- Tạo mới 118 take cho 59 cụm lời của ví dụ cây cầu trong clone. Chọn và đo đạt 179,0667 giây; timeline hợp lệ. Không dùng audio cũ cho lần tạo giọng này.
- Ví dụ hình trong clone: 20 nhịp, 37 đối tượng, validate đạt sau khi gắn audio mới.
- Kiểm tra riêng đoạn 38 giây bằng audio local có sẵn: xuất đủ 1.140 khung, không có holds/violations/errors. Đã xem các khung mở, đối chiếu nguồn và kết, kiểm tra giải mã file.
- Gói nguồn đã kiểm tra không chứa audio, video, mô hình, node_modules, cache hay đường dẫn máy cá nhân.

## Chưa hoàn tất và giới hạn

- Bản toàn tập 179,0667 giây từ clone đã bắt đầu dựng nhưng môi trường bị gián đoạn; sau đó thư mục clone, audio, video và log tạm không còn. Mã đã commit vẫn còn. Không có file cuối để xác nhận full render/resume từ clone đạt. Cần chạy lại chuỗi lệnh ví dụ và kiểm tra file cuối trên máy thử.
- Kiểm tra phát hết trong trình duyệt của đoạn mẫu chưa đạt: trình duyệt bị đóng trong một lần thử; lần khác không hoàn tất. Giải mã thành công không thay thế xem/nghe hết. Chưa xác nhận phát âm và nhịp Adam bằng nghe trực tiếp.
- Agent phiên mới chỉ được clone và đề tài “Sắp xếp góc học tập trước khi bắt đầu”. Agent đọc skill, viết 20 nhịp hình bằng văn bản, narration và sources; bị giới hạn sử dụng trước khi tạo giọng và vẽ đường nét. Manifest mới có scaffold, chưa có drawingLibrary thực thi. Không ghi nhận đây là một lần sản xuất độc lập thành công. Root không hoàn thiện thay rồi tính là agent đạt.
- Chưa thử trên AI/ứng dụng khác, Windows/macOS, nhóm người xem hoặc dữ liệu retention. Đây là nhánh có thể dùng để thử nghiệm; chưa tuyên bố mọi AI đạt cùng chất lượng.
- npm ci báo 6 advisory của cây phụ thuộc hiện có (4 moderate, 2 high); chưa nâng cấp engine trong phạm vi này. Preview server chỉ bind localhost.

## Tái kiểm chứng

Chạy setup/doctor, chuỗi ví dụ cây cầu trong drawing-first.md, tự xem đoạn preview rồi render/resume; kiểm tra final.mp4, final.srt, cover.png và visual-report.json. Ghi lại thời lượng, số chunk reused, giải mã đầy đủ, xem/nghe và mọi chỉnh sửa. Sau đó giao một agent mới chỉ clone và đề tài khác; lưu kết quả thực tế trước khi đánh giá khả năng dùng lại.
