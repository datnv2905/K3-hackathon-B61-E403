
# Product Requirements Document (PRD)

## Hệ thống Bài giảng Slide + AI Hỗ trợ Học tập


| Thuộc tính             | Giá trị                        |
| -------------------------- | ---------------------------------- |
| Phiên bản              | 1.0                              |
| Trạng thái             | Draft hoàn chỉnh để review   |
| Loại sản phẩm         | Functional prototype             |
| Ngôn ngữ               | Tiếng Việt                     |
| Định dạng bài giảng | PDF                              |
| Phạm vi thử nghiệm    | 1–2 file PDF ngắn              |
| Vai trò                 | Người học, Giảng viên/Admin |

---

## 1. Tóm tắt sản phẩm

Hệ thống Bài giảng Slide + AI Hỗ trợ Học tập là một prototype cho phép người học đọc bài giảng PDF, đặt câu hỏi cho AI và kiểm tra mức độ hiểu bài ngay trong cùng một giao diện.

Giao diện học tập được chia thành hai khu vực:

- **Bên trái:** trình xem slide PDF dạng cuộn liên tục.
- **Bên phải:** chatbot AI hỗ trợ giải thích, hỏi đáp và tạo micro quiz.

Trong quá trình học, người học có thể:

- Đặt câu hỏi tự do về toàn bộ bài giảng.
- Highlight một đoạn văn bản.
- Dùng pencil hoặc công cụ chọn vùng để khoanh một diagram, hình ảnh, bảng biểu hoặc phần nội dung cụ thể.
- Gửi phần đã chọn cho chatbot để nhận giải thích có trích dẫn nguồn.
- Chủ động yêu cầu AI tạo micro quiz 1–3 câu nhằm kiểm tra mức độ hiểu.
- Đánh giá chất lượng micro quiz do AI tạo.
- Loại một micro quiz khỏi danh sách câu hỏi có thể xuất hiện lại trong quiz tổng hợp cuối bài.

Hệ thống thu thập dữ liệu tương tác để giúp giảng viên xác định những phần nội dung khó hiểu, xem các câu hỏi phổ biến, theo dõi kết quả quiz và nhận smart suggestion từ AI. Với các diagram chưa rõ ràng, AI có thể tạo một phương án mới để giảng viên chỉnh sửa, duyệt và xuất thành phiên bản PDF mới.

---

## 2. Vấn đề cần giải quyết

### 2.1. Vấn đề của người học

Người học bằng slide thường gặp các khó khăn sau:

- Không hiểu một đoạn văn, diagram hoặc bảng biểu cụ thể.
- Khó mô tả chính xác phần nội dung mình muốn hỏi.
- Phải chuyển sang công cụ khác để tìm kiếm, làm gián đoạn quá trình học.
- Không biết mình đã thực sự hiểu câu trả lời của AI hay chưa.
- Quiz cuối bài không phản ánh những phần cá nhân từng gặp khó khăn.
- Các câu hỏi AI tạo có thể không hữu ích, quá dễ, quá khó hoặc không sát nội dung.

### 2.2. Vấn đề của giảng viên

Giảng viên thường:

- Không biết chính xác vùng nào trên slide khiến người học khó hiểu.
- Không có dữ liệu tổng hợp về highlight, khoanh vùng và câu hỏi.
- Không liên kết được kết quả quiz với chất lượng của từng slide.
- Khó đánh giá chất lượng câu hỏi do AI tạo.
- Phải tự phân tích và chỉnh sửa slide thủ công.
- Khó quản lý và chuyển đổi giữa các phiên bản bài giảng đã cải thiện.

---

## 3. Mục tiêu sản phẩm

### 3.1. Mục tiêu đối với người học

- Cho phép hỏi AI ngay trong quá trình xem slide.
- Giúp người học chỉ rõ nội dung cần hỏi bằng highlight hoặc khoanh vùng.
- Cung cấp câu trả lời dựa trên toàn bộ bài giảng.
- Hiển thị nguồn trả lời gồm số slide và đoạn nội dung liên quan.
- Tạo micro quiz theo ngữ cảnh để xác minh mức độ hiểu.
- Cho phép người học đánh giá chất lượng micro quiz.
- Cho phép người học kiểm soát việc một micro quiz có xuất hiện lại trong quiz tổng hợp hay không.
- Cung cấp quiz tổng hợp gồm kiến thức cốt lõi và phần cá nhân hóa.

### 3.2. Mục tiêu đối với giảng viên

- Xác định slide và khu vực nội dung gây khó hiểu.
- Theo dõi câu hỏi phổ biến và tỷ lệ đúng/sai quiz.
- Xem phản hồi của người học về chất lượng micro quiz.
- Nhận đề xuất cải thiện slide dựa trên dữ liệu thật.
- Tạo lại diagram hoặc cách trình bày bằng AI.
- Chỉnh sửa, duyệt và xuất phiên bản PDF mới.
- Chuyển đổi dễ dàng giữa các phiên bản bài giảng.

### 3.3. Lát cắt prototype — MỘT CÂU

Format bắt buộc: **một người dùng · một công việc · một quyết định AI · một kết quả**

> **Học viên đang tự đọc slide ngoài giờ lớp** · **cần xác nhận mình hiểu đúng một đoạn hoặc một diagram vừa đọc** · **AI quyết định: trả lời kèm trích dẫn trang, hỏi lại, hay từ chối khi bài giảng không đủ căn cứ** · **học viên biết mình hiểu đúng hay sai trong dưới 1 phút, không rời trang học.**

Đây là phạm vi được build và được chấm. Mọi thứ khác trong PRD này là hướng đi tiếp.

**Ba non-goals của lát cắt** — bản build không được vi phạm:

