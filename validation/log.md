# Validation log — vòng user test CP5

> **KHUNG CHỜ ĐIỀN. Chưa có dòng dữ liệu thật nào.**
> Tất cả nội dung trong `<...>` là chỗ điền. Không được điền bằng nội dung tự nghĩ ra —
> rubric ghi rõ *"Số liệu bị chỉnh sửa hoặc che giấu sẽ không được tính"*, còn dữ liệu
> thật dù kết quả xấu vẫn được tính đủ điểm.

## Cần bao nhiêu để đủ điểm R6 (8 điểm)

| Điều kiện | Cần | Đang có |
|---|---|---|
| Số mẩu feedback | ≥ 5 | **0** |
| Số người khác nhau, **ngoài nhóm** | ≥ 5 | **0** |
| Trong đó là willing user đã khai từ CP1 | ≥ 2 | **0** |
| Quote **nguyên văn** + tên/vai từng người | đủ | **0** |
| ≥1 thay đổi từ feedback, ghi vào Changelog §9 | 1 | **0** |

## Cách chạy một phiên (10 phút/người)

Chuẩn bị: `npm run dev:claude`, mở `http://localhost:3000`, đăng nhập `hocvien / hocvien123`.

1. **Giao task thật, rồi im lặng quan sát.** Không hướng dẫn, không gợi ý, không chữa khi họ làm sai — chỗ họ loay hoay chính là dữ liệu cần thu.
   - *"Hãy mở bài Day 1, tìm một đoạn bạn thấy khó hiểu, rồi hỏi trợ lý về đúng đoạn đó."*
   - Nếu người thử đóng vai giảng viên: *"Hãy xem bảng theo dõi lớp và thử tạo một smart suggestion."*
2. **Hỏi đúng 3 câu này** (đừng thêm câu dẫn dắt):
   - *"Điều gì khó hiểu hoặc khó chịu nhất?"*
   - *"Câu trả lời và nguồn trích dẫn này bạn có tin không — vì sao?"*
   - *"Bạn có dùng thật không — vì sao / vì sao chưa?"*
3. **Ghi nguyên văn.** Chép đúng chữ họ nói, kể cả khi lủng củng hoặc chê. Đừng diễn giải hộ, đừng làm mượt câu.

Mẹo: bật ghi âm (xin phép trước) rồi chép lại sau, sẽ nhanh và đúng nguyên văn hơn là vừa nghe vừa gõ.

## Bảng feedback

| # | Tên | Vai / lớp | Ngày | Task được giao | Quan sát (họ làm gì, vướng ở đâu) | Quote nguyên văn | Mức nghiêm trọng |
|---|---|---|---|---|---|---|---|
| 1 | Kim Duy Hưng | `<học viên` | `31/7` | `<task>` | `<quan sát>` | `"<nguyên văn>"` | `<cao / vừa / thấp>` |
| 2 | Nguyễn Hữu Kiên | `<học viên` | `31/7` | `<task>` | `<quan sát>` | `"<nguyên văn>"` | `<cao / vừa / thấp>` |
| 3 | Nguyễn Đức Thiện | `<học viên` | `31/7` | `<task>` | `<quan sát>` | `"<nguyên văn>"` | `<cao / vừa / thấp>` |
| 4 | Nguyễn Việt Thắng | `<học viên` | `31/7` | `<task>` | `<quan sát>` | `"<nguyên văn>"` | `<cao / vừa / thấp>` |
| 5 | Vũ Minh Đức | `<học viên` | `31/7` | `<task>` | `<quan sát>` | `"<nguyên văn>"` | `<cao / vừa / thấp>` |
| 6 | Nguyễn Đình Phúc | `<học viên` | `31/7` | `<task>` | `<quan sát>` | `"<nguyên văn>"` | `thấp>` |
| 7 | Nguyễn Thế Khải | `<học viên` | `31/7` | `<task>` | `<quan sát>` | `"<nguyên văn>"` | `vừa` |

**Mức nghiêm trọng:** `cao` = chặn không dùng được · `vừa` = làm được nhưng khó chịu · `thấp` = góp ý thẩm mỹ.

## Tổng hợp: đổi gì sau vòng này

Chọn 1–2 thứ sửa được trước demo. Mỗi dòng phải trỏ về feedback cụ thể ở bảng trên.

| Đổi gì | Vì feedback nào (số #) | Đã làm chưa | Commit |
|---|---|---|---|
| `<mô tả>` | `#<n>` | `<rồi / chưa>` | `<hash>` |

> Nếu quyết định **giữ nguyên** một feedback nào đó, vẫn phải ghi vào đây kèm lý do — rubric
> chấp nhận *"hoặc giữ nguyên có lý do căn cứ"*, nhưng phải nói ra lý do.

Sau khi điền xong, chép các thay đổi này sang §9 Changelog trong `spec.md`.
