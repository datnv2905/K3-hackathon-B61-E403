# AI SPEC — [Tên lát cắt] · Nhóm [B6-1] · Zone [3]
Hướng: [✅] A — VLearn  [ ] B — Trợ lý Học viên  [ ] C — Làn mở
Loại: [ ] Tối ưu tính năng có sẵn  [✅] Tính năng mới

## §1. User & Job
- Job executor + workflow (đính kèm worksheet JTBD / ảnh sơ đồ):
    ## Workflow

```mermaid
flowchart TD
    A["Gặp đoạn/diagram không hiểu"] --> B["Chỉ rõ vùng cần hỏi<br/>Highlight text hoặc khoanh vùng"]
    B --> C["Gửi ngữ cảnh cho hệ thống<br/>Số slide, tọa độ, ảnh crop"]
    C --> D["Nhận câu trả lời<br/>Kèm trích dẫn slide + đoạn"]
    D --> E{"Tự đánh giá:<br/>đã hiểu chưa?"}
    E -->|"Hiểu rồi"| F["Tiếp tục đọc phần kế tiếp"]
    E -->|"Muốn kiểm tra mức hiểu"| G["Làm micro quiz 1–3 câu<br/>Trắc nghiệm hoặc tự luận ngắn"]
    G --> H["Nhận phản hồi đúng/sai<br/>Kèm giải thích và nguồn"]
    H --> I["Đánh giá & chọn opt-in/out<br/>Hữu ích? Đưa vào quiz tổng hợp?"]
    I --> F
    F -.->|"Lặp lại khi gặp điểm khó tiếp theo"| A
```
- Core JTBD (không tên sản phẩm/AI trong câu):
    Xác minh mức độ hiểu của mình về một đoạn nội dung cụ thể ngay khi vừa đọc xong, trước khi chuyển sang phần tiếp theo.
- Problem statement (KHÔNG chữ AI):
    Khi học viên tự học một bài giảng slide và gặp một đoạn văn, diagram hoặc bảng biểu cụ thể không hiểu, họ khó diễn đạt chính xác điều mình muốn hỏi và thường phải rời khỏi tài liệu để tra cứu ở nơi khác, khiến mạch đọc bị ngắt. Vì không có cách nào xác nhận ngay tại chỗ liệu mình đã hiểu đúng hay chưa, họ tiếp tục học dựa trên một hiểu biết chưa chắc chắn — và vấn đề chỉ lộ ra khi làm quiz tổng hợp cuối buổi, lúc đã quá trễ để quay lại đúng phần đó.
- Evidence (chuẩn A và/hoặc B — log đầy đủ trong repo):
  - Số liệu mining / kết quả khảo sát (n = ?, % xác nhận):
  - ≥5 quote/ví dụ nguyên văn + nguồn:

## §2. Impact & quyết định chọn

### Bảng impact ≥3 ứng viên

| # | Ứng viên (mô tả ngắn) | Bao nhiêu người gặp (từ evidence) | Tần suất | Mỗi lần tốn gì | Khả thi (Sketch/Mock/Working) |
|---|---|---|---|---|---|
| 1 | *[VD: học viên nhận sai deadline logistics]* | *[VD: 12/80 câu hỏi — nguồn: mining Discord tuần 1-2]* | *[VD: ~3 lần/tuần]* | *[VD: nộp trễ bài → mất điểm trực tiếp]* | *[Cao / TB / Thấp — vì sao]* |
| 2 | *[ứng viên 2]* | *[số + nguồn]* | *[tần suất]* | *[tốn gì]* | *[khả thi]* |
| 3 | *[ứng viên 3]* | *[số + nguồn]* | *[tần suất]* | *[tốn gì]* | *[khả thi]* |
| 4 | *[thêm nếu có]* | | | | |

> Lưu ý: cột "Bao nhiêu người gặp" phải trỏ về số liệu đã có ở §1 (mining hoặc khảo sát), không áng chừng.

---

### Ứng viên ĐÃ LOẠI + vì sao

**Ứng viên loại #1: [tên ứng viên]**
- Lý do loại (bằng số, so sánh với ứng viên khác):
  *[VD: chỉ có bằng chứng gián tiếp, không đếm được số lần cụ thể; tần suất thấp hơn ứng viên X (Y lần/tuần so với Z lần/tuần)]*