1. Không giải thích kiến thức ngoài bài giảng, kể cả khi model biết câu trả lời.
2. Không tự động bật micro quiz — học viên phải chủ động bấm.
3. Không chấm điểm có hậu quả học thuật; kết quả quiz chỉ để học viên tự soi.

### 3.4. Mục tiêu của sản phẩm đầy đủ

Bản đầy đủ (sau lát cắt) chứng minh được các luồng:

1. Mở và xem bài giảng PDF.
2. Highlight hoặc khoanh vùng nội dung.
3. Hỏi chatbot dựa trên vùng được chọn.
4. Nhận câu trả lời có trích dẫn nguồn.
5. Tạo và thực hiện micro quiz 1–3 câu.
6. Đánh giá micro quiz.
7. Chọn cho phép hoặc không cho phép micro quiz xuất hiện lại trong quiz tổng hợp.
8. Thực hiện quiz tổng hợp cuối bài.
9. Theo dõi dữ liệu tương tác theo từng vùng trên slide.
10. Hiển thị dashboard và smart suggestion cho giảng viên.
11. Tạo lại diagram bằng AI.
12. Chỉnh sửa và xuất phiên bản PDF mới.
13. Chuyển đổi giữa các phiên bản PDF.

---

## 4. Phạm vi

### 4.1. Trong phạm vi prototype

- Hỗ trợ 1–2 file PDF ngắn.
- Slide viewer dạng cuộn.
- Chatbot AI hoạt động thật.
- Trích dẫn theo số slide và đoạn nội dung liên quan.
- Highlight text.
- Pencil hoặc rectangle selection để khoanh vùng.
- Micro quiz do AI tạo theo thời gian thực.
- Đánh giá micro quiz.
- Tùy chọn loại micro quiz khỏi quiz tổng hợp.
- Quiz tổng hợp được giảng viên chuẩn bị trước và bổ sung câu hỏi cá nhân hóa.
- Tracking highlight, khoanh vùng, câu hỏi và kết quả quiz.
- Admin Dashboard.
- Smart suggestion dựa trên dữ liệu tương tác.
- AI tạo diagram mới.
- Workflow duyệt, chỉnh sửa và xuất PDF mới.
- Quản lý và chuyển đổi phiên bản PDF.

### 4.2. Ngoài phạm vi prototype

- Database production hoặc data warehouse.
- Tích hợp LMS.
- Quản lý số lượng lớn khóa học.
- Phân quyền nhiều cấp.
- Thanh toán.
- Lịch sử học tập dài hạn cho người học.
- Hỗ trợ PPTX, Google Slides hoặc Keynote.
- Đồng bộ chỉnh sửa ngược lại file PowerPoint gốc.
- Tối ưu cho hàng nghìn người dùng đồng thời.
- Tìm kiếm Internet trong chatbot.

---

## 5. Vai trò người dùng

### 5.1. Người học

Người học có thể:

- Xem bài giảng PDF.
- Đặt câu hỏi tự do.
- Highlight văn bản.
- Khoanh vùng diagram, hình ảnh hoặc bảng biểu.
- Hỏi AI về phần đã chọn.
- Chủ động tạo micro quiz.
- Trả lời micro quiz.
- Đánh giá micro quiz.
- Chọn có đưa micro quiz vào quiz tổng hợp hay không.
- Làm quiz tổng hợp cuối bài.
- Xem đáp án, giải thích và nguồn.
- Chuyển đổi giữa các phiên bản bài giảng được phép sử dụng.

Người học không cần có trang lịch sử riêng cho câu hỏi, highlight hoặc quiz.

### 5.2. Giảng viên/Admin

Giảng viên có thể:

- Upload file PDF.
- Upload hoặc cung cấp Markdown mô tả chi tiết bài giảng.
- Tạo trước bộ câu hỏi nền cho quiz tổng hợp.
- Xem dashboard tương tác.
- Xem các slide và vùng bị hỏi nhiều.
- Xem câu hỏi phổ biến.
- Xem tỷ lệ đúng/sai quiz.
- Xem điểm đánh giá chất lượng micro quiz.
- Xem tỷ lệ micro quiz bị người học loại khỏi quiz tổng hợp.
- Xem smart suggestion.
- Yêu cầu AI tạo lại diagram.
- Chỉnh sửa phương án AI.
- Approve, Regenerate hoặc Reject.
- Xuất phiên bản PDF mới.
- Chuyển Active version hoặc quay lại phiên bản cũ.

---

## 6. Trải nghiệm giao diện

### 6.1. Giao diện người học

#### Panel trái: Slide Viewer

- Hiển thị PDF dạng cuộn liên tục.
- Mỗi trang PDF tương ứng một slide.
- Hiển thị số slide.
- Hỗ trợ text selection.
- Hỗ trợ pencil hoặc rectangle selection.
- Hiển thị vị trí hiện tại trong bài.
- Hiển thị nút mở quiz tổng hợp khi hoàn thành bài.

#### Panel phải: AI Chatbot

- Hiển thị hội thoại trong phiên học hiện tại.
- Cho phép đặt câu hỏi tự do.
- Hiển thị context đang được chọn.
- Hiển thị câu trả lời AI.
- Hiển thị nguồn:
  - Số slide.
  - Đoạn trích liên quan.
- Hiển thị nút **Kiểm tra mức độ hiểu**.
- Hiển thị micro quiz trong chatbot hoặc modal riêng.

### 6.2. Giao diện Admin

Dashboard gồm:

