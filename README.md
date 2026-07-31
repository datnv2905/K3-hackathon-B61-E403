# VLearn AI Tutor — Nhóm B6-1 · Zone 3

**Hướng A (VLearn) · Tính năng mới.** Học viên bôi đen một đoạn slide khó hiểu hoặc khoanh một
diagram, hỏi AI, nhận giải thích **có trích dẫn số trang đã được server đối chiếu**, rồi làm micro
quiz kiểm tra hiểu. Kèm màn giảng viên tổng hợp trang nào đang gây khó hiểu.

## Thành viên & phân công

| Mã HV | Tên | Phụ trách |
|---|---|---|
| 2A202601313 | Lê Hồng Đức | Spec & Evidence — `spec.md` §1–§6 |
| 2A202601325 | Nguyễn Kim Trung Đức | Prompt & AI logic + Kiểm thử — golden set |
| 2A202601077 | Phong | Code Frontend — slide viewer, bôi đen, panel chatbot; PRD |
| 2A202601155 | Trần Nguyễn Thế Nhật | Code Backend / AI call — lời gọi AI, đối chiếu trích dẫn, màn giảng viên, luồng ảnh, eval |
| 2A202601493 | Toàn | Demo — kịch bản 5 phút, dry run, `demo-slides.pdf` |
| 2A202601969 | Đạt | Validation — vòng user test CP5, feedback log |

Chi tiết từng phần kèm bằng chứng commit: `spec.md` §8.

## Chạy thử

Zero-dependency, **không có bước `npm install`**. Cần Node.js ≥ 18.

```bash
cp .env.example .env      # rồi điền key vào
npm run dev               # Gemini (mặc định)
npm run dev:claude        # Claude (claude-haiku-4-5)
```

Mở `http://localhost:3000`. Hai tài khoản demo in sẵn trên màn đăng nhập:

| Tài khoản | Mật khẩu | Vào đâu |
|---|---|---|
| `admin` | `admin123` | Bảng theo dõi lớp |
| `hocvien` | `hocvien123` | Màn hình học |

> **Mở bằng Chrome.** Safari đời cũ làm vỡ pdf.js — chi tiết trong `codebase/MOCKS.md`.
>
> Đăng nhập là **giả lập**, không phải xác thực thật — xem `codebase/MOCKS.md`.

## Chạy kiểm thử

```bash
npm run test:all          # cả hai bộ (server phải đang chạy)
npm run test:tutor        # 24 case cho câu trả lời có trích dẫn
npm run test:suggestion   # 11 case cho smart suggestion
```

Kết quả từng lượt lưu nguyên trong `eval/results/`, giữ đủ mọi case kể cả case trượt.

## Cấu trúc bài nộp

| Thư mục | Nội dung | Trạng thái |
|---|---|---|
| `spec.md` | AI Spec | §1, §2 chờ dữ liệu khảo sát thật |
| `codebase/` | Prototype — phần nào mock ghi rõ trong `MOCKS.md` | xong |
| `eval/` | 2 golden set + kết quả các lượt chạy | xong |
| `validation/` | Feedback log vòng user test | **khung, chưa có dữ liệu** |
| `reflection/` | Mỗi người 1 file | **chưa có** |
| `demo-slides.pdf` | Slide 6 trang | **chưa có** |

---

# Đề bài gốc của ban tổ chức

**SPEC → Prototype → Demo.** Đây không phải cuộc thi code — đây là cuộc thi **tư duy sản phẩm AI**.

- Thời lượng: **1,5 ngày** (một ngày build + một buổi demo)
- Nhóm: **4-5 người** · zone tối đa 5 nhóm · thi theo lớp

## Bắt đầu từ đâu?

1. Đọc **`01-de-bai.md`** để chọn hướng và hiểu tiêu chí.
2. Mở **`02-guide.md`** — hướng dẫn từng giai đoạn, đứng ở đâu đọc mục đó.
3. Viết spec theo **`03-template-ai-spec.md`** — deliverable trung tâm của cả sự kiện.
4. Đọc **`04-rubric.md`** ngay từ đầu — biết trước bài được chấm theo tiêu chí nào.

