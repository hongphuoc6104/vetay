# Bàn giao Video Lab

Ngày kiểm tra: 16/09/2026. Máy: Xeon E3-1240 v3, RAM 16 GB, Quadro P620 2 GB.

Kho dữ liệu dùng chung đang chiếm khoảng **2.70 GB dữ liệu** trên ngân sách **30 GB**.
Có **486 tệp nguồn khóa bằng SHA-256**, gồm archive mã/kho hình và các tập mẫu; dung lượng tính cả giải nén, môi trường, cache npm và đầu ra local.

Nhánh gốc `ve-tay-thuan` giữ nguyên commit `4d8f08a`. Có một worktree thử nghiệm riêng.

| Thứ tự thử | Nhánh GitHub | Nguồn tải + giải nén | Kết quả thực tế |
|---|---|---:|---|
| 1 | [lab/vector-story](https://github.com/hongphuoc6104/vetay/tree/lab/vector-story) | 135.1 MB | 93 SVG Open Peeps công khai + snapshot Tabler/IconPark; nhập hình và xem bảng mẫu thành công. |
| 2 | [lab/sketch-story](https://github.com/hongphuoc6104/vetay/tree/lab/sketch-story) | 161.1 MB | 33 SVG Open Doodles + Excalidraw Libraries; Rough.js 4.6.6 đã tạo SVG. |
| 3 | [lab/kenney-story](https://github.com/hongphuoc6104/vetay/tree/lab/kenney-story) | 20.0 MB | 5 gói 2D CC0; đã giải nén và xem hình mẫu. |
| 4 | [lab/quickdraw](https://github.com/hongphuoc6104/vetay/tree/lab/quickdraw) | 3.4 MB | 345 nhóm × 20 bản vẽ = 6.900; kiểm tra dữ liệu và tạo hoạt ảnh nét. |
| 5 | [lab/motion-canvas](https://github.com/hongphuoc6104/vetay/tree/lab/motion-canvas) | 5.8 MB | Đã build và xuất MP4 1920×1080, 133 frame, khoảng 2,22 giây. |
| 6 | [lab/remotion](https://github.com/hongphuoc6104/vetay/tree/lab/remotion) | 1310.2 MB | Đã dựng MP4 640×360, 60 frame, 2 giây. |
| 7 | [lab/animated-drawings](https://github.com/hongphuoc6104/vetay/tree/lab/animated-drawings) | 147.8 MB | Đã kiểm tra nhân vật 16 khớp và 6 tệp chuyển động; chưa cài renderer/model. |
| 8 | [lab/generative-ai](https://github.com/hongphuoc6104/vetay/tree/lab/generative-ai) | 37.9 MB | Đã tải mã Qwen-Image/Wan2.2; chưa tải trọng số hoặc chạy inference. |

Dung lượng trong từng hàng chỉ tính nguồn tải/giải nén của nhánh, chưa cộng môi trường Node và cache dùng chung. Mẫu video là kiểm tra kỹ thuật, chưa có truyện/giọng kể hoàn chỉnh.

## Thử lần lượt

Worktree: `/home/hongphuoc6104/Desktop/test/video-lab-work`.
Dữ liệu: `/home/hongphuoc6104/Desktop/test/video-lab-cache`.

```sh
git -C /home/hongphuoc6104/Desktop/test/video-lab-work switch lab/vector-story
cd /home/hongphuoc6104/Desktop/test/video-lab-work
python3 lab/assets.py verify
python3 lab/smoke.py
```

Đọc `lab/README.md` và `lab/STATUS.md` của nhánh đã chọn. Với Motion Canvas,
Remotion hoặc Rough.js, dùng `python3 lab/node_env.py install` rồi `test`.

Tại `lab/base`, `python3 lab/assets.py fetch` tái tạo toàn bộ nguồn đã khóa;
hoặc chỉ lấy một hướng bằng `--manifest lab/catalog/vector-story.json`.
Không tải toàn bộ Quick Draw hoặc trọng số AI lớn.

## Mẫu local

Trong thư mục cache:

- `reports/vector-story/gallery.html`: Open Peeps, Tabler, IconPark.
- `reports/sketch-story/gallery.html` và `rough.svg`: hình phác tay.
- `reports/kenney-story/gallery.html`: nhân vật/bối cảnh 2D.
- `reports/quickdraw/animation.html`: vẽ mèo theo thứ tự nét.
- `reports/motion-canvas/sample.mp4`: video Motion Canvas.
- `reports/remotion/sample.mp4`: video Remotion.
- `reports/animated-drawings/gallery.html`: hình mẫu của Meta.

## Phần chưa làm hoặc không tải

- Open Peeps chỉ lấy SVG công khai, chưa lấy bộ mix-and-match yêu cầu luồng tải Gumroad/Blush.
- Kenney lấy 5 gói phù hợp, không phải toàn bộ kho.
- Không tải hàng loạt unDraw/iconfont do chưa xác minh quyền tích hợp/phân phối.
- Animated Drawings: repo đã archive, môi trường upstream cũ; mới kiểm tra dữ liệu, chưa chạy renderer.
- Qwen-Image và Wan2.2: chỉ mã/cấu hình; GPU hiện tại không phù hợp lệnh mẫu Wan yêu cầu 24 GB VRAM.
- Chưa tự động hóa cốt truyện, rig nhân vật hoặc đăng video lên nền tảng.

## Kiểm tra

- 8 kiểm tra bộ tải: giới hạn dung lượng, đường dẫn an toàn, checksum, giải nén, tải tiếp HTTP, tệp tải dở hoàn chỉnh và lấy mẫu Quick Draw.
- Mỗi nhánh đã kiểm tra checksum và có mẫu nhập dữ liệu hoặc render.
- Đã xem bảng hình mẫu; đã kiểm tra thông số video và hình xuất.
- Chỉ mã, lockfile, giấy phép và mẫu nhỏ trong Git; không có model/node_modules/video xuất trong phần lab.
- Việc nhìn ảnh mẫu không chứng minh toàn bộ thư viện hợp phong cách hoặc đảm bảo khả năng kiếm tiền.
