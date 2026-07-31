# Reflection cá nhân — Lê Hồng Đức

- **Họ và tên:** Lê Hồng Đức
- **Mã học viên:** 2A202601313
- **Nhóm:** B61
- **Vai trò:** Frontend + Write test + Wite spec.md

## 1. Phần tôi phụ trách

Trong sản phần này, công việc của tôi gồm:  
- Thực hiện phần UI giao diện ban đầu của project này, bao gồm phần slide bài giảng của bài học, giao diện chat với AI và các công cụ cơ bản ban đầu của project.
- Đồng viết các test case phần Golden Set cho project
- Theo dõi tiến độ của các thành viên theo từng checkpoint và hoàn thiện file spec.md

## 2. AI đã hỗ trợ tôi như thế nào

Tôi dùng AI để hỗ trợ đọc yêu cầu trong PRD, đề xuất cấu trúc prompt, sinh các trường hợp biên và phân tích nguyên nhân test thất bại. AI cũng giúp tôi rà soát schema của tool call và gợi ý cách tách lỗi theo các nhóm như sai tool, sai tham số, vượt ranh giới, thiếu thông tin và ngoài phạm vi.

Tôi không lấy output của AI làm kết quả đúng mặc định. Mỗi thay đổi vẫn được kiểm tra bằng golden test và đối chiếu với hành vi mong muốn. Với phần trích dẫn, server kiểm tra lại số trang và quote thay vì chỉ tin nội dung model sinh ra.

Tôi dùng AI để hỗ trợ đọc yêu cầu trong PRD, viết các golden test phù hợp với project và có verify bằng tay lại sau đó. Dùng AI sinh 100% UI ban đầu đúng với các mô tả trong PRD.

Không để AI sinh bừa golden test, không dùng AI viết spec.md vì đày là phần cần theo dõi các tiến độ thật của nhóm. 

## 3. Một case fail và cách tôi xử lý

Trong lúc viết Golden Set cho phần chatbot trả lời khi người học khoanh vùng (highlight) một đoạn diagram trên slide, tôi phát hiện nhiều test case bị fail dù prompt và logic backend nhìn qua không có gì sai — AI vẫn trả lời rất tự tin, đúng định dạng trích dẫn, nhưng nội dung lại không khớp với slide thực tế.

Ban đầu tôi nghi ngờ do model, thử đổi prompt vài lần nhưng vẫn fail. Sau khi log lại toàn bộ payload gửi lên từ frontend, tôi mới nhận ra nguyên nhân không nằm ở AI mà ở phần UI tôi làm: khi người dùng khoanh một vùng, component chỉ gửi ảnh crop lên mà không kèm số slide và đoạn text gốc tương ứng — nên AI không có đủ ngữ cảnh để trả lời đúng. Đây đúng là case rơi vào nhóm lỗi "mơ hồ/thiếu thông tin" mà nhóm đã liệt kê ở phần kiểu lỗi, chỉ khác là gốc rễ nằm ở tầng dữ liệu gửi lên chứ không phải ở cách AI xử lý.

Cách tôi xử lý: chỉnh lại component khoanh vùng để luôn đính kèm metadata bắt buộc (số slide, tọa độ vùng chọn, đoạn text liên quan nếu có) mỗi khi gửi request, đồng thời thêm một lớp test case riêng chỉ để kiểm tra payload gửi lên có đủ trường bắt buộc hay không, tách biệt với test kiểm tra câu trả lời của AI. Sau khi sửa, chạy lại Golden Set thì các case liên quan pass trở lại.

## 4. Bài học rút ra

- Nhiều lỗi trông giống lỗi của AI (trả lời sai, lạc đề) nhưng gốc rễ lại nằm ở tầng dữ liệu/frontend gửi lên — trước khi nghi ngờ model, cần kiểm tra payload thực tế trước.
- Golden test không nên chỉ kiểm tra output cuối cùng mà nên có thêm lớp kiểm tra input/context, vì input thiếu là nguyên nhân gốc của khá nhiều case fail.
- Dùng AI hỗ trợ không có nghĩa là tin ngay kết quả — kể cả gợi ý sửa lỗi từ AI, tôi vẫn đối chiếu lại với hành vi mong muốn trong PRD trước khi áp dụng.
- Vai trò viết spec.md giúp tôi thấy rõ tầm quan trọng của việc cập nhật ngay khi có thay đổi (schema, luồng dữ liệu) — spec không theo kịp thì các thành viên khác rất dễ làm lệch hướng nhau.

## 5. Nếu có thêm thời gian

- Mở rộng Golden Set để cover thêm các trường hợp khoanh vùng phức tạp hơn: vùng chọn lẫn nhiều loại nội dung, ảnh độ phân giải thấp, vùng chọn rất nhỏ.
- Viết thêm test tự động kiểm tra tính nhất quán giữa trích dẫn AI trả về và metadata slide thực tế, để bắt sớm các case trích dẫn sai số slide.
- Cải thiện UI để hiển thị rõ hơn mức độ chắc chắn của câu trả lời cho người học, thay vì chỉ hiện văn bản trả lời như hiện tại.
- Viết thêm tài liệu hướng dẫn debug lỗi liên quan tool-call/schema cho các thành viên khác, để không chỉ một mình tôi hiểu rõ toàn bộ luồng này.
