# Reflection cá nhân - Nguyễn Trọng Toàn - Nhóm B6-1

- **Họ và tên:** Nguyễn Trọng Toàn
- **Mã học viên:** 2A202601493
- **Nhóm:** B6-1
- **Vai trò chính:** Product spec, learner flow, demo script và validation

## 1. Phần việc tôi phụ trách

Trong hackathon này, tôi không chỉ tham gia ở phần code, mà tập trung nhiều vào việc biến ý tưởng "học trên slide có AI hỗ trợ" thành một lát cắt sản phẩm rõ ràng, có thể demo và có thể giải thích được theo rubric. Phần tôi đóng góp chính nằm ở ba nhóm việc: làm rõ vấn đề người học, chốt luồng trải nghiệm học viên, và giúp nhóm đối chiếu prototype với spec trước khi nộp.

Cụ thể, tôi tham gia vào các phần sau:

- Đọc PRD và đề bài để xác định lát cắt một câu: học viên đang tự đọc slide, cần xác nhận mình hiểu đúng một đoạn nội dung, AI quyết định trả lời có trích dẫn, hỏi lại, hoặc từ chối khi không đủ căn cứ.
- Viết và chỉnh sửa các phần trong `spec.md`, đặc biệt là problem statement, non-goals, các lớp lỗi khó, bốn đường trải nghiệm và phần kiểm thử.
- Góp ý cho learner flow: học viên chọn nội dung trên slide, đặt câu hỏi, nhận câu trả lời có citation, bấm tạo micro quiz, làm quiz và đánh giá mức độ hữu ích.
- Kiểm tra xem những gì trong `codebase/` có khớp với tài liệu hay không, tránh tình trạng spec viết quá rộng nhưng demo chỉ làm được một phần nhỏ.
- Hỗ trợ viết `codebase/MOCKS.md` theo hướng nói rõ phần nào thật, phần nào mock, không nói quá trong demo.
- Chuẩn bị kịch bản demo để người xem thấy đủ bốn đường: happy path, câu hỏi mơ hồ, câu hỏi thiếu căn cứ và câu hỏi ngoài phạm vi.

Điểm tôi có ý giữ trong quá trình làm là sản phẩm phải nhỏ nhưng thật. Thay vì mô tả một hệ thống AI rất lớn, nhóm chọn chứng minh một chuỗi có thể bấm được: học viên hỏi trên slide, AI trả lời có nguồn, học viên tự kiểm tra bằng micro quiz, sau đó dữ liệu tương tác có thể đi sang màn admin để giảng viên nhìn thấy trang nào đang gây khó.

## 2. Một quyết định tôi thấy quan trọng

Quyết định quan trọng nhất tôi tham gia là giữ cho AI bị giới hạn trong bài giảng, không để model tự do bổ sung kiến thức bên ngoài. Lúc đầu, nếu chỉ nghĩ theo trải nghiệm người dùng, có thể muốn AI trả lời càng đầy đủ càng tốt. Nhưng với bài học và slide, câu trả lời nghe hay nhưng không có nguồn lại rất nguy hiểm, vì học viên có thể tưởng đó là kiến thức nằm trong bài.

Vì vậy trong spec và demo, tôi nhấn mạnh ba hành vi:

- Nếu có đủ căn cứ, AI phải trả lời ngắn gọn và kèm số trang.
- Nếu câu hỏi mơ hồ, AI phải hỏi lại một câu làm rõ thay vì đoán.
- Nếu bài giảng không có nội dung đó, AI phải nói không đủ căn cứ thay vì bịa thêm.

Phần này có thể đối chiếu với `USER_SIDE_IMPLEMENTATION.md` và logic trong `codebase/server.js`: server không chỉ nhận JSON từ model, mà còn kiểm tra lại citation, quote và chọn câu chữ cuối cùng cho các đường từ chối. Với tôi, đây là phần làm cho prototype có tính "AI product" hơn là chỉ gắn chatbot vào slide.

## 3. AI đã hỗ trợ tôi như thế nào

Tôi dùng AI như một công cụ để tăng tốc việc viết và rà soát, nhưng không giao hết quyết định cho AI. Những việc AI hỗ trợ tốt gồm:

- Gợi ý cách viết problem statement ngắn hơn và rõ hơn theo format job-to-be-done.
- Đề xuất thêm các case lỗi cho bốn lớp khó, ví dụ câu hỏi quá mơ hồ, câu hỏi đòi AI tìm Internet, hoặc câu hỏi về nội dung không có trong slide.
- Hỗ trợ chuyển ý tưởng thành các mục trong spec, như non-goals, acceptance criteria và demo path.
- Giúp so sánh giữa tài liệu và code để phát hiện chỗ nào đang nói quá so với prototype thật.

Tuy nhiên, AI không thay thế được phần phán đoán của người làm sản phẩm. Có lúc AI đề xuất thêm nhiều tính năng nghe hay như diagram regeneration, version PDF hay heatmap tọa độ, nhưng nếu đưa hết vào lát cắt thì nhóm sẽ bị loãng và khó demo trong thời gian ngắn. Việc tôi phải làm là kéo sản phẩm về đúng phạm vi: một người dùng, một công việc, một quyết định AI, một kết quả.

## 4. Một case fail tôi học được

Case tôi học được nhiều nhất là việc giữa PRD, spec và prototype có lúc không khớp nhau về chức năng "khoanh vùng". Trong PRD ban đầu, người học có thể khoanh vùng diagram và admin có thể xem heatmap theo vùng. Nhưng khi đi vào build thật, việc khoanh vùng ảnh và đọc pixel không đơn giản: nếu chỉ gửi tọa độ thì model không nhìn thấy nội dung, còn nếu xử lý ảnh thật thì vượt quá phạm vi prototype.

Nếu vẫn demo như thể "AI hiểu vùng khoanh" trong khi hệ thống chỉ có tọa độ, đây sẽ là nói quá. Nhóm cuối cùng chốt lại rõ hơn: learner side ưu tiên chọn/highlight text trên PDF, admin side coi bảng xếp hạng theo trang là heatmap cho bản demo hiện tại. Phần giới hạn này được ghi trong `codebase/MOCKS.md` và `ADMIN_SIDE_IMPLEMENTATION.md`.

Bài học của tôi là: một tính năng nghe đúng trên PRD chưa chắc đã đúng với lát cắt demo. Nếu không đủ khả năng chứng minh end-to-end, cần nói rõ nó là mock, là non-goal, hoặc là hướng phát triển tiếp theo. Nói thật về giới hạn của prototype không làm sản phẩm yếu đi, ngược lại giúp người chấm tin hơn vì nhóm hiểu mình đang làm gì.

## 5. Điều tôi sẽ làm khác nếu có thêm thời gian

Nếu có thêm thời gian, tôi sẽ làm ba việc sớm hơn.

Thứ nhất, tôi sẽ viết bảng "phần nào thật, phần nào mock" ngay từ khi bắt đầu build, không đợi đến gần cuối mới tổng hợp. Khi cả nhóm cùng nhìn một bảng giới hạn, mọi người sẽ tránh thêm tính năng vượt scope.

Thứ hai, tôi sẽ gắn mỗi dòng trong spec với một artifact cụ thể trong repo. Ví dụ, nói "AI có citation" thì phải chỉ được endpoint nào xử lý, nói "có eval" thì phải chỉ được file test và kết quả chạy. Cách này giúp spec không bị thành bài viết ý tưởng mà trở thành bản đồ của prototype.

Thứ ba, tôi sẽ chuẩn bị demo script theo dạng checklist sớm hơn: đăng nhập học viên, chọn slide, hỏi một câu đúng, tạo micro quiz, trả lời sai một câu, đánh giá quiz, mở admin xem số liệu, tạo smart suggestion. Nếu demo script được tập sớm, nhóm sẽ phát hiện lỗi trải nghiệm nhanh hơn thay vì chỉ phát hiện khi sắp nộp.

## 6. Kết luận cá nhân

Sau bài này, tôi hiểu rõ hơn rằng làm sản phẩm AI không phải chỉ là gọi API model. Phần khó nằm ở việc chọn đúng phạm vi, đặt ranh giới cho AI, kiểm tra nguồn, và nói thật về những gì hệ thống chưa làm được.

Đóng góp lớn nhất của tôi là giúp nhóm giữ được câu chuyện sản phẩm mạch lạc: vấn đề của học viên là gì, AI ra quyết định ở đâu, kết quả nào chứng minh được, và khi demo thì người xem có thể đối chiếu lại bằng code, spec, mock list và event/metrics thật trong repo.
