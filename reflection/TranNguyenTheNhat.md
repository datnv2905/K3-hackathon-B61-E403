# Personal Reflection — Trần Nguyễn Thế Nhật · Nhóm B6-1

## Mã học viên: 2A202601155


## 1. Vai trò và phần việc tôi trực tiếp thực hiện

Trong hackathon, tôi đảm nhận vai trò **xây dựng và tích hợp prototype**, tập trung vào việc biến ý tưởng “học trên slide có AI hỗ trợ” thành một luồng có thể chạy và demo được cho cả học viên lẫn giảng viên. Phần việc của tôi không chỉ nằm ở giao diện mà còn đi qua server, lời gọi AI, dữ liệu sự kiện và bộ đo chất lượng.

Các phần tôi trực tiếp thực hiện có thể đối chiếu trong lịch sử Git:

- Xây dựng **admin dashboard** để giảng viên xem số câu hỏi, lượt highlight, kết quả micro quiz và mức độ hữu ích theo từng trang; đồng thời thêm luồng tạo **smart suggestion** bằng AI từ dữ liệu tổng hợp thật (`e76d2ee`).
- Thêm trang **đăng nhập mock và điều hướng theo hai vai trò** học viên/giảng viên để khi demo không phải đổi URL thủ công (`0931fbe`).
- Sửa cách mở song song hai màn hình để phiên học viên và phiên admin không ghi đè nhau; bổ sung cơ chế refresh phù hợp cho tình huống demo hai phía cùng lúc (`31159ac`).
- Sửa chỉ số `affectedLearners`: hệ thống phải đếm số phiên học viên khác nhau đã tương tác, không được dùng số lượt hỏi thay cho số người (`f15c114`).
- Xây dựng bộ **golden set chạy trực tiếp lên endpoint thật** của AI tutor, lưu kết quả từng lượt chạy và viết lại phần đánh giá trong `spec.md` dựa trên số đo thực tế (`80de5f6`).
- Bổ sung luồng **khoanh vùng hình ảnh trên slide**: phía trình duyệt lấy vùng pixel người học chọn, gửi kèm câu hỏi lên server để model có thể đọc đúng diagram thay vì chỉ nhận tọa độ (`e5b1827`).
- Viết bộ eval riêng cho **smart suggestion**, kiểm tra AI có bám vào số liệu dashboard hay tự tạo thêm nhận định không có căn cứ (`19f39ec`).
- Hoàn thiện trải nghiệm demo: chỉnh màu sắc theo VLearn, thu gọn hai panel, bổ sung trạng thái quiz, màn hình kết quả và các chi tiết của dashboard (`ac00b19`, `96d230c`, `cc613e4`).
- Cập nhật `spec.md`, tài liệu triển khai, khung validation/evidence và README để phần mô tả khớp với những gì code thực sự làm (`2e3da4f`, `4dd3216`).

Phần tôi thấy quan trọng nhất là nối được một chuỗi hoàn chỉnh: **tương tác của học viên → event được ghi lại → server tổng hợp theo bài và trang → giảng viên xem dữ liệu → AI tạo đề xuất có bằng chứng**. Nếu chỉ làm giao diện dashboard bằng số liệu mẫu, sản phẩm có thể đẹp khi trình bày nhưng chưa chứng minh được quyết định AI dựa trên hành vi học thật.

## 2. Một quyết định kỹ thuật tôi phải tự chịu trách nhiệm

Ở phía admin, tôi không gửi số liệu do trình duyệt tự tổng hợp thẳng cho AI. Khi giảng viên yêu cầu tạo smart suggestion, server đọc lại event log và tự tính các chỉ số của trang đó trước khi gọi model. Cách làm này giúp hạn chế hai vấn đề:

1. Client có thể gửi thiếu hoặc gửi sai dữ liệu.
2. AI có thể viết một nhận định nghe hợp lý nhưng không khớp với số liệu giảng viên đang nhìn thấy.

Kết quả trả về luôn đi kèm các con số làm bằng chứng như tỷ lệ trả lời sai, số học viên bị ảnh hưởng và các câu hỏi phổ biến. Nhờ vậy, giảng viên có thể kiểm tra đề xuất thay vì phải tin AI như một “hộp đen”.

Tôi cũng thêm ngưỡng tín hiệu tối thiểu. Khi một trang có quá ít lượt hỏi hoặc highlight, server từ chối tạo suggestion thay vì để model cố viết ra một kết luận từ dữ liệu mỏng. Đây là một giới hạn có chủ ý: trong sản phẩm giáo dục, một đề xuất chưa đủ căn cứ có thể khiến giảng viên sửa nhầm nội dung vốn không có vấn đề.

## 3. AI đã hỗ trợ tôi như thế nào

### Công cụ AI đã sử dụng