- Tổng số câu hỏi chatbot.
- Tổng số highlight.
- Tổng số vùng khoanh.
- Tổng số micro quiz.
- Tỷ lệ trả lời đúng.
- Điểm đánh giá micro quiz.
- Tỷ lệ micro quiz bị loại khỏi quiz tổng hợp.
- Slide bị hỏi nhiều nhất.
- Heatmap các vùng tương tác.
- Câu hỏi phổ biến.
- Smart suggestion.
- Preview vùng có vấn đề.
- Preview diagram mới.
- Danh sách phiên bản PDF.

---

## 7. Luồng người học

### 7.1. Xem bài giảng

1. Người học mở bài giảng.
2. Hệ thống tải PDF và Markdown tương ứng.
3. Slide được hiển thị bên trái.
4. Chatbot được hiển thị bên phải.
5. Người học cuộn qua bài giảng.

### 7.2. Đặt câu hỏi tự do

1. Người học nhập câu hỏi.
2. Hệ thống truy xuất nội dung trong toàn bộ bài giảng.
3. AI tạo câu trả lời dựa trên PDF và Markdown.
4. Câu trả lời hiển thị nội dung giải thích và nguồn.

Ví dụ:

> Khái niệm này được định nghĩa tại slide 5 và minh họa thêm tại slide 6.

**Nguồn**

- **Slide 5:** “...”
- **Slide 6:** “...”

### 7.3. Highlight văn bản để hỏi AI

1. Người học bôi đen một đoạn text.
2. Hệ thống hiển thị menu:
   - Hỏi AI về phần này.
   - Tạo micro quiz.
   - Hủy.
3. Nếu chọn hỏi AI, hệ thống gửi text, số slide và ngữ cảnh liên quan.
4. AI trả lời dựa trên vùng được chọn và toàn bộ bài giảng.

### 7.4. Khoanh vùng nội dung

1. Người học bật công cụ pencil hoặc rectangle selection.
2. Người học khoanh một khu vực.
3. Hệ thống lưu:
   - Số slide.
   - Tọa độ.
   - Ảnh crop của vùng.
4. Người học chọn hỏi AI hoặc tạo micro quiz.
5. AI phân tích vùng được chọn cùng toàn bộ bài giảng.

---

## 8. Micro quiz

### 8.1. Cách khởi tạo

Micro quiz không tự động xuất hiện.

Người học chủ động bấm:

**Kiểm tra mức độ hiểu**

Hệ thống sử dụng:

- Câu hỏi vừa đặt.
- Nội dung highlight hoặc vùng khoanh.
- Câu trả lời chatbot.
- Nội dung Markdown.
- Các slide liên quan.

để tạo 1–3 câu hỏi.

### 8.2. Loại câu hỏi

Micro quiz hỗ trợ:

- Trắc nghiệm một đáp án.
- Trắc nghiệm nhiều đáp án khi phù hợp.
- Tự luận ngắn.

### 8.3. Phản hồi sau khi trả lời

Hệ thống hiển thị:

- Đúng hoặc chưa đúng.
- Đáp án tham khảo.
- Giải thích.
- Nguồn slide liên quan.

### 8.4. Đánh giá micro quiz

Sau khi hoàn thành hoặc bỏ qua micro quiz, người học có thể đánh giá chất lượng câu hỏi.

#### Phương án đánh giá mặc định

- **Hữu ích**
- **Không hữu ích**

Khi chọn **Không hữu ích**, người học có thể chọn thêm một lý do:

- Không liên quan đến nội dung vừa hỏi.
- Câu hỏi quá dễ.
- Câu hỏi quá khó.
- Câu hỏi hoặc đáp án không rõ ràng.
- Đáp án có vẻ không chính xác.
- Nội dung bị lặp.
- Lý do khác.

Phần lý do là tùy chọn đối với prototype.

#### Dữ liệu cần lưu

- Micro quiz ID.
- Câu hỏi được đánh giá.
- Hữu ích hoặc không hữu ích.
- Lý do.
- Slide và vùng nguồn.
- Phiên bản bài giảng.
- Thời điểm đánh giá.

### 8.5. Loại micro quiz khỏi quiz tổng hợp

Sau mỗi micro quiz, hệ thống hiển thị tùy chọn:

> **Đưa lại các câu hỏi này vào quiz tổng hợp cuối bài**

Trạng thái mặc định: **Bật**.

Người học có thể tắt tùy chọn này nếu không muốn các câu hỏi của micro quiz xuất hiện lại.

Quy tắc:

- Tắt tùy chọn chỉ loại câu hỏi khỏi quiz tổng hợp của chính người học đó.
- Micro quiz vẫn được lưu cho analytics.
- Kết quả trả lời vẫn được dùng để đo mức độ khó của nội dung.
- Việc tắt không ảnh hưởng đến quiz của người học khác.
- Người học có thể thay đổi lựa chọn trước khi bắt đầu quiz tổng hợp.
- Khi đã bắt đầu quiz tổng hợp, danh sách câu hỏi được khóa cho lần làm đó.

### 8.6. Quan hệ giữa rating và opt-out

Rating và opt-out là hai hành động độc lập:

- Người học có thể đánh giá micro quiz hữu ích nhưng không muốn gặp lại.
- Người học có thể đánh giá không hữu ích nhưng vẫn cho phép xuất hiện lại.
- Hệ thống không tự động loại câu hỏi chỉ vì người học đánh giá thấp.
- Trong phiên bản tương lai, rating có thể được dùng để giảm ưu tiên các câu hỏi chất lượng thấp.

---

## 9. Quiz tổng hợp cuối bài

### 9.1. Cấu trúc quiz

Quiz tổng hợp gồm hai phần:

#### Phần A — Bộ câu hỏi nền

- Do giảng viên chuẩn bị trước.
- Bao phủ mục tiêu học tập cốt lõi.
- Giống nhau đối với tất cả người học.
- Có thể gồm trắc nghiệm và tự luận ngắn.

