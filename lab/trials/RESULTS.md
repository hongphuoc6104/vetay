# Kết quả thử tạo video theo series

## Lựa chọn sau thử nghiệm

**Quy trình chính: Vector + Remotion + giọng Adam local. Hướng phụ: Quick Draw.** Motion Canvas xuất được tự động và đáng tối ưu tiếp; Animated Drawings phù hợp thử linh vật ngắn.

Điểm nội bộ: Vector86, QuickDraw85, Sketch81, Kenney79. Đây là nhận xét biên tập của agent, không phải nghiên cứu người xem hoặc bằng chứng kiếm tiền. Tiêu chí sửa tay dưới30phút/tập chưa được xác nhận vì chưa có phiên thao tác của người dùng được đo.

## Video đã xuất

| Tập | Thời lượng | Dựng đầy đủ | Kích thước | QA tự động |
|---|---:|---:|---:|---|
| benchmark · Một ký ức đổi lấy điểm mười | 15.0s | 58.1s | 0.86MB | pending |
| external-import · Thử nhập ảnh nền ngoài | 0.0s | chưa có | 0.00MB | pending |
| kenney-01 · Ngày thế giới khởi động lại | 44.8s | chưa có | 0.00MB | pending |
| quickdraw-01 · Ba hình, ba thử thách | 25.0s | chưa có | 0.00MB | pending |
| quickdraw-02 · Trong nhà có gì? | 27.0s | chưa có | 0.00MB | pending |
| quickdraw-03 · Một chuyến ra ngoài | 27.0s | chưa có | 0.00MB | pending |
| quickdraw-04 · Bữa ăn bằng nét vẽ | 27.0s | chưa có | 0.00MB | pending |
| sketch-01 · Bức vẽ trước bình minh | 45.9s | chưa có | 0.00MB | pending |
| vector-01 · Điểm mười bị đánh đổi | 45.7s | 207.5s | 2.69MB | pass_automated_checks |
| vector-02 · Chiếc đồng hồ mượn ngày mai | 56.7s | chưa có | 0.00MB | pending |
| vector-03 · Cánh cửa chỉ mở một chiều | 56.8s | chưa có | 0.00MB | pending |
| vector-04 · Điều ước cần hai chữ ký | 56.8s | chưa có | 0.00MB | pending |
| vector-long · Ngày cả khu phố đem lời hứa đi bán | 264.3s | chưa có | 0.00MB | pending |

MP4 đầy đủ1080×1920/30fps; video/data lớn ở cache local, không đưa lên GitHub. Mở `video-lab-cache/trials/index.html` để xem theo nhóm. Đường dẫn trên trang là tương đối, chỉ dùng trên máy này.

## Nội dung và giới hạn theo nhánh

- **Vector:** một tập khám phá, ba tập mới, một truyện dài độc lập. Ba nhân vật và bối cảnh tái sử dụng; chuyển động đơn giản, chưa có diễn xuất hoặc khẩu hình.
- **Sketch:** một truyện bí ẩn, thêm hiệu ứng hé lộ nét và đạo cụ khăn/xe. Hình Open Doodles chưa bảo đảm cùng nhân vật ở mọi tư thế; cần vẽ thêm hình manh mối trước khi phát triển dài.
- **Kenney:** một truyện NPC có giọng đọc, dùng pose có sẵn. Cần tương tác và bối cảnh game nhất quán hơn để thành series riêng.
- **Quick Draw:** một tập đầu và ba tập tiếp theo. Sàng lọc100hình, xem bảng mẫu, chấp nhận78 và loại22hình mơ hồ. Không coi toàn bộ6900hình đều phù hợp.
- **Remotion:** bộ dựng dữ liệu, cache giọng và clip từng cảnh, phụ đề, gallery và QA. Hai khung xử lý song song trong các tập sản xuất; benchmark giữ một.
- **Motion Canvas:** đoạn15giây cùng dữ liệu/âm thanh và đoạn10giây vẽ nét, xuất tự động qua Renderer API. Xem ENGINE-COMPARISON.md; khác nhỏ về chữ/viền/vị trí.
- **Animated Drawings:**8giây nhân vật mẫu,20giây hài chữ không tiếng. Đã sửa framebuffer và vị trí camera; chỉ thử char1/chuyển động có sẵn, chưa dựng khớp hình mới. Bản1080 được phóng từ540.
- **Generative AI:** thử nhập PNG có nguồn từ Kenney vào cảnh. Có prompt/cấu hình; không sinh ảnh bằng Qwen/Wan, không tải trọng số hay gọi dịch vụ trả phí.

## Kiểm tra và phần còn cần duyệt

- Kiểm tra tự động giải mã toàn bộ MP4, thông số, timeline, phụ đề và tín hiệu âm thanh; xem contact sheet đại diện. Các kết quả nằm trong qa-final.json từng tập.
- Chưa nghe và xem toàn bộ từng video ở tốc độ thường; không tuyên bố đã duyệt phát âm/diễn cảm hoặc đồng bộ từng từ. Cần người dùng duyệt trước khi đăng.
- Phụ đề phân thời gian ước lượng theo câu, chưa forced alignment. Đầu ra là prototype sản xuất, không phải video đã được xác nhận sức hút thị trường.
- Cache tổng 4.38GB theo kích thước logic, trong giới hạn30GB. Không phát sinh phí dịch vụ, không đăng mạng xã hội.

## Tái tạo và tối ưu tiếp

Cài môi trường bằng bootstrap.py (cần branch lab/remotion để lấy lock); dùng run.py prepare/render ID, qa.py ID --kind final, gallery.py. Đọc FORMAT.md và README.md. Giọng local tái sử dụng môi trường có sẵn của dự án; máy khác có thể nhập WAV.

Ưu tiên: duyệt giọng/nhịp, bổ sung tư thế nhân vật và hành động đúng cảnh; thử chuyển template sang Motion Canvas để đo tốc độ; chỉ thêm AI khi thư viện không đáp ứng một hình cụ thể. Giữ kịch bản và lựa chọn nhân quả khác nhau giữa các tập, không thay tên để nhân bản hàng loạt.