Tôi sử dụng AI chủ yếu để tăng tốc ba nhóm việc:

- **Tạo bản nháp triển khai:** AI hỗ trợ dựng cấu trúc route, hàm tổng hợp event và các thành phần giao diện. Tôi không dùng nguyên đầu ra ngay mà đối chiếu lại với data model và chạy thử trên luồng thật.
- **Mở rộng test case:** từ các case chính, AI gợi ý thêm tình huống biên như thiếu context, trích dẫn không khớp, trang có ít tín hiệu hoặc suggestion nhắc đến con số không có trong input.
- **Rà soát sự nhất quán giữa code và spec:** AI giúp tìm các đoạn tài liệu còn mô tả theo phiên bản cũ, sau đó tôi kiểm tra lại bằng endpoint, file kết quả eval và hành vi trên giao diện trước khi sửa.

AI làm tốt ở phần sinh cấu trúc lặp lại và đưa ra nhiều phương án nhanh. Tuy nhiên, AI không tự biết đâu là con số đúng về mặt sản phẩm. Ví dụ, một đoạn code có thể chạy bình thường nhưng vẫn dùng `questionCount` như số người học. Chỉ khi hiểu ý nghĩa của metric và thử dữ liệu có một người hỏi nhiều lần, tôi mới phát hiện kết quả đó sai. Vì vậy, phần tôi phải tự làm là xác định contract, kiểm tra ý nghĩa từng trường, chạy eval nhiều lượt và quyết định kết quả nào đủ tin cậy để đưa vào demo.

## 4. Case fail của nhóm mà tôi học được nhiều nhất

### `affectedRate` từng hiển thị 250%

Trong phiên bản đầu của dashboard, `affectedLearners` được gán bằng `questionCount`. Sau đó hệ thống lấy giá trị này chia cho tổng số học viên để hiển thị tỷ lệ bị ảnh hưởng. Nếu một học viên hỏi nhiều câu trên cùng một trang, mỗi câu lại bị tính như một người khác. Vì vậy, với hai phiên học viên nhưng có năm câu hỏi, dashboard có thể hiển thị tỷ lệ 250%.

Lỗi này nguy hiểm hơn một lỗi trình bày thông thường. Smart suggestion được giới thiệu là nhận định AI “có căn cứ”, nhưng ngay bên dưới nhận định lại là một con số không thể xảy ra. Khi bằng chứng sai, người dùng không chỉ nghi ngờ một metric mà sẽ mất niềm tin vào cả đề xuất của AI.

Tôi sửa bằng cách lưu tập hợp `sessionId` riêng cho từng trang, chỉ đếm số phiên khác nhau đã hỏi hoặc highlight, rồi giới hạn tỷ lệ trong khoảng hợp lệ. Phần mô tả trong `ADMIN_SIDE_IMPLEMENTATION.md` cũng được cập nhật để phân biệt rõ:

- `questionCount` là số lượt hỏi;
- `affectedLearners` là số phiên học viên khác nhau;
- `totalLearners` là số phiên, chỉ là biến đại diện gần đúng vì prototype chưa có tài khoản thật.

Bài học của tôi là: **đúng kiểu dữ liệu chưa có nghĩa là đúng ý nghĩa dữ liệu**. Cả hai trường đều là số nguyên và code vẫn chạy, nên test cú pháp hoặc nhìn giao diện một lần sẽ không bắt được lỗi. Với các metric làm căn cứ cho AI, cần có invariant nghiệp vụ, ví dụ “tỷ lệ người học không thể lớn hơn 100%”, và phải thử case một người tạo nhiều event.

## 5. Điều tôi sẽ làm khác nếu thực hiện lại

- Tôi sẽ định nghĩa metric và invariant trước khi viết dashboard, đặc biệt phân biệt rõ **người**, **phiên** và **lượt tương tác**.
- Tôi sẽ viết test cho hàm tổng hợp event ngay từ đầu với các case: một người hỏi nhiều lần, nhiều người cùng hỏi một trang, event thiếu `lessonId`, và bài không có dữ liệu.
- Tôi sẽ xây runner eval sớm hơn, ngay khi endpoint AI đầu tiên chạy được. Khi có phép đo sớm, mỗi thay đổi prompt hoặc normalize response đều có thể so sánh với baseline thay vì chỉ thử thủ công.
- Tôi sẽ dành một vòng riêng để kiểm tra luồng demo nhiều tab. Một tính năng hoạt động khi mở riêng chưa chắc hoạt động khi màn hình học viên và admin chạy đồng thời.
- Tôi sẽ tách rõ trong tài liệu phần nào là working, phần nào là mock và phần nào chỉ mới có trong PRD ngay từ đầu, tránh phải cập nhật lại nhiều chỗ khi phạm vi thay đổi.