| File / thư mục | Nội dung |
|---|---|
| `01-de-bai.md` | Đề bài 3 hướng · 5 tiêu chí nghiệm thu · ràng buộc chung |
| `02-guide.md` | Hướng dẫn 5 giai đoạn: khám phá → spec → build → đo & validate → demo |
| `03-template-ai-spec.md` | Template AI Spec (nộp 23:59 ngày 1) |
| `04-rubric.md` | Rubric 100 điểm (25 nộp checkpoint + 75 chấm bài) + checklist xác minh 6 mốc |
| `data/` | Dữ liệu thật đã ẩn danh: chatlog VLearn tutor + 6 transcript bài giảng bản sạch — dùng để tìm bằng chứng và xây golden set |
| `tham-khao/` | JTBD Playbook (PDF) + worksheet JTBD đầy đủ — đọc khi muốn đào sâu |

## Lịch — 6 mốc

| Mốc | Khoá 3 | Khoá 4 |
|---|---|---|
| Khai mạc + phát đề | 09:00 ngày 1 | 14:00 ngày 1 |
| CP1 · Chốt Canvas | 10:00 ngày 1 | 15:00 ngày 1 |
| CP2 · Show được thứ bấm được | 12:00 ngày 1 | 17:00 ngày 1 |
| CP3 · AI chạy thật + đo lượt đầu | 16:00 ngày 1 | 10:30 ngày 2 |
| CP4 · Chốt tiến độ — spec nộp hạn cứng **23:59 ngày 1** | 17:30 ngày 1 | 12:00 ngày 2 |
| CP5 · Xác minh + validation + dry run | 09:00 ngày 2 | 14:00 ngày 2 |
| CP6 · Demo | 10:00 ngày 2 | 15:00 ngày 2 |

Mỗi mốc cần show gì và được xác minh thế nào: xem bảng trong `04-rubric.md`.

## Chạy prototype (`codebase/`)

Zero-dependency Node.js — không có bước cài đặt package nào (không `npm install`, không venv). Các thư viện cần thiết (pdf.js) đã được vendor thẳng vào repo dưới `codebase/public/vendor/` và `codebase/server-vendor/`.

1. Cần **Node.js ≥ 18**.
2. Copy `.env.example` → `.env`, điền `GEMINI_API_KEY` (key thật, không commit `.env`).
3. Chạy: `node codebase/server.js` (hoặc `npm run dev` / `npm start` — cùng một lệnh).
4. Mở `http://localhost:3000`. Nếu cổng 3000 đang bận, server tự tìm cổng trống tiếp theo và in ra URL thật trong log.

Không có `GEMINI_API_KEY` thì server vẫn chạy được (xem slide, chọn nội dung), nhưng các lời gọi AI (`/api/tutor/answer`, `/api/tutor/quiz`, `/api/tutor/grade`) trả về lỗi 503 rõ ràng thay vì giả lập.

## Nộp bài

Một repo nhóm, cấu trúc như sau. Spec chốt lúc 23:59 ngày 1; bản hoàn chỉnh trước CP6.

```
repo/
├── README.md          ← thành viên (mã HV + tên) + phân công có tên từng phần
├── spec.md            ← AI Spec theo 03-template-ai-spec.md
├── demo-slides.pdf    ← slide 6 trang theo 02-guide.md §5.1
├── codebase/          ← prototype (ghi rõ phần nào mock)
├── eval/              ← golden set + bảng kết quả các lượt chạy
├── validation/        ← feedback log từ vòng user test
└── reflection/        ← mỗi người 1 file
```

## Chấm điểm

Tổng **100 điểm = 25 điểm nộp checkpoint + 75 điểm chấm bài nộp**. Chi tiết từng ý điểm: `04-rubric.md`.

