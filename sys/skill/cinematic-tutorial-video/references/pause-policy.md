# Nhịp đọc và khoảng nghỉ

## Quy tắc dùng chung

Đo âm thanh đã chọn và xử lý ở tốc độ cuối cùng trước khi xếp timeline. Tính mốc bắt đầu từ thời điểm kết thúc câu trước cộng khoảng nghỉ; không giữ các mốc câu cố định từ bản dựng cũ. Đo cả khoảng lặng còn trong tệp âm thanh, không chỉ khoảng đệm được thêm khi ghép.

| Ranh giới | Mặc định | Giới hạn |
|---|---:|---:|
| Cụm nghĩa | 0,20s | 0,15–0,30s |
| Câu | 0,35s | 0,30–0,50s |
| Chuyển ý/cảnh | 0,50s | 0,40–0,70s |

Không cắt máy móc mọi khoảng lặng: bảo toàn âm đầu, âm cuối và nhịp lấy hơi. Khi tổng khoảng lặng qua ranh giới, gồm đuôi tệp trước và đầu tệp sau, vượt giới hạn, phải báo lỗi và sửa take hoặc khoảng đệm. Không được âm thầm kéo nhanh/chậm giọng để khớp cảnh.

Khoảng dừng thực hành dài hơn phải khai báo `kind: practice`, có `reason` giải thích nhiệm vụ, và `onScreenPrompt` chỉ dẫn hiển thị suốt khoảng dừng. Mặc định 1,5s, cho phép 0,8–3s. Chỉ dùng khi người xem thực sự cần thao tác/quan sát. Không dùng cảnh chuyển động, logo hoặc nhạc nền làm lý do lấp thời lượng.

## Đầu vào cho timing.py

JSON gồm `targetSeconds`, `fps`, `leadInSeconds` (mặc định 0,15s), `tailSeconds` (mặc định 0,30s) và `phrases` không rỗng. Mỗi phrase có `id`, `sceneId`, `text`, `audio` là đường dẫn tương đối với JSON. WAV phải ở tốc độ phát cuối cùng. Mỗi phrase, trừ phrase cuối, có `after` gồm `kind` và tùy chọn `seconds`. Mặc định ranh giới là `sentence`. Đo khoảng lặng bằng cửa sổ RMS 10ms với ngưỡng −45dBFS; phần dưới ngưỡng chỉ là ứng viên khoảng lặng, lỗi phải được kiểm tra trước khi cắt.

Đầu ra gồm mốc đầu/cuối của tệp, đầu/cuối hoạt động âm thanh, khoảng nghỉ thực tế, tổng thời gian cần thiết và các lỗi. Khi thời lượng không phù hợp, vẫn ghi báo cáo nhưng trả mã lỗi; không phát hành video.

Đồng bộ phụ đề và nhấn hình theo `speechStart`/`speechEnd` hoặc mốc từ được đo riêng. Không giả định từng từ có thời gian bằng nhau. Renderer dùng timeline này thay cho mốc viết tay; preview và render đều phải qua bước kiểm tra timing.

## Video bắt buộc 30 giây

Giữ tốc độ Adam 1,0× phần hướng dẫn, 1,05× mở và kết. Nếu lời đọc và khoảng nghỉ hợp lệ chưa đủ 30 giây, bổ sung chỉ dẫn có ích trong nội dung cảnh đã duyệt rồi tạo lại giọng. Có thể nêu kết quả cụ thể: “chuẩn bị đủ tài liệu”, “viết ba câu hỏi”, “chọn một khung giờ”. Tạo khoảng thực hành có chỉ dẫn khi cần. Không thêm thời gian chết hoặc chậm giọng để đủ số giây.

Mục tiêu tổng là 30 giây, sai số trước xuất tối đa 1 frame. Renderer xuất chính xác 900 frame ở 30fps. Mốc đổi cảnh được tính lại theo lời đọc; giữ thiết kế và kiểu chuyển cảnh đã duyệt. Thay đổi ý chính cần duyệt lại; làm rõ cùng một ý không cần hỏi lại.

## Kế hoạch áp dụng cho demo local

1. Viết lại lời liên tục, bổ sung ví dụ hoàn thành trong năm cảnh hiện tại; giữ Adam và mỹ thuật đã duyệt.
2. Tạo hai take cho phần sửa, chọn giọng rồi đo cả khoảng lặng trong take.
3. Xếp timeline bằng quy tắc trên, chỉnh nội dung cho đủ 30 giây, đồng bộ lại điểm nhấn và phụ đề.
4. Kiểm tra toàn video và khoảng nghỉ, xuất bản mới riêng để đối chiếu. Giữ mọi bản thử và renderer demo ngoài Git.

Bản kế hoạch này không đồng nghĩa demo đã được dựng lại.
