# Đạo diễn thị giác: quy trình hai bước

Tài liệu này dành cho agent nhận một đề tài mới, không cần lịch sử hội thoại. Đọc README.md, CHANNEL-PREPARATION.md, CHANNELS.md và hướng dẫn của nhánh kênh trước. Dùng thêm templates/science-visual.md hoặc templates/storytelling-visual.md. Hai mẫu đã có chỉ minh họa kỹ thuật; không sao chép bố cục của chúng cho mọi đề tài.

Mục tiêu là một tập có ý đồ hình ảnh riêng, hành động hoặc cơ chế nhìn thấy được, đủ tài liệu để người khác tiếp quản. Hợp đồng và lệnh kiểm tra chỉ xác nhận cấu trúc, tài nguyên và dấu kiểm tra; không chứng nhận thẩm mỹ, diễn xuất hoặc tính đúng khoa học.

## Bước 1 — Chuẩn bị

### 1. Chốt trải nghiệm

Viết trong hồ sơ đạo diễn: người xem cần hiểu/cảm nhận gì; câu hỏi giữ họ theo dõi; một thay đổi phải nhìn thấy; khoảnh khắc thị giác quan trọng nhất; điều không nên giải thích bằng chữ. Giới hạn đề tài vào thời lượng đã chọn. Giữ tiếng Việt, dọc 1080×1920, 30 fps và thời lượng 30 giây nếu người dùng không chỉ định khác.

### 2. So sánh hai cách kể bằng hình

Đề xuất hai hướng thực sự khác cách trình bày, mỗi hướng một đoạn ngắn: chủ thể, điểm nhìn, hành động chính, chất liệu và khó khăn sản xuất. Ví dụ theo dõi một vật thể xuyên câu chuyện so với quan sát qua ánh mắt nhân vật; quan sát thí nghiệm rồi mở mặt cắt so với theo dõi một chu kỳ cơ chế. Đổi màu nền không phải hướng thứ hai.

Agent tự chọn theo mức phù hợp nội dung, độ rõ trên điện thoại, khả năng diễn bằng tài nguyên miễn phí và công sức làm cảnh. Ghi lý do và giới hạn; không hỏi người dùng duyệt từng lựa chọn thường lệ. Không mặc định lựa chọn ít chi tiết nhất là tốt nhất.

### 3. Thiết kế mỹ thuật theo tập

Trong design.md, quyết định bảng màu có vai trò rõ; hình dáng và tỷ lệ chủ thể; chất liệu biểu diễn bằng mảng, nét, gradient hoặc texture; hướng sáng chính và bóng; lớp tiền/trung/hậu cảnh; điểm nhấn tương phản và vùng phụ đề. Chỉ dùng chiều sâu, ánh sáng, hạt hoặc rung khi phục vụ nội dung.

Ưu tiên SVG và hình tự tạo bằng mã: hình khối lớn dựng silhouette trước, sau đó thêm lớp chất liệu, nét đặc trưng và bóng. Tách chi tiết chuyển động; nhóm những phần đứng yên. Dùng mặt cắt hoặc phối cảnh 2D/2.5D khi cần; không gọi phối cảnh minh họa là mô phỏng vật lý. Có thể dùng ảnh người dùng cấp hoặc tư liệu rõ quyền sử dụng; lưu xuất xứ, giấy phép và điều kiện ghi công. Không phụ thuộc tài nguyên tình cờ trong cache, ảnh tìm kiếm chưa rõ quyền hoặc dịch vụ trả phí. Nếu dùng hình raster, lưu tài nguyên cần tái tạo trong vị trí được quản lý, không nhúng ảnh tham chiếu như thể đã có quyền tái phân phối.

### 4. Thiết kế cảnh quay trước khi viết chuyển động

Mỗi cảnh quay phải có: cảnh nội dung liên quan; điều mới người xem biết; chủ thể chính; cỡ cảnh và điểm nhìn; hành động với trạng thái trước/sau; đường dẫn mắt; lớp che; vùng chữ; kiểu chuyển sang cảnh tiếp theo. Thời điểm ghi tương đối trong cảnh để sau này theo thời lượng giọng thật. Một cảnh nội dung có thể chứa nhiều cảnh quay.

Không cố định số cảnh, không bắt mọi tập có zoom. Một cảnh tĩnh có hành động đủ rõ tốt hơn nhiều chuyển cảnh không thêm thông tin. Cận cảnh cần làm lộ chi tiết, toàn cảnh cần giúp hiểu không gian. Không để phụ đề trùng vị trí điểm tiếp xúc, khuôn mặt hoặc cơ chế trọng tâm.

### 5. Tạo tài nguyên đủ để diễn

Danh mục tài nguyên ghi mã, tệp, nguồn/giấy phép, nơi sử dụng và cấu trúc cần thiết. Với phần chuyển động ghi điểm xoay, điểm bám, giới hạn chuyển động và lớp trước/sau. Với nhân vật: silhouette, tỷ lệ, trang phục, hướng nhìn, biểu cảm cần dùng. Với cơ chế: các bộ phận và điều kiện chuyển trạng thái. Mã hình tự tạo cũng là tài nguyên cần khai báo.

