# Reflection cá nhân

Mỗi người **một file riêng**, đặt tên `reflection-<tên>.md`. Chấm riêng theo rubric reflection
của khoá — không ai viết hộ được, và CP5/CP6 hỏi ngẫu nhiên.

## Cần có gì

Theo `04-rubric.md`:

1. **Vai trò + phần mình làm** — cụ thể, trỏ được vào file/commit trong repo
2. **AI hỗ trợ thế nào** — dùng AI ở đâu, chỗ nào AI làm tốt, chỗ nào phải tự sửa lại
3. **Một bài học từ case fail của chính nhóm** — không phải bài học chung chung

> **Vibe-coding rule:** bị hỏi tại CP5/CP6 mà không giải thích được phần có tên mình
> → **0 điểm** phần cá nhân liên quan. Nên phần (1) phải là việc mình thật sự hiểu.

## Gợi ý case fail có sẵn để viết mục (3)

Repo đã có vài case fail thật, ghi đủ nguyên nhân — dùng làm chất liệu:

- **Golden set lượt 1 chỉ 71%**, trong đó 5 case trượt **oan**: bộ đối chiếu trích dẫn quá
  khắt khe với dấu nháy cong, đánh trượt cả trích dẫn trung thực. Bài học: test fail chưa
  chắc là model sai — có khi chính bộ đo sai. (`spec.md` §7)
- **T24 trượt tất định 4 lượt liền** vì trang 17 chứa ký tự Private Use Area vô hình do
  pdf.js sinh ra. Bài học: dữ liệu trích từ PDF không sạch như mình tưởng.
- **`affectedRate` hiển thị 250%** vì đếm *lượt hỏi* thay vì đếm *người*. Bài học: một con
  số vô lý đặt cạnh nhận định của AI thì phá luôn độ tin của cả phần đó.
- **Auto-refresh không chạy khi tab bị ẩn** — chính cái guard `document.hidden` viết ra để
  tiết kiệm lại chặn đúng lúc cần nhất.
