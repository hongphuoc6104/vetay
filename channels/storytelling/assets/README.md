# Tài sản tái sử dụng
characters.json là bible cho Mai và An; không chứa media tải ngoài. Hai hàm character(kind) và room() trong ../episodes/unread-message/visuals.tsx là các primitive tham khảo tái dùng: nhân vật với tay/đầu có điểm điều khiển, cửa phải, cửa sổ trái, sàn và mưa ngoài cửa sổ.

Bộ dựng chỉ chép thư mục tập: khi tái dùng, sao chép phiên bản visuals.tsx vào tập mới và khai báo assets. Không import ngược từ thư mục tập ra kênh. Mỗi tập sở hữu bản đóng băng của hình để thay đổi kênh không âm thầm đổi tập cũ. Tất cả hình ở pilot do mã gốc tạo; không cần ảnh, font hay âm thanh ngoài.

settings.tsx bổ sung ba nghiên cứu bố cục room/street/workplace v1 với cùng hệ màu. Đây là mã nguồn chuẩn bị; street/workplace chưa render kiểm chứng. Khi dùng: chép vào gói tập, ghi asset original, gọi đúng bối cảnh rồi kiểm khung điện thoại và vùng phụ đề. Pilot chỉ kiểm chứng room trong visuals.tsx; không coi cả thư viện đã kiểm thử. Không thay thế tự động cảnh của tập đã hoàn thành.
