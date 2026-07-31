# Bộ thu dữ liệu nhanh — dùng ngay, không cần soạn thêm

Mục tiêu: **5 người ngoài nhóm × 10 phút = 50 phút** là đủ điểm R6 (8 điểm).
Chuẩn bị trước: `npm run dev:claude`, mở `http://localhost:3000`.

---

## 1. Tin nhắn rủ người thử — copy nguyên, dán vào Discord/nhóm lớp

> Chào mọi người, nhóm mình (B6-1) đang làm trợ lý AI đọc slide cho hackathon.
> Cần **5 bạn thử giúp 10 phút** thôi — không cần chuẩn bị gì, cứ dùng như bình thường
> rồi nói thật cảm nhận, chê càng tốt vì tụi mình cần biết chỗ dở.
> Ai rảnh trong giờ nghỉ thì thả tim giúp mình nhé 🙏

Nếu rủ trực tiếp thì ngắn hơn: *"Ông thử cái này 10 phút giúp tôi được không? Chỉ cần dùng rồi chê thôi."*

---

## 2. Kịch bản phiên — đọc đúng những gì in đậm, đừng thêm

**Mở đầu** (30 giây), nói nguyên văn:

> **"Đây là bản thử. Bạn cứ dùng tự nhiên, làm sai cũng không sao — mình đang tìm chỗ khó
> dùng chứ không kiểm tra bạn. Mình sẽ ngồi im quan sát, có gì bạn cứ nói to suy nghĩ ra."**

**Giao task** (5–7 phút) — chọn 1 trong 2:

- Học viên: **"Mở bài Day 1, tìm một đoạn bạn thấy khó hiểu, rồi hỏi trợ lý về đúng đoạn đó."**
- Giảng viên/TA: **"Xem bảng theo dõi lớp, rồi thử tạo một smart suggestion cho một trang bất kỳ."**

> ⚠️ **Từ đây tuyệt đối không hướng dẫn.** Họ loay hoay ở đâu thì chính chỗ đó là dữ liệu.
> Muốn nhắc thì cắn răng đếm đến 10 trước đã. Chỉ can thiệp khi app lỗi thật.

**Ghi lại trong lúc quan sát:** họ bấm nhầm chỗ nào · dừng lại bao lâu · câu nào thốt ra.

**Ba câu hỏi cuối** (2 phút) — hỏi đúng thứ tự, không thêm câu dẫn:

1. **"Điều gì khó hiểu hoặc khó chịu nhất?"**
2. **"Câu trả lời và nguồn trích dẫn này bạn có tin không — vì sao?"**
3. **"Bạn có dùng thật không — vì sao / vì sao chưa?"**

Xin phép ghi âm: *"Mình ghi âm để chép lại cho đúng lời bạn nhé?"* — nhanh hơn vừa nghe vừa gõ,
và đúng nguyên văn hơn.

---

## 3. Câu hỏi khảo sát — nếu cần bù mẫu cho §1

Dán thẳng vào Google Form. Q1 và Q3 là câu **cho ra quote nguyên văn** mà rubric đòi.

| # | Câu hỏi | Loại |
|---|---|---|
| Q0 | Họ tên hoặc mã HV | ngắn |
| Q1 | Khi phát hiện mình hiểu sai một kiến thức vừa học, điều đó ảnh hưởng thế nào đến việc học của bạn? | **tự luận** |
| Q2 | Bạn có thường xuyên sai kiến thức lý thuyết ngay sau khi vừa học xong không? | Có / Không |
| Q3 | Bạn đã từng dùng cách nào để tự kiểm tra mức hiểu bài? Nếu chưa, vì sao không dùng thường xuyên? | **tự luận** |
| Q4 | Nếu có công cụ AI sinh câu hỏi ôn tập nhắm đúng phần bạn còn yếu, bạn có dùng thử không? | Có / Không |
| Q5 | Bạn thích câu hỏi ôn tập dạng nào? | Trắc nghiệm / Tự luận ngắn / Cả hai |

> **Q2 là câu quan trọng nhất.** Con số 25/45 = 55,6% trong §2 hiện tại có vẻ đến từ đúng câu
> hỏi này, và nó **vượt ngưỡng 50%** — trong khi câu pain đang viết ở §1 chỉ được 44,4%.
> Nếu đúng vậy thì chỉ cần đổi câu pain cho khớp dữ liệu, không cần hỏi thêm ai.

Xuất CSV xong để nguyên file vào `evidence/`, đừng chép tay — kiểm lại dễ hơn.

---

## 4. Xong rồi thì

1. Điền `validation/log.md` — quote **nguyên văn**, kể cả câu chê nặng
2. Chọn 1–2 thứ sửa được trước demo, ghi vào bảng cuối file đó rồi chép sang `spec.md` §9
3. Gửi tôi bản thô (CSV, ảnh chụp, ghi chú tay) — tôi đưa vào đúng định dạng, tính lại phần trăm,
   và cập nhật §1/§2 cho khớp

**Feedback xấu vẫn ăn đủ điểm.** Rubric: *"Kết quả đo ghi nhận trung thực — kể cả khi không đạt
mục tiêu nhóm tự đặt — vẫn được tính đủ điểm."* Người chê nhiều là người cho dữ liệu tốt nhất.
