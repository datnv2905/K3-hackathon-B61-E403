# Personal Reflection — Hoàng Nguyễn Phong · Nhóm B6-1 · Zone 3

## 1. Vai trò trong nhóm

Theo phân công trong `spec.md` §8, tôi phụ trách **Code — Frontend** (cùng Nguyễn Văn Đạt) và **Code — Backend/AI call** (riêng), cộng thêm hỗ trợ **Demo & Validation** (cùng Lê Hồng Đức). Nói ngắn gọn: tôi là người dựng phần chạy được của prototype — từ màn học viên đến các lời gọi AI thật phía sau nó — và sau đó tự bổ sung một mảng không nằm trong phân công ban đầu: phần đo lường (eval) cho khối admin.

## 2. Phần mình làm cụ thể

### Học viên side

- Thay khung slide giả (card JSON soạn tay) bằng **PDF thật**: vendor `pdf.js` (không `npm install` — cả bản browser lẫn bản Node đều nằm thẳng trong repo), render canvas theo từng trang, lazy-load qua `IntersectionObserver` để không load hết 29 trang cùng lúc.
- Cơ chế chọn ngữ cảnh: bỏ hẳn "khoanh vùng" sau khi cân nhắc lại — chỉ còn kéo-chọn để bôi đen. AI hit-test vùng kéo với toạ độ thật của từng glyph (tính từ transform matrix của `pdf.js`) để lấy đúng đoạn text, thay vì dùng `TextLayer` gốc của thư viện (thử rồi bỏ vì phức tạp không cần thiết cho việc chỉ cần "chọn một đoạn để hỏi").
- Lọc watermark "AI IN ACTION - HACKATHON" khỏi cả nội dung gửi AI lẫn vùng có thể bôi đen — vì nó xuất hiện trên mọi trang PDF và làm nhiễu cả truy xuất lẫn trải nghiệm chọn.

### Backend / AI call

- Ba endpoint AI thật: `/api/tutor/answer`, `/api/tutor/quiz`, `/api/tutor/grade` — kèm retrieval theo token overlap, và quan trọng nhất: **server tự đối chiếu trích dẫn** (`verifyQuote`) — không tin thẳng câu trích của model, chỉ chấp nhận khi số trang nằm trong tập đã truy xuất và câu trích khớp nguyên văn.
- Ba đường xử lý tương ứng 3/4 lớp chỗ khó (① thiếu căn cứ, ② mơ hồ, ③ ngoài phạm vi) — model chỉ đề xuất, server chốt câu chữ cuối cùng để không bị "nói vòng qua" refusal.
- Trích xuất text thật từ PDF ngay lúc server khởi động (qua bản `pdf.js` chạy Node, tự polyfill `DOMMatrix`/`Path2D` vì Node không có), thay vì đoán ranh giới trang từ bản OCR — phát hiện vài chỗ nội dung ví dụ chỉ tồn tại dưới dạng ảnh, không có trong text layer thật.

### Admin side

- Viết `ADMIN_SIDE_IMPLEMENTATION.md` để chốt phạm vi trước khi build: chỉ làm Smart Suggestion + Dashboard tổng hợp thật từ `events.jsonl`, không làm AI vẽ lại diagram / workflow duyệt / version PDF (nằm ngoài lát cắt).
- Trong `server.js`: hàm tổng hợp sự kiện theo trang (`buildOverviewAggregate`) và endpoint `/api/admin/suggestions` — có ngưỡng tín hiệu tối thiểu để từ chối tạo suggestion khi dữ liệu quá ít, và bắt server tự tính lại evidence thay vì tin số client gửi lên.

### Eval

- Phát hiện `golden_test_set.json` + `run-golden-tests.mjs` hiện có **không hề gọi server thật** — nó chỉ test một bộ phân loại intent (`intent-router.js`) độc lập, chưa từng nối vào hệ thống đang chạy.
- Viết riêng `eval/admin_suggestion_golden_set.json` + `eval/run-admin-suggestion-eval.mjs`: dựng một server thật trên cổng riêng, bơm sự kiện giả lập vào file log riêng (không đụng vào dữ liệu demo thật), gọi thật `/api/admin/suggestions`, rồi kiểm hai lớp — số liệu (`evidence.*` phải khớp tính tay) và grounding (mọi con số AI nêu ra phải truy được về input thật, không được bịa).

