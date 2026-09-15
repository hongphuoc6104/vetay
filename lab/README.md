# Phòng thử nghiệm video

Nền tảng: `ve-tay-thuan` tại `4d8f08a`. Nhánh gốc không bị chỉnh sửa.

## Dữ liệu dùng chung

Mặc định `../video-lab-cache`; có thể đổi bằng `VIDEO_LAB_CACHE`.
Giới hạn 30 GB cho tải, giải nén, môi trường, cache và đầu ra mới.
Chỉ chạy một tác vụ cài đặt/tải/render mỗi lần. Không tải trọng số AI lớn.

```sh
python3 lab/assets.py fetch
python3 lab/assets.py verify
python3 lab/assets.py inventory
```

Mỗi nhánh thử có `sources.lock.json`, mẫu và hướng dẫn riêng. Bộ tải khóa
SHA-256, tiếp tục tải dở khi máy chủ hỗ trợ Range, kiểm tra dung lượng,
chặn đường dẫn giải nén ra ngoài kho và giữ giấy phép nguồn.
Repo GitHub chỉ chứa mã, khóa nguồn, mẫu nhỏ và giấy phép.

## Nhánh dự kiến

`lab/vector-story`, `lab/sketch-story`, `lab/kenney-story`, `lab/quickdraw`,
`lab/motion-canvas`, `lab/remotion`, `lab/animated-drawings`, `lab/generative-ai`.

unDraw và iconfont chỉ tham khảo; không tải hàng loạt/đóng gói lại vì phạm vi
quyền tích hợp và phân phối chưa được xác minh. Không coi logo trong một bộ
icon là quyền dùng nhãn hiệu tự do.
