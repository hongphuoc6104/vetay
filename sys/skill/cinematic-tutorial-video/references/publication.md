# Intro, ảnh bìa và outro

Mỗi dự án mới dùng metadata `publication` để giữ phần nhận diện gắn với nội dung. Đây là lớp xuất bản của bộ dựng, không phải một slide thương hiệu đứng riêng.

```json
{
  "publication": {
    "title": "Context window là gì?",
    "primaryKeyword": "context window",
    "seriesLabel": "CHAT AI CĂN BẢN",
    "episode": 1,
    "coverFrame": 15,
    "intro": {"enabled": true, "holdSec": 1.5},
    "outro": {
      "enabled": true,
      "avatarTheme": "scene",
      "durationSec": 4,
      "renderTakeaways": true,
      "takeaways": ["Tách mục tiêu", "Đưa đúng ngữ cảnh", "Kiểm tra kết quả"]
    }
  }
}
```

`coverFrame` là số frame từ đầu video, tính ở 30fps; mặc định là frame 15 (0,5 giây). Renderer xuất `<name>-cover.png` từ đúng frame này và ghi lại lựa chọn trong `<name>-publishing.json` và `<name>-publishing.md`. Khi preview một đoạn, mốc được kẹp vào phạm vi preview để ảnh vẫn tồn tại. TikTok vẫn cần người đăng chọn ảnh này ở bước đăng video.

Intro bắt buộc hiện `primaryKeyword` và tiêu đề đầy đủ ngay frame 0. Nhãn `seriesLabel` giúp nhận ra loạt nội dung. Giữ nhóm chữ ổn định trong ít nhất 1,5 giây; hiệu ứng nét chỉ dẫn vào đối tượng giải thích. Không dùng intro để thêm thời gian im lặng.

Outro nằm trong cảnh cuối, thường 3–5 giây. Nội dung tổng kết do cảnh cuối cung cấp; `takeaways` là phương án dự phòng cho dự án chưa có recap. Avatar dùng `avatarTheme: "scene"` để tự chọn logo sáng/tối theo theme đã giải quyết, hoặc chọn rõ `light`/`dark`. Đặt avatar trong vùng riêng ở đáy nội dung, phía trên phụ đề; không phủ lên chữ, danh sách hay nét vẽ.

Mọi project có metadata phải bật cả `intro.enabled` và `outro.enabled`. Project cũ không có metadata vẫn được render; renderer ghi cảnh báo để agent bổ sung khi tạo phiên bản mới. Không đưa lời kêu gọi theo dõi, tên tài khoản hoặc khẩu hiệu mới vào outro nếu người dùng chưa yêu cầu.

Quy trình agent:

1. Chọn một từ khóa ngắn, đúng chủ đề và không viết hoa toàn bộ nếu không cần.
2. Điền `title`, `primaryKeyword`, `seriesLabel` và `coverFrame` trước khi viết cảnh.
3. Bảo đảm scene đầu có title tối đa hai dòng; kiểm tra frame 0 ở kích thước điện thoại.
4. Viết một đến ba ý chốt ở scene cuối hoặc `outro.takeaways`, rồi chọn avatar theo theme.
5. Render, mở frame 0, cover, điểm chuyển vào bài và frame cuối; đọc file ghi chú đăng video.

Từ khóa trên hình giúp người xem nhận ra chủ đề; không được hứa rằng nó tự cải thiện thứ hạng tìm kiếm.
