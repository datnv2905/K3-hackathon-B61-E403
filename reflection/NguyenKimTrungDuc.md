# Personal Reflection — [TÊN ĐẦY ĐỦ] · Nhóm B6-1 · Zone 3

## 1. Vai trò trong nhóm

Trong hackathon lần này, tôi đảm nhận phần **Prompt & AI logic**, cụ thể là **viết golden test set** (§7 trong spec.md) — bộ 25 test case dùng để đo chất lượng AI trước khi demo. Ngoài ra, tôi cũng tham gia thiết kế prompt cho quyết định AI trung tâm: chatbot trả lời có trích dẫn từ context khoanh vùng/highlight trên slide, và sinh micro quiz bám ngữ cảnh.

## 2. Phần mình làm cụ thể — Golden Set

### Tại sao golden set quan trọng

Golden set không chỉ là "viết test cho đủ rubric" — nó là **thước đo duy nhất** để biết AI của nhóm có đáng tin hay không. Nếu golden set không phủ đúng các lớp chỗ khó, nhóm sẽ không bao giờ phát hiện lỗi nguy hiểm (như AI bịa deadline, trích dẫn sai slide) cho đến khi user thật gặp phải.

### Quy trình xây dựng

1. **Phân lớp theo taxonomy 4 lớp chỗ khó** — mỗi lớp cần ≥2 case:
   - ① Nguồn sự thật (G01–G03): AI có bịa khi không có căn cứ không? Có lấy đúng link/deadline mới nhất không?
   - ② Mơ hồ / thiếu thông tin (G04–G06): Khi câu hỏi không đủ rõ, AI có đoán đại hay hỏi lại?
   - ③ Ngoài phạm vi (G07–G09): Khi học viên đòi thứ AI không được phép làm (xin gia hạn, sửa điểm), AI xử lý ra sao?
   - ④ Đặc thù domain (G10–G12): Sai ở đây thì học viên học sai kiến thức ngay — phân biệt 2 mốc deadline, múi giờ, tin nhắn mâu thuẫn.

2. **Pha trộn nguồn**: ≥10 case lấy/phát triển từ chatlog thật (đảm bảo sát thực tế), phần còn lại tự sinh để phủ các edge case hiếm gặp (hỏi bằng tiếng Anh xen Việt, spam emoji, dồn 2 câu hỏi trong 1 tin nhắn).

3. **Viết hành vi mong muốn rõ ràng** — mỗi case phải đủ rõ để "người ngoài nhóm chấm ra cùng kết quả" (đây là yêu cầu khó nhất, không phải viết test case mà viết **định nghĩa kiểm chứng được**).

4. **Golden set dạng JSON cho tool-call** (`golden_test_set.json`): 25 case bao phủ toàn bộ luồng sản phẩm — từ hỏi tự do, hỏi theo highlight/khoanh vùng, micro quiz, quiz tổng hợp, admin dashboard, smart suggestion, AI regenerate diagram, workflow duyệt phiên bản PDF, cho đến các case out-of-scope và missing-info. Mỗi case ghi rõ `expect` (tool nào cần gọi, với args gì) và `failure_type` để khi chạy eval tự động biết case nào đang test lỗi gì.

### Khó khăn gặp phải

- **Viết "hành vi mong muốn" sao cho đủ rõ ràng**: Ban đầu tôi viết kiểu "AI nên trả lời đúng" — quá chung chung. Sau khi 2 thành viên chấm độc lập 5 case đầu và ra kết quả lệch nhau, tôi phải viết lại thành dạng cụ thể hơn: "Pass nếu trả lời đúng ngày giờ + trích dẫn tin gốc từ kênh #thong-bao-chinh-thuc kèm timestamp". Đây là bài học lớn nhất — **định nghĩa chất lượng phải đo được, không phải cảm tính**.

- **Cân bằng case thường vs. case hiếm**: Nếu toàn case khó thì golden set không phản ánh trải nghiệm phổ biến; nếu toàn case dễ thì không phát hiện lỗi nguy hiểm. Cuối cùng cơ cấu là: 8 case thường (G13–G20), 8 case theo 4 lớp chỗ khó (G01–G12 mỗi lớp ≥2), và 3 case hiếm (G21–G23).

## 3. AI hỗ trợ thế nào

Tôi sử dụng AI (LLM) ở các bước sau:

- **Brainstorm edge case**: Sau khi liệt kê các case chính từ chatlog thật, tôi dùng AI để "nghĩ thêm" các tình huống hiếm mà tôi có thể bỏ sót (ví dụ: học viên hỏi bằng tiếng Anh xen tiếng Việt, hoặc gõ sai tên buổi). AI đề xuất được vài case hay, nhưng tôi phải tự lọc và chỉnh lại cho sát bối cảnh khoá học thật.

- **Format JSON cho golden set**: Viết 25 case dạng JSON với cấu trúc `expect.tool_calls` khá lặp đi lặp lại — AI giúp tăng tốc phần format, tôi tập trung vào nội dung logic (query gì, expect tool nào, args gì).

- **Kiểm tra chéo định nghĩa chiều chất lượng**: Tôi paste định nghĩa các chiều (Đúng-có-căn-cứ, Từ chối đúng lúc, An toàn phạm vi, Đúng cỡ — đúng giọng) lên AI và hỏi "nếu bạn là người chấm, case này bạn sẽ cho Pass hay Fail?" — qua đó phát hiện các chỗ định nghĩa còn mập mờ.

**Điều AI không thay thế được**: quyết định case nào thuộc lớp chỗ khó nào, chọn chatlog thật nào đủ đại diện, và đánh giá "nếu AI sai ở case này thì hậu quả với học viên lớn đến đâu" — những thứ cần hiểu context sản phẩm và domain giáo dục cụ thể.

## 4. Bài học từ case fail của nhóm

### Case G03 — AI lấy nhầm link cũ khi có 2 version

Đến lượt chạy thứ 3 (trước CP5), nhóm đạt 3/4 điều kiện quality bar nhưng **vẫn còn 1 case lớp ① fail**: G03 — "Hỏi link nộp bài buổi 2, link trong kênh đã bị sửa 2 lần". AI lấy bản link cũ thay vì bản mới nhất.

**Nguyên nhân gốc**: khi chunk nội dung từ kênh Discord, hệ thống không ưu tiên tin nhắn có timestamp mới nhất trong cùng thread. Hai tin nhắn cùng đề cập link nộp bài, AI chọn tin đầu tiên nó tìm thấy (cũ hơn) — vì không có logic "ưu tiên tin mới".

**Bài học rút ra**:

1. **Cost-of-error trong giáo dục rất cao**: Sai link nộp bài = học viên nộp nhầm chỗ = mất điểm thật. Đây không phải lỗi "khó chịu" mà là lỗi **gây hậu quả trực tiếp**. Chính vì viết golden set, tôi mới nhận ra: nếu không có case G03, nhóm sẽ tự tin rằng AI đã đúng — trong khi thực tế nó đang phục vụ thông tin cũ cho học viên.

2. **Golden set phải có case "dữ liệu mâu thuẫn"**: Ban đầu tôi chỉ test "có thông tin → trả lời đúng" và "không có thông tin → từ chối". Nhưng trường hợp nguy hiểm nhất là **có thông tin nhưng có nhiều version** — AI tự tin trả lời vì tìm thấy câu trả lời, nhưng lại là câu trả lời cũ. Case G03, G10 (phân biệt nộp nháp vs. nộp chính thức), G12 (deadline đã dời) đều thuộc pattern này.

3. **"Không đạt" không có nghĩa là thất bại nếu có phân tích**: Nhóm giữ nguyên kết quả trung thực (đúng rubric: "kết quả không đạt vẫn tính đủ điểm nếu có phân tích"), ghi rõ nguyên nhân và đưa vào backlog vì hết thời gian sửa an toàn trước demo. Đây là cách tiếp cận engineering trung thực — thà ghi nhận lỗi còn hơn chỉnh số liệu cho đẹp.

## 5. Điều tôi sẽ làm khác nếu được làm lại

- **Viết golden set sớm hơn** — nên có bộ case sơ bộ (dù chỉ 10 case) ngay từ CP2 thay vì chờ đến CP3. Nếu có sớm hơn, nhóm có thể phát hiện vấn đề "ưu tiên tin mới" từ đầu và có thời gian sửa logic chunk trước demo.

- **Mỗi case nên ghi rõ "tại sao case này tồn tại"** — ở bộ JSON cuối tôi đã có trường `metadata.what_it_tests`, nhưng ở bộ golden set trong spec.md ban đầu thì chưa. Khi đội chấm chéo, người chấm không hiểu "case này đang test lỗi gì" thì rất khó cho Pass/Fail nhất quán.
