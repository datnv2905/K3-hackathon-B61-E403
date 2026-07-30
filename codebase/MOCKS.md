# Phần nào thật, phần nào mock

Mức prototype khai báo: **Working** cho lát cắt học viên · **Không build** cho phần giảng viên/admin.

Bảng này là bản khai báo trung thực theo R5 và vibe-coding rule. Nếu có mâu thuẫn giữa bảng này và demo, bảng này đúng.

## Thật — chạy thật, không hardcode

| Thành phần | Thật ở chỗ nào |
|---|---|
| Lời gọi AI trả lời | `POST /api/tutor/answer` → Gemini `generateContent`. Đây là quyết định AI trung tâm của lát cắt. |
| Lời gọi AI tạo micro quiz | `POST /api/tutor/quiz` → Gemini, sinh 1–3 câu theo trang nguồn. |
| Lời gọi AI chấm tự luận | `POST /api/tutor/grade` → Gemini chấm đúng/sai + nhận xét. |
| Truy xuất nội dung | `retrievePages()` — chấm điểm trùng token giữa câu hỏi và từng trang, lấy top 4 + trang đang chọn. Prompt chỉ nhận các trang này. |
| Đối chiếu trích dẫn | Server kiểm `citation.pageNumber` có nằm trong tập trang đã truy xuất, và `citation.quote` có xuất hiện nguyên văn trong trang đó. Không khớp → hạ `confidence` xuống `low` và gắn cờ `unverified`. |
| Ba đường từ chối | Server quyết định câu chữ cuối cùng (`INSUFFICIENT_TEXT` / `CLARIFY_TEXT` / `OUT_OF_SCOPE_TEXT`), model chỉ đề xuất. Model không nói vòng qua được. |
| Ghi nhận kết quả quiz | Đúng/sai lưu theo từng câu, gắn `pageNumber`, giữ trong `localStorage` và gửi `POST /api/events` → `codebase/var/events.jsonl`. |
| Rating + opt-out | Gắn đúng micro quiz phát sinh ra nó (không phải quiz mới nhất). Hai hành động độc lập, đúng PRD §8.6. |
| Quiz tổng hợp | Ghép Phần A + Phần B thật: ưu tiên câu trả lời sai → câu chưa làm → còn lại; loại câu trùng bằng độ trùng token ≥0.7; giới hạn 5 câu cá nhân hoá; khoá danh sách khi đã bắt đầu. |

## Mock hoặc giới hạn — biết trước để không nói quá trong demo

| Thành phần | Giới hạn thật sự |
|---|---|
| **Nội dung slide** | **Soạn tay** trong `codebase/lesson/day06-ai-product.json` từ `01-de-bai.md` + `02-guide.md`. **Không có PDF renderer, không parse text layer, không OCR.** Đây là mock lớn nhất của bản này. |
| Số trang hiển thị | Nhãn ghi "Trang N / 37" để giống deck thật, nhưng chỉ có 6 trang tồn tại. |
| Khoanh vùng | Chỉ lưu toạ độ phần trăm. **Không crop ảnh, model không nhìn thấy pixel** — nó nhận toạ độ + text của trang và được yêu cầu nói rõ nếu vùng mơ hồ. |
| Truy xuất | Trùng token, không phải embedding. Đủ cho 6 trang; **sẽ không đủ cho deck 37 trang thật**. |
| Câu hỏi nền (Phần A) | Seed sẵn 3 câu trong lesson JSON. **Không có màn hình cho giảng viên tự soạn.** |
| Đáp án Phần A | Gửi kèm xuống browser, nên mở devtools là đọc được. Chấp nhận được cho prototype, không chấp nhận được cho bản thật. |
| Người học | Một người học giả lập, không có tài khoản. Analytics gộp theo `sessionId` của một phiên. |
| Lưu trữ | `localStorage` + JSONL append. Không có database. |

## Không build trong bản này

Admin dashboard · heatmap · smart suggestion engine · AI vẽ lại diagram · workflow approve/regenerate/reject · xuất PDF phiên bản mới · chuyển Active version · tích hợp LMS.

Lý do: nằm ngoài lát cắt một câu (xem `USER_SIDE_IMPLEMENTATION.md`). Các phần này có trong PRD §12–§16 như hướng đi tiếp, không phải phạm vi bản demo.