Chuẩn bị phiên bản góc nhìn thực sự cần trong tập; không hứa bộ nhân vật hoàn chỉnh nếu chỉ vẽ được một góc. Thành phần dùng lại hỗ trợ thao tác kỹ thuật (khớp, lớp, điểm tiếp xúc, mặt cắt); không áp đặt cùng căn phòng hoặc nhân vật cho mọi tập.

### 6. Kiểm tra sớm, rồi làm bản thô toàn tập

Xuất tối thiểu mở đầu, khoảnh khắc quan trọng và kết thúc; thêm khung cho mỗi bố cục mới. Xem ở kích thước điện thoại. Thử chuyển động khó nhất bằng thời gian tạm trước khi thêm chi tiết trang trí. Sau đó xuất toàn bộ bản thô, kiểm tra trạng thái trước–trong–sau hành động và sửa lỗi.

Bài học đã gặp: tay không chạm gương; phản chiếu không có thời gian độc lập; cần piston quá ngắn khiến tay cầm vào thân; chữ va tay cầm; dòng khí bị thành bơm che hoặc xuyên van đóng. Với loa, hạt khí dao động quanh cân bằng, không bay một chiều về tai. Những lỗi này là kiểm tra hình học/cơ chế, không phải việc thêm hiệu ứng sẽ giải quyết được.

### 7. Bàn giao và chốt sẵn sàng

Gói bàn giao gồm kịch bản, phân cảnh, hồ sơ đạo diễn, tài nguyên có quyền sử dụng, mã chạy được, mốc kiểm tra, đường dẫn bản thô/ảnh và nhận xét thực tế. Ghi hướng đã chọn, quyết định đã khóa, giới hạn mô hình hoặc diễn xuất, phần còn thiếu và lệnh tiếp tục chính xác từ gốc repo. Không để nội dung cốt lõi thành “agent sau tự quyết”.

Chạy validate, rough và visual-review theo README; xem ảnh được xuất rồi mới ghi kết quả kiểm tra. Chỉ ready khi không còn lỗi bắt buộc và bản thô khớp đầu vào hiện tại. Nếu chỉ được giao chuẩn bị, dừng tại đây. Nếu được giao làm video hoàn chỉnh, tiếp tục mà không xin phép lại.

## Bước 2 — Sản xuất

Agent nhận đọc toàn bộ gói, kiểm tra môi trường và readiness. Không thay phong cách hoặc nội dung cốt lõi để tiện dựng. Nếu cần đổi hành động, tài nguyên, nguồn hoặc phân cảnh, quay lại bước chuẩn bị và tạo lại bằng chứng kiểm tra.

Giữ Phạm Tuyên cho khoa học và Đức Trí cho kể chuyện; không mở lại vòng chọn giọng. Tạo WAV, lấy thời lượng thật làm mốc, giữ khoảng thở cho hành động. Không dùng thay đổi cao độ hoặc tăng tốc toàn bài để giả cảm xúc. Chuyển động phải nhận lịch thời gian thực tế; không giữ số giây tạm cứng trong mã.

Hoàn thiện hành động/cơ chế trước, sau đó ánh sáng, chất liệu, chuyển động phụ và âm thanh theo sự kiện. Xuất thử 540×960, kiểm tra mốc và phụ đề, sửa rồi mới xuất 1080×1920. Phụ đề tối đa hai dòng và không che chi tiết chính. Không thêm tiếng động trang trí không gắn sự kiện.

## Kiểm tra và giới hạn

Báo riêng bốn mức: kiểm tra tệp tự động; xem khung tại mốc; xem toàn bộ ở tốc độ thường; nghe toàn bộ. Chỉ đánh dấu việc thực sự làm. Nếu công cụ không hỗ trợ nghe/xem thời gian thực, ghi chưa kiểm chứng; giải mã thành công không thay thế chúng.

Với truyện, thử xem không lời: hành động, quan hệ không gian và thay đổi chính phải đọc được. Với khoa học, bỏ phụ đề vẫn thấy chuỗi cơ chế chính; hình phải phân biệt dữ liệu thật, mô hình và minh họa. Nhận xét phải nêu quan sát và cách sửa cụ thể, không chỉ “đẹp” hoặc “pass”.

Mọi thay đổi gói làm bằng chứng cũ hết hiệu lực; không sửa dấu sẵn sàng bằng tay. Giữ bản xuất tốt trước khi lượt mới được xác nhận. Một lượt dựng nặng tại một thời điểm; cache dưới 30 GB, dự trữ 20 GB, không xóa dữ liệu người dùng. Không tải model lớn, không dùng dịch vụ trả phí, không đăng mạng xã hội.

## Mẫu giao việc

“Chuẩn bị tập [kênh] về [đề tài], [thời lượng]. Theo VISUAL-DIRECTION.md, tạo gói có hai phương án thị giác, phương án đã chọn, tài nguyên, mã cảnh và bản thô đã kiểm tra. Dừng sau ready.”

“Nhận gói [đường dẫn]. Đọc hồ sơ đạo diễn và kiểm tra còn lại, sản xuất bằng giọng đã chốt; xuất thử trước, sửa rồi bàn giao MP4, SRT, ảnh bìa và báo cáo. Không tự đổi nội dung hoặc đánh dấu đã xem/nghe khi chưa làm.”