## 3. AI hỗ trợ thế nào

Toàn bộ code trong repo (frontend, backend, eval) được viết qua Claude Code — tôi mô tả yêu cầu, xem code sinh ra, chạy thử thật (curl, mở trình duyệt), rồi quyết định giữ/sửa/bỏ. AI viết rất nhanh nhưng **không tự biết khi nào nên dừng phạm vi lại** — ví dụ ban đầu AI làm cả tính năng "khoanh vùng" cho PDF, tôi phải yêu cầu bỏ vì thấy nó không cần thiết cho lát cắt hiện tại; hoặc khi tôi hỏi "eval cho smart suggestion đã có chưa", AI ban đầu có thể trả lời dựa trên tên file nghe giống ("có nhắc admin, suggestion trong đó mà") nếu không tự đọc kỹ — việc đọc kỹ `run-golden-tests.mjs` để phát hiện nó không gọi HTTP nào cả là bước quan trọng nhất, và đó là việc con người phải chủ động yêu cầu kiểm tra thay vì tin ngay câu trả lời đầu tiên.

**Điều AI không thay thế được**: quyết định kiến trúc (ví dụ chọn tự tính hit-test geometry thay vì dùng `TextLayer` có sẵn), quyết định phạm vi (cái gì thuộc "Must Work" vs "Do Not Build Yet"), và việc tự tay chạy lại mọi thứ bằng dữ liệu thật trước khi tin kết quả — nếu chỉ đọc code mà không chạy, bug ở mục 4 dưới đây sẽ không bao giờ lộ ra.

## 4. Bài học từ case fail của nhóm

### Case — Eval "có tên nhưng không có tác dụng"

`golden_test_set.json` có 25 case, mô tả file còn ghi rõ "bao phủ... admin dashboard, smart suggestion..." — nhìn qua tưởng đã có eval cho khối admin. Khi tôi kiểm tra kỹ mới thấy `run-golden-tests.mjs` chỉ gọi `routeIntent()` — một bộ phân loại câu nói thành tên tool, **không hề gọi bất kỳ endpoint HTTP nào**. Ba case "TC14/15/16" tưởng là test smart suggestion thật ra chỉ kiểm xem một câu tiếng Việt có được gắn đúng nhãn `get_smart_suggestions` hay không.

**Nguyên nhân gốc**: eval được viết sớm, trước khi endpoint `/api/admin/suggestions` tồn tại — nhưng sau khi endpoint được build, không ai quay lại kiểm xem bộ eval cũ có còn khớp với hệ thống thật không. Tên file và mô tả nghe rất đầy đủ nên dễ mặc định là "đã có coverage rồi".

**Bài học rút ra**:

1. **Một file tên "golden test" không đồng nghĩa với việc nó test hệ thống thật** — phải tự hỏi "cái này có gọi server đang chạy không?" trước khi tin số % pass của nó nói lên điều gì.
2. **Khi kiến trúc đổi (thêm endpoint thật), eval cũ phải được đối chiếu lại**, không phải viết một lần rồi để đó — đúng tinh thần "look at your data" nhưng áp cho cả bộ đo, không chỉ áp cho sản phẩm.
3. Khi tôi tự viết bộ eval mới và chạy thật, nó **lập tức lộ ra lỗi trong chính dữ liệu mẫu tôi vừa viết** (tính sai `affectedRate` vì lẫn sessionId của lượt làm quiz vào số người tương tác) — chạy thật quan trọng hơn đọc code, kể cả với chính eval mình vừa viết ra.

## 5. Điều tôi sẽ làm khác nếu được làm lại

- **Viết eval song song với endpoint, không phải sau đó** — nếu golden set cho admin được viết cùng lúc với `handleAdminSuggestion`, đã không có khoảng trống "tưởng có coverage mà không có" kéo dài đến gần cuối.
- **Định kỳ tự hỏi "artifact này còn khớp với code hiện tại không"** cho mọi file trong `eval/` — không chỉ viết một lần cho đủ rubric rồi thôi.
- Dành thời gian dựng UI test qua trình duyệt (Chrome tool) sớm hơn thay vì chỉ test qua `curl` — hai lỗi hiển thị thật sự (modal quiz tổng hợp mở sẵn lúc tải trang, nội dung slide bị cắt) chỉ lộ ra khi nhìn màn hình thật, không lộ ra qua API response.
