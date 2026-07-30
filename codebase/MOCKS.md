# Phần nào thật, phần nào mock

Mức prototype khai báo: **Working** cho lát cắt học viên · **Working** cho lát cắt admin/giảng viên (§12–§13 scope, xem `ADMIN_SIDE_IMPLEMENTATION.md`).

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
| **Admin: Smart Suggestion Engine** | `POST /api/admin/suggestions` → Gemini `generateContent`. Server tự tính lại `PageAggregate` của trang đó từ `events.jsonl` (không tin số client gửi lên), chỉ đưa các con số đã tổng hợp + danh sách câu hỏi thường gặp vào prompt. Model không được bịa số; nếu trang chưa đủ tín hiệu (`questionCount < 2 && highlightCount < 2`), server từ chối gọi model và trả `422`. |
| **Admin: tổng hợp per-page** | `GET /api/admin/overview`, `GET /api/admin/pages/:pageNumber/questions` — đọc và gộp `codebase/var/events.jsonl` theo `lessonId` rồi `pageNumber` mỗi lần gọi, không cache, không hardcode số nào. |

## Mock hoặc giới hạn — biết trước để không nói quá trong demo

| Thành phần | Giới hạn thật sự |
|---|---|
| **Nội dung slide** | **Soạn tay** trong `codebase/lesson/day06-ai-product.json` từ `01-de-bai.md` + `02-guide.md`. **Không có PDF renderer, không parse text layer, không OCR.** Đây là mock lớn nhất của bản này. |
| Số trang hiển thị | Nhãn ghi "Trang N / 37" để giống deck thật, nhưng chỉ có 6 trang tồn tại. |
| Khoanh vùng | Chỉ lưu toạ độ phần trăm. **Không crop ảnh, model không nhìn thấy pixel** — nó nhận toạ độ + text của trang và được yêu cầu nói rõ nếu vùng mơ hồ. |
| Truy xuất | Trùng token, không phải embedding. Đủ cho 6 trang; **sẽ không đủ cho deck 37 trang thật**. |
| Câu hỏi nền (Phần A) | Seed sẵn 3 câu trong lesson JSON. **Không có màn hình cho giảng viên tự soạn.** |
| Đáp án Phần A | Gửi kèm xuống browser, nên mở devtools là đọc được. Chấp nhận được cho prototype, không chấp nhận được cho bản thật. |
| Người học | Một người học giả lập, không có tài khoản thật. Analytics gộp theo `sessionId` của một phiên. |
| **Đăng nhập** | **Giả lập hoàn toàn.** Hai tài khoản (`admin`/`admin123`, `hocvien`/`hocvien123`) là hằng số trong `codebase/public/auth.js`, mật khẩu để nguyên văn và in thẳng lên màn hình đăng nhập. Vai trò lưu ở `localStorage`; **API không kiểm tra gì cả** — gõ thẳng `/admin.html` rồi tự đặt `localStorage` là vào được, và `/api/admin/*` trả dữ liệu cho bất kỳ ai gọi. Đây là cổng **điều hướng** để demo hai màn hình, **không phải lớp bảo mật**. Bản thật cần session server-side + kiểm quyền trên từng route. |
| Lưu trữ | `localStorage` + JSONL append. Không có database. |
| **"Số người học" ở admin** | `totalLearners` là số `sessionId` khác nhau xuất hiện trong log — không phải tài khoản thật. Màn đăng nhập chỉ có 1 tài khoản học viên dùng chung, nên con số này vẫn đếm phiên chứ không đếm người. Admin screen ghi rõ điều này, không trình bày như headcount thật. |
| **Heatmap ở admin** | Không phải overlay toạ độ x/y — vì lát cắt học viên **đã bỏ chế độ khoanh vùng** (xem ghi chú "Khoanh vùng" ở trên và `ADMIN_SIDE_IMPLEMENTATION.md` Non-goal 4). Bảng xếp hạng theo trang (câu hỏi, bôi đen, tỷ lệ sai) đóng vai trò heatmap cho bản này. Muốn có heatmap toạ độ thật theo đúng PRD §13.3 thì phải mang khoanh vùng quay lại trước. |
| **Common questions** | Gộp theo chuỗi giống hệt nhau (exact-string), không phải clustering ngữ nghĩa thật. |
| **Admin: câu hỏi từng trang** | Chỉ tính được cho các câu hỏi gửi kèm text (`ask_question` event) — log cũ trước khi field này được thêm sẽ không có, không backfill. |

## Không build trong bản này

Heatmap toạ độ x/y (region-select đã bị bỏ) · AI vẽ lại diagram · workflow approve/regenerate/reject · xuất PDF phiên bản mới · chuyển Active version · tích hợp LMS · sửa Phần A (câu hỏi nền) từ UI · **xác thực thật** (đăng ký, mật khẩu băm, session server-side, phân quyền ở tầng API — bản này chỉ có đăng nhập giả lập, xem bảng trên).

Lý do: nằm ngoài lát cắt một câu của từng bản (xem `USER_SIDE_IMPLEMENTATION.md` và `ADMIN_SIDE_IMPLEMENTATION.md`). Các phần này có trong PRD §14–§16 như hướng đi tiếp, không phải phạm vi hai bản demo hiện tại.