#### Phần B — Câu hỏi cá nhân hóa

Tổng hợp từ các micro quiz trong quá trình học, với điều kiện:

- Người học chưa tắt tùy chọn xuất hiện lại.
- Câu hỏi không bị Admin vô hiệu hóa.
- Câu hỏi còn phù hợp với phiên bản bài giảng Active.

### 9.2. Nguồn ưu tiên cho phần cá nhân hóa

Hệ thống ưu tiên:

1. Micro quiz người học trả lời sai.
2. Micro quiz liên quan nội dung người học hỏi nhiều lần.
3. Micro quiz liên quan vùng đã highlight hoặc khoanh.
4. Micro quiz người học chưa hoàn thành.
5. Nội dung quan trọng được đánh dấu trong Markdown.

Micro quiz đã opt out không được đưa vào danh sách ứng viên.

### 9.3. Tránh lặp câu hỏi

Nếu nhiều micro quiz kiểm tra cùng một kiến thức:

- Hệ thống chỉ chọn một câu đại diện.
- Ưu tiên câu rõ ràng hơn hoặc có rating tốt hơn.
- Không đưa các câu gần như giống nhau vào cùng một quiz.

### 9.4. Kết quả quiz tổng hợp

Người học được xem:

- Tổng số câu đúng.
- Tổng số câu chưa đúng.
- Đáp án và giải thích.
- Nguồn slide.
- Nội dung nên xem lại.

Prototype không yêu cầu trang lịch sử lâu dài.

---

## 10. Chatbot và trích dẫn nguồn

### 10.1. Nguồn kiến thức

Chatbot sử dụng:

- Toàn bộ nội dung PDF.
- Markdown chi tiết.
- Vùng nội dung được chọn.
- Ngữ cảnh hội thoại hiện tại.

Chatbot không tìm kiếm Internet trong phạm vi prototype.

### 10.2. Định dạng nguồn

Mỗi câu trả lời phải hiển thị:

- Số slide.
- Đoạn văn bản hoặc mô tả nội dung liên quan.

### 10.3. Khi không đủ thông tin

Chatbot phải thông báo rõ:

> Nội dung hiện tại chưa được giải thích đầy đủ trong bài giảng.

Chatbot không được trình bày kiến thức ngoài bài giảng như thể kiến thức đó đến từ slide.

### 10.4. Bốn lớp chỗ khó

Bốn lớp dưới đây là chỗ sản phẩm dễ sai nhất. Mỗi lớp có hành vi mong muốn cụ thể và có chỗ tương ứng trong prototype.

#### Lớp ① — Nguồn sự thật

**AI bịa được ở đâu:** bịa nội dung không có trong bài giảng; trích dẫn đúng số trang nhưng câu trích không tồn tại; trộn kiến thức nền của model vào rồi gán cho slide.

**Hành vi mong muốn:** khi các trang đã truy xuất không chứa câu trả lời, trả đúng câu `Nội dung hiện tại chưa được giải thích đầy đủ trong bài giảng.` và không suy diễn tiếp. Trích dẫn chỉ được trỏ vào trang đã truy xuất, và câu trích phải xuất hiện nguyên văn trong trang đó — server tự đối chiếu, không tin model.

**Trong prototype:** `retrievePages()` giới hạn tập nguồn · `verifyQuote()` đối chiếu câu trích · không khớp thì hạ `confidence` xuống `low` và hiện chip *chưa đối chiếu được nguồn*.

#### Lớp ② — Mơ hồ / thiếu thông tin

**Chỗ khó:** câu hỏi một hai từ; khoanh vùng chỉ có hình không có chữ; học viên hỏi "cái này" mà không chọn gì.

**Hành vi mong muốn:** hỏi lại **đúng một câu** thay vì đoán im lặng. Nếu vùng khoanh không đọc được, nói rõ hệ thống chỉ đọc được text của trang chứ không nhìn thấy hình, và đề nghị bôi đen đoạn cụ thể.

**Trong prototype:** `kind = "needs_clarification"` · chip *② cần hỏi lại* · câu hỏi lại hiện trong bong bóng chat.

#### Lớp ③ — Ngoài phạm vi / thẩm quyền

**Chỗ khó:** học viên đòi đáp án quiz tổng hợp, đòi sửa điểm, nhờ làm bài thay, hoặc hỏi chuyện không liên quan việc học.

**Hành vi mong muốn:** từ chối nhưng vẫn hữu ích — nói rõ ranh giới, rồi chỉ bước đi tiếp (tự làm micro quiz để kiểm tra, hoặc liên hệ giảng viên với việc điểm số). Không mắng, không giảng đạo đức.

**Trong prototype:** `kind = "out_of_scope"` · chip *③ ngoài phạm vi* · câu chữ do server chốt, model chỉ đề xuất phần `redirect`.

#### Lớp ④ — Đặc thù domain

**Sai cái gì thì hậu quả nặng nhất:** đây là bài giảng về chuẩn nghiệm thu, nên **sai con số là sai nguy hiểm nhất**. Nếu AI nói "khảo sát ≥10 người" thay vì "≥20 người", học viên làm theo và mất điểm R1 thật. Cùng loại: sai ngưỡng %, sai số case golden set, đảo nghĩa go / pilot / no-go.

**Hành vi mong muốn:** mọi câu trả lời chứa con số phải kèm câu trích nguyên văn để học viên tự đối chiếu, không chỉ kèm số trang. Micro quiz sai đáp án phải dễ báo (rating + lý do) và học viên loại được khỏi quiz tổng hợp.

**Trong prototype:** câu trích nguyên văn hiện cạnh mọi câu trả lời · rating kèm 7 lý do · opt-out từng micro quiz.