**25 điểm nộp — mỗi checkpoint 5 điểm (CP1-CP5):** nộp đúng hạn → 5 điểm · nộp muộn → 0 điểm cho mốc đó. Mỗi thành viên nộp riêng, cả nhóm dùng chung một link repo.

**75 điểm chấm — trên artifact trong repo, mỗi con điểm trỏ về một file:**

| Khối | Điểm | Chấm trên file nào |
|---|---|---|
| R1 · Bằng chứng & impact | 15 | `spec.md` §1-§2 + log khảo sát/mining |
| R2 · Lát cắt & thiết kế | 15 | `spec.md` §4 |
| R3 · Chỗ khó & kịch bản rủi ro | 11 | `spec.md` §5-§6 |
| R4 · Kiểm thử | 15 | `spec.md` §7 + `eval/` |
| R5 · Prototype chạy được | 8 | `codebase/` + demo |
| R6 · Validation với user | 8 | `validation/` |
| R7 · Quy trình & repo | 3 | cấu trúc repo |

Ba điều nên biết trước khi làm:

- Điểm dựa trên **chuỗi quyết định và bằng chứng**, không dựa trên mức độ hoành tráng của sản phẩm.
- Kết quả đo **ghi nhận trung thực** — kể cả khi không đạt mục tiêu nhóm tự đặt — vẫn được tính đủ điểm. Số liệu bị chỉnh sửa hoặc che giấu sẽ không được tính.
- Reflection cá nhân chấm riêng theo rubric của khoá. Điểm vòng demo, chấm chéo trong zone và thưởng thêm (nếu có) theo thể lệ công bố lúc khai mạc.

## Luật chung

1. Prototype có 3 mức **Sketch / Mock / Working** — mức nào cũng bắt buộc **≥1 lời gọi AI chạy thật**.
2. **Vibe-coding rule:** dùng AI để build thoải mái, nhưng không giải thích được phần có tên mình thì phần đó 0 điểm (kiểm tra tại CP5).
3. **Quality bar** chốt tại spec.md 23:59 ngày 1 và giữ nguyên sau đó.
4. Chỉ dùng dữ liệu trong `data/` hoặc dữ liệu giả tự sinh — không dùng dữ liệu thật của người thật. Không commit API key.
5. Tuân thủ **quy định bảo mật dữ liệu** bên dưới — đây là điều kiện để được cấp data.

## Bảo mật dữ liệu được cung cấp

Dữ liệu trong `data/` là dữ liệu thật của khoá học (đã ẩn danh), cấp riêng cho hackathon này. Khi nhận data, nhóm cam kết:

1. **Chỉ dùng trong phạm vi hackathon** — cho việc tìm bằng chứng, xây golden set và build prototype. Không dùng cho mục đích khác.
2. **Không chia sẻ ra ngoài khoá học** — không đăng lên mạng xã hội, không gửi cho người ngoài, không đưa vào bất kỳ dataset hay repo công khai nào.
3. **Không commit data pack vào repo nộp bài** — repo nhóm chỉ chứa trích dẫn ngắn để minh hoạ (vài dòng); golden set trích từ data ghi rõ mã đoạn/mã hội thoại thay vì dán nguyên văn dài.
4. **Cẩn trọng khi đưa data vào công cụ ngoài** — chỉ đưa phần tối thiểu cần cho việc đang làm; lưu ý API/công cụ free tier có thể dùng dữ liệu để huấn luyện (xem `02-guide.md` §3.4).
5. **Không cố suy ngược danh tính** từ dữ liệu đã ẩn danh ([học viên], mã U/C/T/M).
6. Sau sự kiện, **xoá các bản sao data pack** khỏi máy cá nhân và các công cụ đã upload nếu ban tổ chức yêu cầu.

Vi phạm được xử lý theo quy định của khoá và có thể ảnh hưởng trực tiếp đến điểm của nhóm.
