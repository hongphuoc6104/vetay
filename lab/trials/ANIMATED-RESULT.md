# Animated Drawings — thử nhân vật mẫu

Môi trường cô lập Python 3.10.12; wheel nhị phân, không chạy setup.py và không tải model dò hình/khớp. Phiên bản đầy đủ ở `animated_requirements.lock.txt`. Mã Meta MIT khóa commit b859684857519c7424da51a0b0862fbd1fd258f4.

Tái tạo từ thư mục worktree:

```sh
UV_CACHE_DIR=../video-lab-cache/uv-cache uv venv --python /usr/bin/python3 ../video-lab-cache/runtimes/animated-drawings
UV_CACHE_DIR=../video-lab-cache/uv-cache uv pip install --python ../video-lab-cache/runtimes/animated-drawings/bin/python --only-binary :all: -r lab/trials/animated_requirements.lock.txt
OPENBLAS_NUM_THREADS=2 OMP_NUM_THREADS=2 MKL_NUM_THREADS=2 ../video-lab-cache/runtimes/animated-drawings/bin/python lab/trials/animated_probe.py ../video-lab-cache/sources/animateddrawings/AnimatedDrawings-b859684857519c7424da51a0b0862fbd1fd258f4 ../video-lab-cache/trials/animated-drawings
python3 lab/trials/animated_comedy.py ../video-lab-cache/trials/animated-drawings
```

Giới hạn: dùng nguyên char1 với khớp sẵn và zombie BVH. Chưa kiểm tra hình mới, tự chia khớp, phát hiện người hoặc khả năng diễn đúng hành động trong truyện. Đoạn hài lặp chuyển động, có chữ Việt, không có giọng đọc. Không nên xem đây là hệ thống diễn xuất nhân vật hoàn chỉnh.

Khắc phục cần thiết: cửa sổ ẩn NVIDIA không bảo đảm bộ đệm mặc định hợp lệ. Probe tạo framebuffer màu/chiều sâu riêng để render và đọc ảnh, không sửa mã upstream. Video lần thử đầu không hợp lệ đã được thay thế, không được dùng làm kết quả.

Bố cục dọc: camera đặt giữa, bỏ dịch chuyển ngang của gốc BVH để nhân vật không đi ra ngoài khung. Các góc khớp vẫn lấy từ zombie BVH. Đây là chuyển động tại chỗ, không phải chuyển động đi bộ qua cảnh.

## Kết quả đã kiểm chứng

- `cache/trials/animated-drawings/character.mp4`: 8 giây, 540×960, 30fps/240 khung; dựng toàn tiến trình **33,59 giây**, đỉnh RAM **624.084 KiB**. OpenGL 3.3 trên Quadro P620.
- `cache/trials/animated-drawings/comedy.mp4`: 20 giây, 1080×1920, 30fps/600 khung H.264, **2.030.445 byte**; ghép chữ/xuất **17,49 giây**, đỉnh RAM **411.356 KiB**. Đây là hình gốc 540×960 phóng lên, không phải render native 1080.
- Cài wheel khoảng 6 giây; môi trường và cache dùng chung khoảng **561 MB unique bytes** (hardlink). Tổng thử, tìm lỗi framebuffer và bố cục khoảng 10 phút; không đo thao tác sửa tay của người dùng.
- Đã xem contact sheet 8 mốc nhân vật và 4 mốc phụ đề; chữ Việt đủ dấu, nhân vật đầy đủ trong khung. Kiểm tra toàn bộ 240 khung hình đều có hình và không bị cắt biên. Chưa có kiểm duyệt xem/nghe toàn video ở tốc độ thật; clip này không có âm thanh.
- Nhật ký, thời gian tiến trình, metrics JSON và frame-check JSON lưu cùng video. Các video sai từ lần đầu đã được ghi đè bằng kết quả cuối; không giữ bản desktop capture.

Có thể khai thác: linh vật phản ứng, tình huống hài chữ và chuyển động ngắn. Chưa chứng minh được đổi nhân vật tự động hoặc diễn theo câu chuyện. Độ đồng bộ ngữ nghĩa thấp vì lặp zombie motion. Tối ưu tiếp theo nên thử nhân vật do mình vẽ và một bộ 3–5 động tác phù hợp trước khi phát triển series.