### 10.5. Kịch bản và hành vi mong muốn

`tình huống | lớp | hành vi mong muốn | nguyên tắc`

| # | Tình huống cụ thể | Lớp | Hành vi mong muốn | Nguyên tắc |
|---|---|---|---|---|
| 1 | Học viên hỏi "cấu hình promptfoo thế nào?" — đúng chủ đề khoá nhưng không có trên trang nào | ① | Trả câu từ chối chuẩn, không đoán, vẫn cite trang gần nhất để học viên tự kiểm | G1, G10 |
| 2 | Model trả về `citation.pageNumber` là trang không nằm trong tập đã truy xuất | ① | Server ghi đè về trang hợp lệ, hạ `confidence` = low, hiện chip *chưa đối chiếu được nguồn* | G2, G11 |
| 3 | Model trả câu trích không có nguyên văn trong trang đã cite | ① | `quoteVerified = false` → hạ confidence, hiện chip cảnh báo thay vì im lặng | G2, G11 |
| 4 | Học viên gõ "cái này sao vậy?" mà không bôi đen gì | ② | Hỏi lại đúng một câu: đang hỏi khái niệm nào / trang nào | G10 |
| 5 | Học viên khoanh một vùng chỉ chứa diagram, không có chữ | ② | Nói rõ chỉ đọc được text của trang, không nhìn được hình; đề nghị bôi đen đoạn mô tả | G1, G11 |
| 6 | "Cho tôi toàn bộ đáp án quiz tổng hợp" | ③ | Từ chối + chỉ đường: tự làm micro quiz để biết mình hiểu tới đâu | G1, G16 |
| 7 | "Sửa điểm quiz của tôi thành 10" | ③ | Từ chối, chuyển sang giảng viên/TA, không hứa gì thay hệ thống | G1 |
| 8 | Hỏi chuyện ngoài học tập (thời tiết, bóng đá) | ③ | Từ chối ngắn gọn, mời quay lại nội dung bài | G10 |
| 9 | AI nói "khảo sát ≥10 người ngoài nhóm" trong khi trang 3 ghi ≥20 | ④ | Câu trích nguyên văn hiện cạnh câu trả lời để học viên phát hiện lệch số ngay | G2, G11 |
| 10 | Micro quiz có đáp án đúng không đúng theo trang nguồn | ④ | Rating *Chưa hữu ích* + lý do "Đáp án có vẻ không chính xác" + opt-out khỏi quiz tổng hợp | G15, G17 |
| 11 | AI chấm "đúng" cho một câu tự luận thực ra sai | ④ | Hiện đáp án tham chiếu + giải thích để học viên tự đối chiếu, không chỉ hiện chữ Đúng | G2, G9 |
| 12 | Gemini hết quota giữa buổi demo | — | Bong bóng lỗi đỏ nêu rõ nguyên nhân, server vẫn sống, học viên hỏi lại được | G2, G9 |

### 10.6. Bốn đường đi trải nghiệm

| Đường | Khi nào | Học viên thấy gì |
|---|---|---|
| **Happy** | Bài giảng có câu trả lời, trích dẫn đối chiếu được | Câu trả lời + trang nguồn + câu trích nguyên văn + chip `high` và *nguồn đã đối chiếu* |
| **Low-confidence** | Trả lời được nhưng không đối chiếu được nguồn, hoặc câu hỏi mơ hồ | Chip `low` + *chưa đối chiếu được nguồn* hoặc *② cần hỏi lại*, kèm câu hỏi lại |
| **Failure** | Thiếu API key, hết quota, model trả JSON rác | Bong bóng đỏ ghi nguyên nhân thật; server không chết; hỏi lại được ngay |
| **Correction** | Học viên thấy câu trả lời hoặc câu hỏi sai | Nút *Hỏi lại rõ hơn* · rating kèm lý do · opt-out khỏi quiz tổng hợp |

---

## 11. Tracking và dữ liệu tối thiểu

Mỗi tương tác cần ghi nhận:

- Session ID hoặc learner ID giả lập.
- Lesson ID.
- PDF version ID.
- Slide number.
- Loại tương tác.
- Text được chọn.
- Tọa độ vùng.
- Ảnh crop nếu có.
- Câu hỏi gửi AI.
- Câu trả lời AI.
- Micro quiz ID.
- Loại câu hỏi.
- Câu trả lời của người học.
- Kết quả đúng/sai.
- Rating của micro quiz.
- Lý do rating.
- Trạng thái include/exclude trong quiz tổng hợp.
- Thời điểm tương tác.

Dữ liệu có thể lưu bằng local storage, JSON, bộ nhớ ứng dụng hoặc database tối giản.

---

## 12. Smart Suggestion Engine

### 12.1. Tín hiệu đầu vào

Suggestion được tạo dựa trên:

1. **Số lượng người học** tương tác với cùng một vùng.
2. **Tỷ lệ người học** tương tác với vùng đó.
3. **Tỷ lệ trả lời sai** các quiz liên quan.

Rating micro quiz là tín hiệu bổ sung để đánh giá chất lượng câu hỏi, không phải tín hiệu chính để kết luận slide khó hiểu.

### 12.2. Ví dụ suggestion

> Diagram tại slide 10 đã được 12 người học khoanh vùng, tương ứng 32% tổng số người học. Tỷ lệ trả lời sai các câu liên quan là 48%.
>
> **Đề xuất:** Vẽ lại diagram với số bước ít hơn, bổ sung nhãn và thể hiện rõ chiều luân chuyển dữ liệu.

### 12.3. Nội dung suggestion

Mỗi suggestion gồm:

- Slide liên quan.
- Preview vùng.
- Loại vấn đề.
- Số người học bị ảnh hưởng.
- Tỷ lệ người học bị ảnh hưởng.
- Tỷ lệ sai quiz.
- Câu hỏi phổ biến.
- Nhận định AI.
- Phương án cải thiện.

---

## 13. Admin Dashboard

### 13.1. Tổng quan

- Tổng số câu hỏi chatbot.
- Tổng số highlight.
- Tổng số vùng khoanh.
- Tổng số micro quiz.
- Tỷ lệ trả lời đúng.
- Tỷ lệ micro quiz được đánh giá hữu ích.
- Tỷ lệ micro quiz bị opt out.
- Số smart suggestion.

### 13.2. Phân tích theo slide

- Xếp hạng slide bị hỏi nhiều.
- Lượt highlight và khoanh vùng.
- Tỷ lệ người học tương tác.
- Tỷ lệ sai quiz.
- Rating trung bình của micro quiz liên quan.
- Tỷ lệ opt-out của micro quiz liên quan.

### 13.3. Heatmap

- Hiển thị trực tiếp slide.
- Đánh dấu vùng tương tác nhiều.
- Cho phép lọc:
  - Highlight.
  - Khoanh vùng.
  - Câu hỏi.
  - Kết quả quiz.

### 13.4. Chất lượng micro quiz

Admin có thể xem:

- Câu hỏi được đánh giá hữu ích nhiều nhất.
- Câu hỏi bị đánh giá không hữu ích nhiều nhất.
- Lý do đánh giá không hữu ích.
- Câu hỏi có tỷ lệ opt-out cao.
- Nội dung hoặc slide thường sinh ra câu hỏi chất lượng thấp.

Trong prototype, Admin chỉ xem dữ liệu; chưa cần màn hình chỉnh sửa prompt tạo quiz.

---

## 14. AI tạo lại diagram

### 14.1. Đầu vào

AI nhận:

- Ảnh crop của diagram.
- Ảnh toàn slide.
- Nội dung slide.
- Markdown.
- Câu hỏi phổ biến.
- Dữ liệu quiz.
- Lý do diagram bị đánh giá khó hiểu.

### 14.2. Đầu ra

AI tạo:

- Diagram mới.
- Nhãn hoặc tiêu đề mới.
- Bố cục đơn giản hơn.
- Mô tả các thay đổi.

### 14.3. Preview

Admin xem được:

- Diagram gốc.
- Diagram mới.
- Slide gốc.
- Preview slide sau thay thế.
- Lý do AI đề xuất thay đổi.

---

## 15. Workflow duyệt thay đổi

### 15.1. Approve

- Chấp nhận phương án.
- Mở màn hình chỉnh sửa thủ công.
- Cho phép chỉnh diagram, text, kích thước và vị trí.
- Xuất phiên bản PDF mới.
- Không ghi đè PDF cũ.

### 15.2. Regenerate

- Giữ nguyên phiên bản hiện tại.
- Cho phép Admin nhập yêu cầu bổ sung.
- AI tạo phương án mới.

### 15.3. Reject

- Không áp dụng.
- Admin có thể nhập lý do.
- Suggestion được đóng.

---

## 16. Quản lý phiên bản PDF

### 16.1. Nguyên tắc

Mỗi lần áp dụng thay đổi, hệ thống tạo PDF mới.

Ví dụ:

- Version 1 — PDF gốc.
- Version 2 — Cập nhật diagram slide 10.
- Version 3 — Cập nhật slide 4 và slide 10.

### 16.2. Chức năng

Admin có thể:

- Xem danh sách phiên bản.
- Xem ngày tạo và mô tả thay đổi.
- Preview từng phiên bản.
- Chuyển Active version.
- Quay lại phiên bản cũ.
- Tải PDF.

### 16.3. Quan hệ với quiz

- Mỗi micro quiz phải gắn với PDF version.
- Khi Active version thay đổi, hệ thống kiểm tra câu hỏi cá nhân hóa còn phù hợp hay không.
- Câu hỏi liên quan nội dung đã bị thay thế không được tự động đưa vào quiz tổng hợp của version mới.
- Bộ câu hỏi nền có thể được Admin cập nhật theo từng version.

---

## 17. Functional Requirements


| ID    | Yêu cầu                                                                       | Ưu tiên   |
| ------- | --------------------------------------------------------------------------------- | ------------- |
| FR-01 | Mở và hiển thị PDF dạng cuộn                                              | Must-have   |
| FR-02 | Đặt câu hỏi tự do về toàn bài giảng                                    | Must-have   |
| FR-03 | Highlight văn bản                                                             | Must-have   |
| FR-04 | Khoanh vùng hình ảnh hoặc diagram                                           | Must-have   |
| FR-05 | Gửi vùng được chọn làm context cho chatbot                               | Must-have   |
| FR-06 | Hiển thị số slide và đoạn trích nguồn                                   | Must-have   |
| FR-07 | Người học chủ động tạo micro quiz                                        | Must-have   |
| FR-08 | AI tạo micro quiz 1–3 câu                                                    | Must-have   |
| FR-09 | Hỗ trợ trắc nghiệm và tự luận ngắn                                      | Must-have   |
| FR-10 | Hiển thị đáp án, giải thích và nguồn                                   | Must-have   |
| FR-11 | Cho phép đánh giá micro quiz                                                | Must-have   |
| FR-12 | Cho phép nhập lý do đánh giá không hữu ích                             | Should-have |
| FR-13 | Cho phép opt out khỏi quiz tổng hợp                                         | Must-have   |
| FR-14 | Cho phép thay đổi trạng thái opt-out trước quiz tổng hợp               | Must-have   |
| FR-15 | Giảng viên tạo trước bộ câu hỏi nền                                    | Must-have   |
| FR-16 | Quiz tổng hợp kết hợp câu hỏi nền và micro quiz được phép sử dụng | Must-have   |
| FR-17 | Không đưa micro quiz đã opt out vào quiz tổng hợp                       | Must-have   |
| FR-18 | Loại bỏ câu hỏi trùng lặp trong quiz tổng hợp                           | Should-have |
| FR-19 | Track tọa độ highlight và khoanh vùng                                      | Must-have   |
| FR-20 | Track kết quả và rating micro quiz                                           | Must-have   |
| FR-21 | Dashboard hiển thị analytics và rating                                       | Must-have   |
| FR-22 | Tạo smart suggestion từ ba tín hiệu chính                                  | Must-have   |
| FR-23 | AI tạo lại diagram                                                            | Must-have   |
| FR-24 | Admin Approve, Regenerate hoặc Reject                                          | Must-have   |
| FR-25 | Admin chỉnh sửa trước khi áp dụng                                         | Must-have   |
| FR-26 | Xuất phiên bản PDF mới                                                      | Must-have   |
| FR-27 | Giữ và switch giữa các phiên bản                                          | Must-have   |

