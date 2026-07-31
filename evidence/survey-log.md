# Log khảo sát — evidence chuẩn A cho spec.md §1

> **KHUNG CHỜ ĐIỀN. Chưa có câu trả lời thật nào.**
> Rubric R1 đòi *"log đủ câu hỏi + từng câu trả lời nguyên văn"*. Bảng tổng hợp phần trăm
> **không thay thế được** log này — phải có từng câu trả lời của từng người.

## Chuẩn A yêu cầu gì

| Điều kiện | Cần | Đang có |
|---|---|---|
| Số người được hỏi, **ngoài nhóm** | ≥ 20 | `<điền>` |
| Tỷ lệ xác nhận có pain | ≥ 50% | **44,4% (20/45)** ← đang dưới ngưỡng |
| Log đủ **câu hỏi** đã dùng | đủ | có (bên dưới) |
| Log **từng câu trả lời nguyên văn** | đủ | **chưa có** |
| Phương pháp đếm kiểm lại được | rõ | **chưa ghi** |

> **Vấn đề đang có, đừng lờ đi:** con số hiện tại trong `spec.md` §1 là **20/45 = 44,4%**, dưới
> ngưỡng 50% của chuẩn A. Có ba đường xử lý, đều trung thực:
> 1. **Hỏi thêm người** cho tới khi đủ mẫu — nhưng không được chỉ hỏi thêm người mình đoán sẽ đồng ý.
> 2. **Đổi câu pain** cho khớp thứ nhiều người thực sự xác nhận (ví dụ 25/45 = 55,6% "thường xuyên
>    sai kiến thức lý thuyết vừa học" — con số này đã có sẵn trong §2).
> 3. **Ghi nhận không đạt chuẩn A** và bù bằng chuẩn B (mining data) — nhưng repo chưa có
>    `data/vlearn-pack/` nên đường này hiện không khả thi.
>
> Đường 2 nhiều khả năng đúng nhất: pain thật của nhóm có lẽ là "sai kiến thức lý thuyết", chứ
> không phải câu đang viết trong §1.

## Câu hỏi đã dùng

Chép đúng câu chữ đã hỏi. Nếu hỏi bằng Google Form thì dán luôn link form.

| # | Câu hỏi | Loại |
|---|---|---|
| Q1 | Khi phát hiện mình hiểu sai, điều đó ảnh hưởng thế nào đến việc học của bạn? | tự luận |
| Q2 | Nếu có 1 công cụ AI tự động sinh câu hỏi ôn tập, nhắm đúng phần bạn còn yếu, bạn có sẵn sàng dùng thử không? | có/không |
| Q3 | Bạn đã từng dùng cách nào để tự kiểm tra mức hiểu bài? Nếu chưa có, vì sao không dùng thường xuyên? | tự luận |
| Q4 | Bạn thích câu hỏi ôn tập dạng nào? | chọn |
| Q5 | Bạn thường xuyên sai kiến thức ở dạng nội dung nào nhất? | chọn |

> Q1, Q3 là câu tự luận — **chính chúng cho ra quote nguyên văn** mà rubric đòi. Q2, Q4, Q5 là câu
> đóng, chỉ cho ra số đếm.

Link form: `<dán link>`

## Câu trả lời từng người

Mỗi người một dòng. Không ẩn danh hoá đến mức không kiểm lại được — nhưng cũng không cần
họ tên đầy đủ, mã HV hoặc tên + lớp là đủ để phúc khảo.

| # | Người trả lời | Q1 (nguyên văn) | Q2 | Q3 (nguyên văn) | Q4 | Q5 |
|---|---|---|---|---|---|---|
| 1 | `<tên / mã HV>` | `"<nguyên văn>"` | `<có/không>` | `"<nguyên văn>"` | `<chọn>` | `<chọn>` |
| 2 | | | | | | |
| … | | | | | | |

*(Nếu thu bằng Google Form thì xuất CSV rồi để nguyên file cạnh đây — đỡ phải chép tay,
và kiểm lại dễ hơn.)*

## Phương pháp đếm — phải kiểm lại được

Ghi rõ để người ngoài nhóm đếm lại ra đúng con số:

- **Tổng số người được hỏi:** `<n>` — hỏi ở đâu, lúc nào: `<mô tả>`
- **Đếm "có pain" bằng cách nào:** `<ví dụ: đếm số người trả lời "có" ở Q2>`
- **Ai bị loại khỏi mẫu và vì sao:** `<ví dụ: 3 người trong nhóm, không tính>`
- **Kết quả:** `<x>`/`<n>` = `<y>`%

## ≥5 quote nguyên văn cho spec.md §1

Chọn từ bảng trên, ưu tiên câu nói rõ **hậu quả** chứ không chỉ nói "bất tiện".

1. `"<quote>"` — `<tên>`, `<lớp>`
2. `"<quote>"` — 
3. `"<quote>"` — 
4. `"<quote>"` — 
5. `"<quote>"` — 

> **Lưu ý:** phần "≥5 quote" trong `spec.md` §1 hiện đang liệt kê **5 câu hỏi khảo sát**, không
> phải câu trả lời. Đó là nhầm lẫn cần sửa — quote phải là lời người được hỏi nói ra.
