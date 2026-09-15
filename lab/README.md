# Video Lab — nhánh nền

Đọc [báo cáo bàn giao](REPORT.md) để chọn nhánh và xem kết quả thực tế.

```sh
python3 lab/assets.py inventory
python3 lab/assets.py verify
python3 lab/assets.py fetch --manifest lab/catalog/vector-story.json
python3 -m unittest discover -s lab -p 'test_*.py'
```

`sources.lock.json` tổng hợp các nguồn đã tải. `catalog/` tách từng hướng.
Mọi lượt tải dùng kho chung `../video-lab-cache`, giới hạn 30 GB và giữ lại 20 GB trống.
Tải tuần tự; không đặt cache vào kho Git. Các nhánh thử có mẫu và hướng dẫn riêng.