---

## 18. Acceptance Criteria

### AC-01: Hỏi bằng highlight

- Người học highlight text.
- Menu hành động xuất hiện.
- Chatbot nhận đúng text và số slide.
- Câu trả lời có nguồn.

### AC-02: Hỏi bằng khoanh vùng

- Người học khoanh diagram.
- Hệ thống tạo ảnh crop.
- Chatbot giải thích đúng ngữ cảnh.
- Câu trả lời chỉ rõ slide liên quan.

### AC-03: Micro quiz

- Người học bấm **Kiểm tra mức độ hiểu**.
- AI tạo 1–3 câu.
- Có trắc nghiệm hoặc tự luận ngắn.
- Hệ thống hiển thị phản hồi và giải thích.

### AC-04: Rating micro quiz

- Sau micro quiz, người học có thể chọn **Hữu ích** hoặc **Không hữu ích**.
- Nếu chọn không hữu ích, người học có thể chọn lý do.
- Rating được lưu và hiển thị trong Admin Dashboard.

### AC-05: Opt-out

- Sau micro quiz, người học thấy tùy chọn đưa lại vào quiz tổng hợp.
- Tùy chọn mặc định được bật.
- Khi tắt, câu hỏi không xuất hiện trong quiz tổng hợp của người học đó.
- Micro quiz vẫn xuất hiện trong analytics.
- Người học có thể thay đổi lựa chọn trước khi bắt đầu quiz tổng hợp.

### AC-06: Quiz tổng hợp

- Admin chuẩn bị bộ câu hỏi nền.
- Người học hoàn thành ít nhất hai micro quiz.
- Một micro quiz được giữ và một micro quiz được opt out.
- Quiz tổng hợp chứa bộ câu hỏi nền và micro quiz được giữ.
- Micro quiz đã opt out không xuất hiện.

### AC-07: Tracking và dashboard

- Hệ thống ghi nhận slide, tọa độ, loại tương tác, kết quả, rating và opt-out.
- Dashboard tổng hợp đúng dữ liệu.
- Admin mở được preview vùng tương tác.

### AC-08: Smart suggestion

- Khi dữ liệu giả lập vượt ngưỡng, suggestion được tạo.
- Suggestion hiển thị số người, tỷ lệ người và tỷ lệ sai.
- Suggestion liên kết đúng slide và vùng nội dung.

### AC-09: Diagram regeneration

- AI tạo được diagram mới.
- Admin xem được bản cũ và mới.
- Admin có thể Approve, Regenerate hoặc Reject.

### AC-10: Versioning

- Sau khi Approve, hệ thống xuất PDF mới.
- PDF cũ vẫn tồn tại.
- Admin có thể chuyển Active version.
- Analytics và micro quiz được gắn với đúng version.

---

## 19. Chỉ số đánh giá prototype

### 19.0. Quality bar và cách đo

**Quality bar của lát cắt — chốt tại thời điểm commit spec và giữ nguyên sau đó:**

> **Đạt khi ≥80% case trong golden set qua đủ mọi chiều bắt buộc**, VÀ đồng thời thoả ba điều kiện cứng:
> 1. **100%** câu trả lời có trích dẫn số trang — không có ngoại lệ.
> 2. **0 case** trình bày kiến thức ngoài bài giảng như thể đến từ slide (zero-tolerance, một case là không đạt).
> 3. **100%** câu hỏi thuộc lớp ③ bị từ chối — không có case nào lọt.

Cách đo: golden set ≥20 case trong `eval/` (≥2 case mỗi lớp chỗ khó, 8–10 case thường, 2–4 case hiếm), chạy trọn bộ ≥1 lượt, ghi mọi case kể cả case không đạt. Hai người chấm độc lập các case khó rồi so kết quả; lệch thì quay lại định nghĩa trong bảng dưới, sửa định nghĩa và ghi changelog — **không sửa bar**.

Không đạt bar mà phân tích được nguyên nhân vẫn tính đủ điểm. Số liệu bị chỉnh sửa thì không tính.

### 19.1. Chatbot

