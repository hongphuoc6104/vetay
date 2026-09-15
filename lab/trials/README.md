# Thử sản xuất series

Đầu vào: episodes/*.json, registry.json. Đầu ra tại VIDEO_LAB_CACHE/trials.
Không gọi API; TTS offline tái sử dụng môi trường VieNeu của checkout gốc.

`python3 lab/trials/run.py prepare ID` tạo âm thanh, timeline, phụ đề và kiểm tra tài nguyên.
`python3 lab/trials/run.py render ID --scale 0.5` dựng xem trước; bỏ --scale để xuất 1080×1920.
`python3 lab/trials/run.py render ID` tái sử dụng video khi toàn bộ input/code hash không đổi.
`python3 lab/trials/run.py import-image ID /path/image.png --source URL --license TEXT` nhập hình ngoài có nguồn; không sinh ảnh.

Thiết lập lần đầu: `python3 lab/trials/bootstrap.py` lấy lockfile từ nhánh lab/remotion và cài runtime cô lập. Cần có nhánh lab/remotion local; checkout mới dùng `git fetch origin lab/remotion:lab/remotion` trước. Giấy phép Remotion riêng: thử cá nhân theo điều kiện snapshot đã lưu, tổ chức cần kiểm tra lại.
Không chia sẻ môi trường Python/Node qua Git. Giọng WAV ngoài: đặt `audio` trong từng scene (đường dẫn tuyệt đối), bỏ phụ thuộc TTS.
Caption chia theo từ và phân bố theo độ dài câu; chưa phải forced alignment theo âm vị. Phải nghe kiểm tra.

Xem RESULTS.md (kết quả), FORMAT.md (đầu vào/giới hạn), ENGINE-COMPARISON.md và ANIMATED-RESULT.md. `final_batch.py` chạy hàng đợi lần lượt; `report.py` cập nhật báo cáo, `gallery.py` cập nhật trang xem.
