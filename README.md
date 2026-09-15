# Video: khoa học và kể chuyện

Chỉ ba nhánh: `main` (công cụ chung), `channel/science`, `channel/storytelling`.

Agent bắt đầu từ [hướng dẫn bàn giao](lab/video-workflow/NEXT-AGENT.md), sau đó đọc [quy trình hai bước](lab/video-workflow/README.md). Ở nhánh kênh đọc thêm CHANNEL.md.

```sh
python3 lab/video-workflow/workflow.py doctor
python3 -m unittest discover -s lab/video-workflow -p 'test_*.py'
```

Giữ thư mục runtime local tại repo `vetay` cạnh worktree: sys/.venv, sys/models và sys/engine/node_modules. Không xóa chúng: giọng local và Playwright đang dùng. Ba manifest sys/engine được giữ để ghi phiên bản phụ thuộc; các lệnh studio cũ không còn thuộc quy trình.

Không dịch vụ trả phí hoặc tự đăng video. Cache giới hạn 30 GB, dự trữ 20 GB trống. Video và model không đưa vào Git.