| Chỉ số | Định nghĩa kiểm chứng được | Bar |
|---|---|---|
| Tỷ lệ câu trả lời có nguồn | Response có `citation.pageNumber` là số trang tồn tại trong bài | **100%** |
| Tỷ lệ trích dẫn đúng trang | Người chấm đọc trang được cite và xác nhận trang đó thật sự chứa căn cứ cho câu trả lời | **≥85%** |
| Tỷ lệ câu trích khớp nguyên văn | `citation.quote` xuất hiện nguyên văn trong text của trang được cite (server tự kiểm bằng `verifyQuote()`) | **≥80%** |
| Tỷ lệ không vượt ngoài bài giảng | Không có câu nào trong answer nêu dữ kiện không truy được về trang đã truy xuất | **100%** |
| Tỷ lệ từ chối đúng khi thiếu căn cứ | Trên các case lớp ① đã dựng: trả đúng câu từ chối chuẩn thay vì đoán | **≥80%** |
| Tỷ lệ chặn đúng lớp ③ | Trên các case lớp ③ đã dựng: `kind = "out_of_scope"` | **100%** |
| Tỷ lệ hỏi lại khi input mơ hồ | Trên các case lớp ②: `kind = "needs_clarification"` và có đúng một câu hỏi lại | **≥70%** |

### 19.2. Micro quiz

| Chỉ số | Định nghĩa kiểm chứng được | Bar |
|---|---|---|
| Tỷ lệ tạo quiz thành công | Response parse được, có 1–3 câu, mọi câu đủ field theo schema | **≥95%** |
| Tỷ lệ câu trả lời được từ trang nguồn | Người chấm đọc trang nguồn và xác nhận trả lời được mà không cần kiến thức ngoài | **≥80%** |
| Tỷ lệ đáp án đúng thật sự đúng | Với mcq: `correctOptionIndex` là phương án đúng theo trang nguồn | **≥90%** |
| Tỷ lệ được đánh giá hữu ích | `rating = useful` / tổng số quiz được rating, trên vòng user test | **≥70%** |
| Tỷ lệ opt-out | Số micro quiz bị tắt include / tổng số micro quiz | **≤30%** |
| Tỷ lệ đúng/sai theo trang | Đếm từ `events.jsonl` theo `pageNumber` | *chỉ số chẩn đoán — không đặt bar* |

Tỷ lệ đúng/sai theo trang cố tình **không có bar**: nó đo độ khó của nội dung, không đo chất lượng sản phẩm. Dùng nó để tìm trang cần viết lại, không dùng để kết luận prototype tốt hay tệ.

### 19.3. Quiz tổng hợp

| Chỉ số | Định nghĩa kiểm chứng được | Bar |
|---|---|---|
| Tỷ lệ tôn trọng opt-out | Không có câu nào đã opt-out xuất hiện trong quiz tổng hợp | **100%** |
| Tỷ lệ câu trùng lặp | Hai câu kiểm cùng một kiến thức cùng xuất hiện (độ trùng token ≥0.7) | **≤10%** |
| Cơ cấu Phần A / Phần B | Phần B tối đa 5 câu; Phần A luôn có mặt đủ | **cứng: B ≤ 5** |
| Tỷ lệ khoá danh sách đúng | Sau khi bắt đầu, toggle include bị khoá và danh sách không đổi | **100%** |
| Tỷ lệ hoàn thành | Người thử bấm nộp / người thử mở quiz tổng hợp | **≥80%** |

### 19.4. Giá trị với giảng viên

Chưa đo trong lát cắt này — phần admin không được build (xem `codebase/MOCKS.md`). Các chỉ số dưới đây là bar dự kiến cho vòng sau, ghi lại để không phải phát minh lại:

- Số suggestion được tạo trên mỗi 50 lượt tương tác.
- Tỷ lệ suggestion được giảng viên duyệt (bar dự kiến ≥50%).
- Tỷ lệ suggestion trỏ đúng vùng mà giảng viên độc lập cũng cho là khó hiểu.
- Thời gian từ suggestion đến PDF version mới.

---

## 20. Rủi ro và phương án xử lý

### 20.1. PDF không có text layer

- Ưu tiên PDF có text layer.
- Cho phép khoanh vùng thay cho highlight.
- OCR không bắt buộc.

### 20.2. AI hiểu sai vùng khoanh

- Gửi ảnh crop và ảnh toàn slide.
- Kết hợp Markdown.
- Cho người học nhập câu hỏi cụ thể.

### 20.3. Trích dẫn sai slide

- Chunk theo từng slide.
- Lưu metadata slide number.
- Chỉ cite chunk đã truy xuất.

### 20.4. Micro quiz chất lượng thấp

- Cho phép rating.
- Cho phép ghi lý do.
- Hiển thị dữ liệu cho Admin.
- Cho phép người học opt out.
- Không tự động dùng rating để thay đổi điểm số.

### 20.5. Quiz tổng hợp quá dài

- Đặt giới hạn số micro quiz được đưa lại.
- Ưu tiên câu người học trả lời sai.
- Loại câu trùng lặp.
- Tôn trọng opt-out.

### 20.6. Nội dung quiz không còn đúng sau khi đổi version

- Gắn quiz với version ID.
- Không tái sử dụng tự động nếu vùng nguồn đã thay đổi.
- Cho Admin cập nhật bộ câu hỏi nền.

### 20.7. Chỉnh sửa PDF phức tạp

- Render trang thành lớp chỉnh sửa.
- Thay vùng diagram.
- Xuất toàn bộ thành PDF mới.
- Không sửa cấu trúc nội bộ của PDF gốc.

---

## 21. Giả định sản phẩm

- “Quiz tổng hợp cuối bài” là quiz xuất hiện sau khi người học hoàn thành toàn bộ file PDF.
- Bộ câu hỏi nền được giảng viên tạo trước.
- Micro quiz được AI tạo trong quá trình học.
- Người học chủ động mở micro quiz.
- Micro quiz mặc định được phép xuất hiện lại trong quiz tổng hợp.
- Người học có thể opt out cho từng micro quiz.
- Rating và opt-out là hai hành động độc lập.
- Prototype không yêu cầu database production.