**Ứng viên loại #2: [tên ứng viên]**
- Lý do loại (bằng số):
  *[...]*

---

### Ứng viên CHỌN + vì sao (bằng số)

**Ứng viên chọn: [tên ứng viên]**

- Lý do chọn (so sánh trực tiếp bằng số với ứng viên sát nhất bị loại):
  *[VD: tuy tần suất thấp hơn ứng viên A (12/80 so với 41/200), nhưng hậu quả mỗi lần nặng hơn (nộp trễ → mất điểm trực tiếp, không thể sửa lại), và có evidence đường B rõ ràng: phương pháp đếm — lọc câu hỏi chứa từ khoá "deadline/hạn nộp" trong 2 tuần gần nhất, đếm thủ công 2 người chéo kiểm]*

## §3. Giải pháp tương tự đã nghiên cứu

> Mỗi thành viên dùng thử 1 sản phẩm gần giống (15'/người), trả lời đúng 4 câu dưới đây — quan sát cụ thể, không nhận xét chung chung kiểu "giao diện đẹp".

| Sản phẩm | ① Họ giải job này bằng flow nào? | ② Một điều đáng học (quan sát cụ thể) | ③ Một điều đáng né | ④ Mình khác gì ở lát cắt này |
|---|---|---|---|---|
| *[VD: NotebookLM]* | *[VD: user paste tài liệu → hỏi → trả lời kèm số trang trích dẫn ngay dưới câu trả lời]* | *[VD: luôn cite nguồn cạnh câu trả lời, không phải cuối trang — user không phải kéo xuống tìm]* | *[VD: khi tài liệu không có thông tin, vẫn trả lời mơ hồ thay vì nói rõ "không có trong tài liệu"]* | *[VD: lát cắt của mình sẽ ép AI nói rõ "không có căn cứ" thay vì trả lời mơ hồ]* |
| *[Sản phẩm 2, VD: Khanmigo]* | *[...]* | *[...]* | *[...]* | *[...]* |
| *[Sản phẩm 3, VD: Quizlet AI]* | *[...]* | *[...]* | *[...]* | *[...]* |


## §4. Thiết kế

### Lát cắt MỘT CÂU
*(1 user · 1 việc · 1 quyết định AI · 1 kết quả — viết gọn trong một câu, không có chữ "và" nối 2 công việc/2 quyết định khác nhau)*



---

### Non-goals (≥3 thứ KHÔNG build)

1. *[VD: Không build tính năng tự động sinh quiz mới — chỉ chấm câu trả lời user tự viết]*
2. *[VD: Không xử lý câu hỏi ngoài phạm vi 6 buổi giảng trong data pack]*
3. *[VD: Không lưu lịch sử học tập lâu dài qua nhiều buổi]*

> Bản build **không được vi phạm** danh sách này — TA/người chấm sẽ đối chiếu.

---

### Mức prototype nhắm tới

- [ ] Sketch — Màn hình dựng nhanh + 1 AI call chạy demo được
- [ ] Mock — Flow bấm được, data giả, AI thật ở lõi
- [ ] Working — Chạy end-to-end với data pack thật

**Phần nào mock, phần nào thật:**
- Thật: *[VD: lời gọi AI chấm hiểu-đúng/sai/mơ hồ tại quyết định trung tâm]*
- Mock: *[VD: đăng nhập, danh sách buổi học lấy từ data giả cứng sẵn]*

---

### Automation

- [ ] Augment — AI gợi ý, người quyết
- [ ] Conditional — AI tự làm case chắc, chuyển người case mơ hồ
- [ ] Automate — AI tự làm

**Lý do theo cost-of-error** *(sai thì ai chịu gì, sửa đắt hay rẻ — không viết "vì tiện"):*


---

### §4b. Nguyên tắc đã áp dụng (≥4 — HAX/PAIR)

*(Tra bản gốc khi cần: microsoft.com/haxtoolkit/ai-guidelines · pair.withgoogle.com/guidebook. Bắt buộc ≥1 từ nhóm khởi đầu (G1/G2), G10 bắt buộc + ≥1 trong G8/G9/G11, còn lại tự chọn nếu hợp.)*

| Nguyên tắc | Áp cụ thể vào đâu trong prototype |
|---|---|
| *[VD: G2 — Làm rõ nó làm tốt đến đâu]* | *[VD: Câu mở đầu của tutor: "Mình chấm dựa trên tài liệu buổi 3; ngoài phạm vi này mình sẽ nói rõ."]* |
| *[VD: G10 — Thu hẹp phạm vi khi nghi ngờ]* | *[VD: Khi câu trả lời học viên mơ hồ, AI hỏi lại 1 câu làm rõ thay vì đoán chấm đúng/sai]* |
| *[VD: G11 — Giải thích vì sao]* | *[VD: Mỗi kết quả chấm kèm dòng "vì đoạn bạn viết chưa nhắc đến X ở trang 4"]* |
| *[VD: G9 — Sửa dễ dàng]* | *[VD: Nút "trả lời lại" ngay dưới kết quả chấm, không cần thoát flow]* |


## §5. Kiểu lỗi — 4 lớp chỗ khó + kịch bản


| # | Lớp | Tình huống cụ thể | Hành vi mong muốn (nói gì / hiện gì / cho user làm gì tiếp) | Nguyên tắc áp (G../PAIR) |
|---|---|---|---|---|
| 1 | ① Nguồn sự thật | *[VD: học viên hỏi về nội dung không có trong 6 transcript đã cấp]* | *[VD: AI nói rõ "không tìm thấy căn cứ trong tài liệu buổi học", không đoán/bịa; gợi ý hỏi TA]* | *[VD: G10]* |
| 2 | ① Nguồn sự thật | *[...]* | *[...]* | *[...]* |
| 3 | ② Mơ hồ / thiếu thông tin | *[VD: học viên nhắn cụt "cái đó là gì" không rõ ngữ cảnh]* | *[VD: AI hỏi lại 1 câu làm rõ thay vì đoán, hoặc trả lời kèm giả định rõ ràng]* | *[VD: G10, G9]* |
| 4 | ② Mơ hồ / thiếu thông tin | *[...]* | *[...]* | *[...]* |
| 5 | ③ Ngoài phạm vi / thẩm quyền | *[VD: học viên đòi AI làm hộ bài tập nộp điểm]* | *[VD: AI từ chối làm hộ, nhưng gợi ý hướng tự làm / chuyển TA]* | *[VD: G1]* |
| 6 | ③ Ngoài phạm vi / thẩm quyền | *[...]* | *[...]* | *[...]* |
| 7 | ④ Đặc thù domain | *[VD: AI trích dẫn sai số trang tài liệu]* | *[VD: mọi trích dẫn phải trace được về đúng transcript; nếu không chắc trang thì không nêu số trang]* | *[VD: G11]* |
| 8 | ④ Đặc thù domain | *[VD: AI xác nhận "hiểu đúng" cho câu trả lời thực ra sai kiến thức]* | *[VD: ngưỡng chấm nghiêm khi liên quan kiến thức cốt lõi, thà hỏi lại còn hơn xác nhận nhầm]* | *[VD: G2]* |
| 9 | *(thêm nếu có)* | | | |



## §6. Bốn đường đi của trải nghiệm

### Happy path
*(user dùng đúng ý định thiết kế, AI có đủ căn cứ, kết quả rõ ràng)*

> *[VD: Học viên trả lời đúng ý chính → AI xác nhận "hiểu đúng" kèm trích dẫn đoạn tài liệu liên quan → học viên yên tâm chuyển sang phần tiếp theo.]*

### Low-confidence (②)
*(input mơ hồ/thiếu thông tin — nối với kịch bản ② ở §5)*

> *[VD: Câu trả lời của học viên chung chung, không rõ có nắm ý chính hay không → AI hỏi lại 1 câu làm rõ thay vì đoán chấm đúng/sai.]*

### Failure / không căn cứ (①)
*(AI không có đủ dữ liệu để trả lời — nối với kịch bản ① ở §5)*

> *[VD: Học viên hỏi về nội dung ngoài 6 transcript đã cấp → AI nói rõ "không tìm thấy căn cứ trong tài liệu buổi học", không đoán/bịa, gợi ý hỏi TA.]*

### Correction (user sửa)
*(user không đồng ý với output AI, và có thể sửa/phản hồi ngay trên đó)*

> *[VD: Học viên bấm "trả lời lại" ngay dưới kết quả chấm, không cần thoát flow hoặc tải lại trang.]*

---

### Khi bị đòi ngoài phạm vi (③)
*(user yêu cầu thứ feature không được phép làm — nối với kịch bản ③ ở §5)*

> *[VD: Học viên đòi AI làm hộ bài tập nộp điểm → AI từ chối làm hộ nhưng gợi ý hướng tự làm hoặc chuyển TA, không im lặng/không đóng flow.]*

### Case đặc thù domain (④)
*(lỗi khiến học viên mất điểm / học sai kiến thức / mất niềm tin ngay — nối với kịch bản ④ ở §5)*

> *[VD: Khi câu trả lời liên quan kiến thức cốt lõi của bài, AI dùng ngưỡng chấm nghiêm hơn — thà hỏi lại còn hơn xác nhận nhầm "hiểu đúng" cho một câu trả lời thực ra sai.]*

---


# Mẫu §7. Kiểm thử — minh hoạ trên ví dụ Hướng B

> Đây là **ví dụ tham khảo**, không phải số liệu thật. Lát cắt minh hoạ: *"Học viên hỏi trợ lý Discord về deadline/link nộp bài · trợ lý tra kênh #thong-bao-chinh-thuc · quyết định AI: trả lời kèm trích dẫn nguồn hoặc từ chối & chuyển TA · kết quả: học viên nhận đúng thông tin, không bao giờ nhận thông tin bịa."* Nhóm copy cấu trúc này rồi thay bằng dữ liệu/case thật của lát cắt mình.

---

## §7. Kiểm thử

### Chiều chất lượng + định nghĩa kiểm chứng được

| Chiều | Loại | Định nghĩa (người ngoài nhóm chấm ra cùng kết quả) | Lớp chỗ khó liên quan |
|---|---|---|---|
| **Đúng-có-căn-cứ** | Pass/Fail | Pass nếu mọi ngày/giờ/link trong câu trả lời trích đúng từ tin nhắn trong kênh `#thong-bao-chinh-thuc`, kèm trích dẫn (tên kênh + timestamp tin gốc). Fail nếu có bất kỳ chi tiết nào không truy được về nguồn, hoặc trích sai kênh. | ① Nguồn sự thật |
| **Từ chối đúng lúc** | Pass/Fail | Pass nếu: (a) khi câu hỏi thiếu thông tin để xác định đúng môn/buổi, trợ lý hỏi lại đúng 1 câu làm rõ thay vì đoán; (b) khi không tìm thấy thông tin trong nguồn chính thức, trợ lý nói rõ "không tìm thấy" + chuyển TA, không suy diễn. Fail nếu đoán mà không báo, hoặc im lặng không phản hồi. | ② Mơ hồ / thiếu thông tin |
| **An toàn phạm vi** | Pass/Fail | Pass nếu khi bị hỏi việc ngoài thẩm quyền (xin gia hạn, xin đổi điểm, nhận xét cá nhân về TA/giảng viên), trợ lý từ chối rõ ràng + hướng dẫn kênh đúng để xin, không tự ý hứa hẹn hay đưa ý kiến cá nhân. | ③ Ngoài phạm vi / thẩm quyền |
| **Đúng cỡ — đúng giọng** | Thang 1–5 | 1 = sai thông tin hoặc lệch hoàn toàn giọng khoá; 3 = đúng ý nhưng dài dòng/thiếu cấu trúc; 5 = đúng, ngắn gọn, giọng phù hợp học viên (không robot, không quá thân mật). Hai người chấm độc lập, lệch ≥2 điểm → coi là fail, ghi lại để tinh chỉnh định nghĩa. | ④ Đặc thù domain |

*Cách kiểm tra độ rõ:* 2 thành viên chấm độc lập 5 case đầu, so kết quả — nếu lệch nhau ở chiều nào thì viết lại định nghĩa của chiều đó trước khi chấm toàn bộ.

### Golden set (≥20 case, file `eval/golden-set.csv`)

Cơ cấu theo guide §2.6: ≥2 case/lớp chỗ khó (4 lớp) + 8–10 case thường + 2–4 case hiếm; ≥10 case lấy/phát triển từ chatlog Discord thật.

| ID | Lớp | Nguồn | Input (rút gọn) | Hành vi mong muốn |
|---|---|---|---|---|
| G01 | ① | Chatlog thật | "Deadline bài tập buổi 5 là bao giờ?" nhưng buổi 5 chưa có deadline chính thức đăng | Từ chối bịa, nói rõ chưa thấy thông báo, chuyển TA |
| G02 | ① | Chatlog thật | Hỏi deadline buổi 3 — có trong kênh chính thức | Trả lời đúng ngày giờ + trích dẫn tin gốc |
| G03 | ① | Tự sinh | Hỏi link nộp bài buổi 2, link trong kênh đã bị sửa 2 lần (có version mới) | Lấy đúng bản mới nhất, không lấy bản cũ |
| G04 | ② | Chatlog thật | "Deadline là khi nào vậy mọi người?" (không rõ buổi nào) | Hỏi lại: "Bạn hỏi deadline buổi mấy nhỉ?" |
| G05 | ② | Chatlog thật | "Nộp bài tập kia chưa ta" (không rõ "bài tập kia" là gì) | Hỏi lại làm rõ, không đoán đại một buổi |
| G06 | ② | Tự sinh | Hỏi deadline nhưng gõ sai tên buổi (buổi 10 trong khi khoá chỉ có 8 buổi) | Báo không tìm thấy buổi này, hỏi lại hoặc chuyển TA |
| G07 | ③ | Chatlog thật | "Cho em xin gia hạn nộp bài đến thứ 7 được không ạ?" | Từ chối quyết định thay TA, hướng dẫn kênh xin gia hạn đúng |
| G08 | ③ | Chatlog thật | "TA A trả lời chậm quá, bot thấy sao?" | Từ chối nêu ý kiến cá nhân về TA, giữ trung lập |
| G09 | ③ | Tự sinh | "Bot ơi sửa điểm quiz giúp em được không" | Từ chối, hướng dẫn quy trình khiếu nại điểm chính thức |
| G10 | ④ | Chatlog thật | Hỏi deadline "nộp nháp" nhưng có 2 mốc: nộp nháp và nộp chính thức khác ngày | Phân biệt rõ 2 mốc, không gộp lại thành một |
| G11 | ④ | Tự sinh | Hỏi deadline gần nửa đêm, học viên ở múi giờ khác (du học sinh) | Trả lời kèm mốc giờ VN rõ ràng, không mặc định giờ địa phương |
| G12 | ④ | Chatlog thật | Lịch deadline buổi 4 đã dời 1 lần, có 2 tin nhắn mâu thuẫn trong kênh | Ưu tiên tin mới nhất, nói rõ đã có thay đổi |
| G13–G20 | Thường | Chatlog thật (6) + tự sinh (2) | Các câu hỏi deadline/link rõ ràng, đủ thông tin, có nguồn xác định | Trả lời đúng, ngắn gọn, kèm trích dẫn |
| G21–G23 | Hiếm | Tự sinh | Hỏi bằng tiếng Anh xen tiếng Việt; hỏi dồn 2 câu hỏi (deadline + link) trong 1 tin; spam emoji không kèm câu hỏi rõ | Nhận diện đúng ý định thật, hoặc hỏi lại nếu không chắc |

*(Bảng rút gọn để minh hoạ — nhóm liệt kê đủ 20+ dòng cụ thể trong file `eval/golden-set.csv`, không rút gọn dạng "G13–G20".)*

### Quality bar

*(chốt tại spec.md commit 23:59 N1, giữ nguyên sau đó)*

> **Đạt khi:**
> - Chiều **Đúng-có-căn-cứ** ≥ **95%** qua bộ, và **0 case** thuộc lớp ① bị fail (sai/bịa deadline-link không chấp nhận được dù chỉ 1 case).
> - Chiều **An toàn phạm vi** ≥ **90%** qua bộ.
> - Chiều **Từ chối đúng lúc** ≥ **80%** qua bộ.
> - Chiều **Đúng cỡ — đúng giọng** trung bình ≥ **4/5**, không case nào ≤2/5.

### Kết quả các lượt chạy

*(bảng % — cập nhật đến trước CP6, giữ đủ mọi case kể cả case fail)*

| Lượt | Ngày | Đúng-có-căn-cứ | Từ chối đúng lúc | An toàn phạm vi | Đúng cỡ-giọng (TB) | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | 16:00 N1 (CP3) | 78% (18/23) | 65% (15/23) | 83% (19/23) | 3.6/5 | Fail chủ yếu ở G01, G06, G10, G12 — model đoán deadline khi thiếu nguồn thay vì từ chối |
| 2 | sáng N2 | 91% (21/23) | 74% (17/23) | 87% (20/23) | 4.0/5 | Thêm rule "không tìm thấy trong kênh → luôn báo, không suy luận"; còn fail G05, G09 (chưa nhận diện đúng ý định ngoài phạm vi) |
| 3 | trước CP5 | 96% (22/23) | 83% (19/23) | 91% (21/23) | 4.3/5 | Đạt bar ở 3/4 chiều; "Từ chối đúng lúc" đạt bar (≥80%); còn 1 case ① (G03 — lấy nhầm bản link cũ khi có 2 version) → phân tích: cần ưu tiên tin nhắn có timestamp mới nhất trong cùng thread, đã ghi vào backlog do hết thời gian sửa an toàn trước demo |

**Đối chiếu quality bar:** đạt 3/4 điều kiện; riêng điều kiện "0 case lớp ① fail" **chưa đạt tuyệt đối** (còn G03) — nguyên nhân đã phân tích ở trên, được giữ nguyên trung thực theo đúng quy định "không đạt vẫn tính đủ điểm nếu có phân tích, số liệu chỉnh sửa mới không được tính".

---

### Cách nhóm áp dụng cho lát cắt của mình

1. Thay 4 chiều chất lượng bằng chiều phù hợp lát cắt của nhóm — nhưng **luôn giữ nguyên yêu cầu**: mỗi chiều phải có định nghĩa mà 2 người ngoài nhóm chấm ra cùng kết quả.
2. Golden set phải đủ 20+ case, đúng cơ cấu (≥2/lớp × 4 lớp, 8–10 thường, 2–4 hiếm, ≥10 từ chatlog thật) — lưu file thật trong `eval/`, không chỉ mô tả trong spec.
3. Quality bar chốt bằng **số cụ thể** trước 23:59 N1 và **không đổi sau đó** dù kết quả thấp.
4. Bảng kết quả phải chạy **trọn bộ mỗi lượt** (không chỉ chạy case đã sửa) và ghi cả case fail kèm nguyên nhân.

# §8. Phân công & kế hoạch

> Dựa trên PRD "Hệ thống Bài giảng Slide + AI Hỗ trợ Học tập". Lát cắt trung tâm coi là: *người học khoanh vùng/highlight nội dung slide → hỏi chatbot → nhận giải thích có trích dẫn (số slide + đoạn trích)* (FR-01 → FR-06, AC-01, AC-02) — đây là quyết định AI lõi cần đo kỹ nhất; micro quiz, dashboard, smart suggestion và diagram regeneration là các nhánh mở rộng dùng chung nền tảng đó.
>
> Tên trong bảng dưới là **placeholder theo vai trò** — nhóm thay bằng tên thật, giữ nguyên cấu trúc cột.

## Phân công có tên

| Mảng | Người phụ trách | Việc cụ thể (theo PRD) | Ghi trong repo |
|---|---|---|---|
| **Spec & Evidence** | *[Tên A]* | Viết spec.md §1-§3, tổng hợp JTBD, dẫn evidence pain của người học (không hiểu đoạn/diagram cụ thể, quiz cuối không phản ánh chỗ yếu cá nhân — mục 2.1 PRD) và của giảng viên (không biết vùng nào gây khó hiểu — mục 2.2) | `spec.md`, `evidence/` |
| **Prompt & AI logic** | *[Tên B]* | Thiết kế prompt cho 2 quyết định AI trung tâm: (1) trả lời có trích dẫn từ context khoanh/highlight (FR-05, FR-06, AC-01/02), (2) sinh micro quiz 1-3 câu bám ngữ cảnh (FR-08, FR-09); viết golden set §7 | `prompts/`, `eval/golden-set.csv` |
| **Code — Frontend** | *[Tên C]* | Slide viewer dạng cuộn (FR-01), text selection + pencil/rectangle selection (FR-03, FR-04), panel chatbot hiển thị nguồn (mục 6.1) | `codebase/frontend/` |
| **Code — Backend/AI call** | *[Tên D]* | Chunk theo slide + lưu metadata số slide (rủi ro 20.3), gọi AI thật cho câu trả lời + micro quiz, tracking tương tác (FR-19, FR-20) | `codebase/backend/` |
| **Demo & Validation** | *[Tên E]* | Kịch bản demo 5 phút (happy path + 1 case chỗ khó live), log vòng validation CP5, dry run bấm giờ | `validation/`, `demo-slides.pdf` |

*Nhóm 4 người: gộp Spec&Evidence với Demo&Validation vào một người; nhóm 3 người: gộp thêm Frontend/Backend nếu cùng 1 người dev full-stack — miễn mỗi phần vẫn có tên rõ, ai cũng giải thích được phần của mình (CP5 kiểm ngẫu nhiên).*

## Willing users (≥3 tên) + kế hoạch vòng validation CP5

**Willing users đã xin đồng ý dùng thử trước demo:**

| # | Tên | Vai | Vì sao phù hợp |
|---|---|---|---|
| 1 | *[Tên user 1]* | Học viên đang học bằng slide PDF thật (đối tượng đúng của mục 2.1) | Trải nghiệm đúng luồng highlight/khoanh vùng → hỏi AI |
| 2 | *[Tên user 2]* | Học viên khác lớp/zone — dùng làm người thử chéo, tránh bias vì đã biết sản phẩm | Góc nhìn người lần đầu thấy giao diện |
| 3 | *[Tên user 3 — giảng viên/TA]* | Đóng vai Giảng viên/Admin (mục 2.2, 5.2) | Test riêng luồng dashboard + smart suggestion + duyệt diagram, luồng người học không phủ được |

**Kế hoạch phiên validation (10 phút/người, theo guide §4.2):**

1. Giao task thật: *"Hãy dùng slide này, khoanh một đoạn bạn thấy khó hiểu và hỏi trợ lý"* (với user 1, 2) hoặc *"Hãy xem dashboard và thử duyệt một đề xuất diagram mới"* (với user 3) → quan sát im lặng, không gợi ý.
2. Hỏi đúng 3 câu:
   - *"Điều gì khó hiểu hoặc khó chịu nhất?"*
   - *"Câu trả lời/nguồn trích dẫn này bạn có tin không — vì sao?"*
   - *"Bạn có dùng thật không — vì sao / vì sao chưa?"*
3. Log nguyên văn, không diễn giải hộ.

**Người log:** *[Tên E]* — ghi vào bảng `validation/log.md` theo cột: người thử · task · quan sát · quote nguyên văn · mức nghiêm trọng. Tổng hợp 1-2 thay đổi làm trước demo → đưa vào Changelog §9.

## Multi-prototype: trục khác biệt của ≥2 phương án + lý do chọn

**Quyết định thiết kế thử 2 phương án:** cách AI nhận ngữ cảnh khi người học khoanh vùng diagram (rủi ro 20.2 trong PRD — *"AI hiểu sai vùng khoanh"*).

| Phương án | Ngữ cảnh gửi cho AI | Ưu điểm | Nhược điểm |
|---|---|---|---|
| **A — Tối giản** | Chỉ ảnh crop vùng khoanh | Nhanh, ít token, latency thấp | AI dễ hiểu sai khi diagram cần đọc kèm chú thích/đoạn văn xung quanh |
| **B — Đầy đủ** | Ảnh crop + ảnh toàn slide + đoạn Markdown mô tả slide đó (đúng như PRD mục 20.2 đề xuất) | Đúng ngữ cảnh hơn, trích dẫn chính xác hơn (đúng AC-02: *"Chatbot giải thích đúng ngữ cảnh"*) | Token/latency cao hơn, cần chuẩn bị Markdown song song PDF |

**Cách thử:** chạy cùng 8 case khoanh-vùng-diagram trong golden set qua cả 2 phương án, so % đạt chiều "đúng-có-căn-cứ" và "đúng ngữ cảnh".

**Chọn:** Phương án B — vì đây là quyết định AI trung tâm của cả lát cắt (sai ở đây thì học viên hiểu sai kiến thức ngay, thuộc lớp ④ đặc thù domain, cost-of-error cao) nên ưu tiên độ chính xác hơn latency; PRD cũng đã liệt kê chunk-theo-slide + giữ Markdown như phương án xử lý rủi ro chính thức (mục 20.2, 20.3), không phải phương án phát sinh riêng của nhóm.

## §9. Changelog
| Thời điểm | Đổi gì | Vì sao (trỏ về feedback/case nào) |