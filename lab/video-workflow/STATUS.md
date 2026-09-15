# Trạng thái quy trình

Nền dùng chung cho main và hai nhánh kênh. Đường dẫn tập theo kênh, giọng cấu hình riêng, spoken_text, khoảng nghỉ, cache theo giọng và worker, đầu ra tách kênh. 35 kiểm thử đã qua trong đợt nâng cấp 2026-09-16. Mẫu hồi quy speaker đã xuất rough lại; shadow-key vẫn validate.

Giọng theo yêu cầu: cả hai nam; khoa học tự nhiên, cuốn hút, không thời sự; storytelling trầm dày, rõ chữ, nhấn nhá theo cảm xúc. Người dùng đã duyệt cả hai video pilot và chốt giọng: khoa học Phạm Tuyên, kể chuyện Đức Trí. Giữ speed 1.0, temperature 0.7, version 3 làm mặc định. Không tuyên bố TTS local điều khiển cảm xúc chính xác.

Tình trạng từng pilot ở channels/<kênh>/episodes/<tập>/handoff.md trên đúng nhánh. Main không lưu nội dung riêng hai kênh. Mẫu nghe local tạo bằng audition.py; không commit WAV.
