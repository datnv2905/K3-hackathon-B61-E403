<!--
PAGE MARKERS — PLACEHOLDER, CHUA DOI CHIEU VOI PDF.

Marker dang <!-- page: N --> duoc chen tu dong theo cau truc heading cua ban OCR,
KHONG phai doc tu pagination that cua Slide/d1-slide-hackathon.pdf.
Tong so marker = 29, trung voi so trang cua PDF, nhung tung ranh gioi CHUA duoc kiem.
Can sua tay truoc khi dung lam nguon trich dan.

Quy tac da dung: ranh gioi = heading muc #, ## hoac ### · block anh dung lien sau block anh khac
· hai dong tieu de slide ma OCR khong xuat thanh heading (goc dong 102 va 145).
-->

<!-- page: 1 -->

AI IN ACTION  Day 1 

# **AI & LLM Foundation** Bạn đang dùng AI mỗi ngày — nhưng thực sự bên trong nó đang làm gì? 

AI IN ACTION  Day 1 

<!-- page: 2 -->

## **Agenda** 

<!-- page: 3 -->

## **Agenda** • Bức tranh AI & các tầng của AI • Lịch sử AI 70 năm • Bên trong LLM: cơ chế vận hành • Từ LLM đến AI Agent • Landscape: model hôm nay & cuộc đua hiện tại • Chọn model & chi phí token • Gọi API lần đầu • Tổng kết — những ý để mang về **AI & LLM Foundation** Từ "nghe AI" đến "gọi AI" trong một ngày 

**AI, ML, Deep Learning, GenAI, LLM — nằm ở đâu trong cùng một hệ?** từ rộng đến hẹp **ARTIFICIAL INTELLIGENCE AI** — chiếc ô lớn nhất: mọi hệ thống có yếu tố “thông minhˮ. **MACHINE LEARNING Machine learning** — học từ dữ liệu thay vì viết **DEEP LEARNING** luật tay. **GENERATIVE AI Deep learning** — mạng nơ-ron nhiều tầng tự học đặc trưng. **LLM** GPT · Claude · Kimi **Generative AI** — sinh nội dung mới: văn bản, ảnh, code. văn bản · ảnh · code **LLM** — model nền chuyên ngôn ngữ, tim của làn sóng hiện nay. nhận diện ảnh · giọng nói lọc spam · gợi ý phim **LLM không phải toàn bộ AI — nhưng nó là tầng** kể cả hệ luật tay, robot… **nền của gần hết trải nghiệm AI bạn dùng hôm nay** 

**Deep learning** — mạng nơ-ron nhiều tầng tự học đặc trưng. 

**LLM** — model nền chuyên ngôn ngữ, tim của làn sóng hiện nay. 

<!-- page: 4 -->

### **Ba nhóm AI chính: phân loại · sinh nội dung · hành động** 

#### **Discriminative AI** 

#### **Agentic AI** 

#### **Generative AI** 

Giỏi **phân loại, dự đoán** : lọc spam, phát **Sinh ra thứ mới** : văn bản, ảnh, code. Nhận **mục tiêu** rồi tự làm nhiều bước: hiện gian lận, nhận diện ảnh. ChatGPT, Claude, Midjourney. lập kế hoạch, dùng công cụ, hành động. Input → một nhãn, một con số Goal → Plan → Action Prompt → nội dung mới LLM là **engine chung** của cả Generative lẫn Agentic — cuối buổi sáng mình sẽ thấy agent khác LLM ở đâu 

Hành trình khóa học: LLM Foundation → Agent → Multi-Agent → Deploy → Evaluate 



<!-- Start of picture text -->
Hién tai<br>2026<br>ChatGPT<br>2022 |<br>CAC CU SOC MUA DONG MUA DONG &<br>(1966-1973) LAN 1 (1974-80) LAN 2 WA<br>&<br>Transformer VY<br>AlexNet 2017<br>2012 |<br>Dartmouth o®% Ky nguyén<br>ee eRe Sup d6 Lisp (3) | Agent2024<br>machine GPT-1 / BERT<br>1987 (7) 2018<br>Hé chuyén gi 5) AlphaGo<br>1) r2) cn ed 1980 2016<br>Lighthill (6)<br>| Bao cao<br>Perceptro 1973 |<br>1969 | 4) Deep<br>o_o Learning<br>2006<br>Duong cong minh hoa mu "d6éng luc/ky vong" qua cdc giai doan — mang tinh KHAI NIEM, khéng phdi sé liéu do lung dinh Iuong.<br>1956 1966 1973 1980 1987 1993 2006 2012 2016 2018 2022 2026<br><!-- End of picture text -->



<!-- page: 5 -->

<!-- Start of picture text -->
Hién tai<br>2026<br>ChatGPT<br>2022 |<br>CAC CU SOC MUA DONG MUA DONG &<br>(1966-1973) LAN 1 (1974-80) LAN 2 WA<br>id<br>Transformer VY<br>AlexNet 2017<br>2012 |<br>Dartmouth o®% Ky nguyén<br>ee eRe Sup d6 Lisp (3) | Agent2024<br>machine GPT-1 / BERT<br>1987 7) 2018<br>980 5) AlphaGo<br>LU @ na 2016<br>Lighthill (6)<br>| Bao cao<br>Perceptro 1973 |<br>1969 | 4 Deep<br>9 Learning<br>2006<br>Duong cong minh hoa muc "d6éng luc/ky vong" qua cdc giai doan — mang tinh KHAI NX, khong phdi sé liéu do luéng dinh Iuong.<br>1956 1966 1973 1980 1987 1993 2006 2012 2016 2018 2022 2026<br><!-- End of picture text -->



<!-- page: 6 -->

<!-- Start of picture text -->
Hién tai<br>2026<br>ChatGPT<br>2022 |<br>CAC CU SOC MUA DONG MUA DONG &<br>(1966-1973) LAN 1 (1974-80) LAN 2 WA<br>&<br>Transformer VY<br>AlexNet 2017<br>2012 |<br>Dartmouth o®% Ky nguyén<br>ee eRe Sup d6 Lisp (3) | Agent2024<br>machine GPT-1 / BERT<br>1987 (7) 2018<br>Hé chuyén gi 5) AlphaGo<br>1) r2) cn ed 1980 2016<br>Lighthill (6)<br>| Bao cao<br>Perceptro 1973 |<br>1969 | 4) Deep<br>o_o Learning<br>2006<br>Duong cong minh hoa mu "d6éng luc/ky vong" qua cdc giai doan — mang tinh KHAI NIEM, khéng phdi sé liéu do lung dinh Iuong.<br>1956 1966 1973 1980 1987 1993 2006 2012 2016 2018 2022 2026<br><!-- End of picture text -->



<!-- page: 7 -->

<!-- Start of picture text -->
a<br>Attention Is All You You Need<br>Ashish Vaswani* Noam Shazeer* Niki Parmar* Jakob Uszkoreit*<br>Google Brain Google Brain Google Research Google Research<br>avaswani@google.com noam@google.com nikip@google.com usz@google.coy<br>Llion Jones* Jones* Aidan N. Gomez* N. Gomez* Gomez* * Lukasz Kaiser* Kaiser*<br>Google Research University of Toronto Toronto Google Brain<br>llion@google.com aidan@cs.toronto.eduillia.polosukhin@gmail.comIllia Polosukhin*illia.polosukhin@gmail.comIllia Polosukhin*Illia Polosukhin* Polosukhin* lukaszkaiser@google.com<br><!-- End of picture text -->



<!-- page: 8 -->

<!-- Start of picture text -->
Attention Is All You You Need Hién tai<br>2026<br>ChatGPT<br>2022 |<br>CAC CU SOC MUA DONG<br>(1966-1973) LAN 1 (1974-80) Ashish Vaswani* Noam Shazeer* Niki Parmar* Jakob Uszkoreit*<br>Google Brain Google Brain Google Research Google Research<br>avaswani@google.com noam@google.com nikip@google.com usz@google.coy &<br>Llion Jones* Jones* Aidan N. Gomez* N. Gomez* Gomez* * Lukasz Kaiser* Kaiser* J<br>Google Research University of Toronto Toronto Google Brain r 1<br>Dartmouth llion@google.com aidan@cs.toronto.eduillia.polosukhin@gmail.comIllia Polosukhin*illia.polosukhin@gmail.comIllia Polosukhin*Illia Polosukhin* Polosukhin* lukaszkaiser@google.com 9”’ WA Ky= nguyén-<br>Kan<br>Worksho (3) | Agent<br>Sup d6 Lisp 2024<br>Tae P<br>machine GPT-1 / BERT<br>1987 (7) 2018<br>Hé chuyén gi |<br>2 0 9 (5) AlphaGo<br>@ 2016<br>2) Bao cao<br>| Lighthill (6)<br>Perceptro 1973 |<br>1969 | ray Deep<br>Q___ Learning<br>2006<br>Duong cong minh hoa mic "d6ng luc/ky vong" qua cdc giai doan — mang tinh KHAI NIEM, khong phdi so liéu do luéng dinh luong.<br>1956 1966 1973 1980 1987 1993 2006 2012. 20162018 2022 2026<br><!-- End of picture text -->





<!-- page: 9 -->

<!-- Start of picture text -->
Hién tai<br>2026<br>ChatGP2022 |<br>CAC CU SOC MUA DONG MUA DONG<br>(1966-1973) LAN 1 (1974-80) LAN 2 WA<br>A<br>Transfgrmer Y<br>AlexNet 2037<br>2012<br>© Ky nguyén<br>Dartmouth @) Agent<br>Workshop1956 y ~1 / BERT 2024<br>@ 2018<br>Hé chuyén gi<br>e 1980 ar eee<br>\ ,<br>\ Deep<br> es Learning<br>2006<br>1956 1966 1973 1980 1987 1993 2006 2012 2016 2018 2022 2026<br><!-- End of picture text -->

<!-- page: 10 -->

### **LLM là gì? — một bộ não nền, không phải một chatbot** 

**LLM Large Language Model)** là một mô hình ngôn ngữ rất lớn, thường dựa trên kiến trúc Transformer, được luyện trên hàng nghìn tỷ mảnh chữ để học cách **đoán mảnh chữ tiếp theo trong** . **ngữ cảnh** 

💬 Chatbot 📝 Tóm tắt tài liệu ⟵ 💻 Viết code 

thường dựa trên kiến trúc Transformer, được luyện trên hàng **1 model nền** nghìn tỷ mảnh chữ để học cách **đoán mảnh chữ tiếp theo trong** 📝 LLM . **ngữ cảnh** ⟵ 💻 Nhờ được luyện đủ rộng, nó trở thành một **nền chung** : thay vì mỗi việc train một model riêng, cùng một model làm được rất 🌐 nhiều việc. Chatbot chỉ là **một dạng sản phẩm** đóng gói quanh bộ não đó — lớp áo bên ngoài. **LLM = bộ não ngôn ngữ dùng chung cho mọi việc — sản phẩm bạn thấy chỉ là lớp áo bên ngoài** Model hiện nay chủ yếu là kiến trúc decoder-only GPT, Claude, Gemini, Kimi), nhiều model dùng MoE; sau pre-training còn các bước căn chỉnh SFT, RLHF/DPO) và luyện suy luận (reasoning training, từ 2025. 

🌐 Dịch & phân tích 

#### Behold, a wild pi creature, 

<!-- page: 11 -->

### foraging in its native ____ 



<!-- Start of picture text -->
pA N land [Rj 22%<br>4 forest [Jj 9%<br>habitat [J 4%<br>| \ countryforests [ J5%4%<br>| Transtormer ™ soil [J 4%<br>SS we tesitw o odsry |Jax2%<br>lands | 1%<br>= = waters [1%<br>woodland | 1%<br>:<br><!-- End of picture text -->





<!-- page: 12 -->

<!-- Start of picture text -->
If you could see the underlying If you could see the underlying If you could see the underlying<br>probability distributions a large probability distributions a large probability distributions a large<br>language model uses when generating language model uses when generating language model uses when generating<br>text, then you text, then you would text, then you would essentially<br>it [10% could 13% be 32%<br>yes 1% may | 0% gain 4%<br>what [1% 'd | 0% likely J] 2%<br>I [1% can | 0% see | 0%<br>we | 0% will | 0% get | 0%<br>that | 0% essentially | 0% potentially | 0%<br>there | 0% ’d | 0% better | 0%<br>this | 0% wouldn | 0% basically | 0%<br>perhaps | 0% are | 0% effectively | 0%<br>they | 0% | 0% understand |0%<br><!-- End of picture text -->

D6 dai cdu XAP-¢ Xi2 nhau (9 vs 10 tit)» nhung tokenizer GPT cat Tiéng Viét vun hon han: 1.9 token/tir» so véi 1.2 token/tir~ So sénh KHONG cing sé tir tuyét d6i (9 vs 10) — diém quan trong la ti Ié token/ti, khéng phai tong sé tir. 

Tiéng Anh: "To date, the cleverest thinker of all time was" > 9tw > 11 token 



<!-- Start of picture text -->
a ae ae _ elela le<br><!-- End of picture text -->

Tiéng Viét: "Lan bé quyén sach vao tui vi né qua day" > 10 tir > 19 token 

Minh hoa bang tokenizer that: tiktoken cll100k_base (GPT-4). O vang = mét "ti" bj cat thanh nhiéu token — vd "cleverest"+"clever"+"est"; "Lan"+"L"+"an" (dau thanh tiéng Viét budc BPE tach nhé hon vi dugc hudn luyén chu yéu trén dif liéu Anh ngi). Nguén: OpenAl tiktoken (cl100k_base), tinh truc tiép trong phién nay. 



<!-- page: 13 -->

###### Vi sao “nhéi” that nhiéu vao prompt khéng phai Itic nao cing tét 



<!-- Start of picture text -->
Context window = mat= ban lam viéc~ CO HANrs<br><<br>3 33<br>) 1S)<br>dé NHIEU: tgidy qua ><br>to 6 GIUA dé bi bé sot<br><!-- End of picture text -->



<!-- page: 14 -->

<!-- Start of picture text -->
Théng tin dat 6 GIUA ngit canh dé bij bd sét nhat<br>vungoem CPD“gila<br>hay bj quén<br>£<br>oOSs=2 cao<br>=<br>a:<br>3<br>is<br>6<D2<br>“6sx thép2<br>inh dang chir U — minh hoa hién tugng “Lost in the Middle” (Liu et al. 2023)<br>Dau Gita Cuéi<br>ng canh ng canh<br><!-- End of picture text -->



nhìn lại các token trước đó trong câu của từng token đối với nghĩa của mình — “nóˮ là quyển sách hay cái túi, tùy theo nó chú ý vào từ nào Đây chính là chữ T trong GPT — và là lý do model hiểu ngữ cảnh tốt hơn hẳn các thế hệ trước **- - -** Video minh họa: **<u>Attention in transformers, step by step 3Blue1Brown</u>** 

<!-- page: 15 -->

### **Attention: mỗi từ được “nhìn sangˮ những từ quan trọng khác** 

Thay vì đọc tuần tự từng chữ, cơ chế **attention** cho phép mỗi token: **Chủ động “quay đầuˮ** nhìn lại các token trước đó trong câu **Chấm điểm mức độ liên quan** của từng token đối với nghĩa của mình **Khóa nghĩa theo ngữ cảnh** — “nóˮ là quyển sách hay cái túi, tùy theo nó chú ý vào từ nào 

<!-- page: 16 -->

### **Hiểu attention để dùng AI hiệu quả: quản context = quản sự chú ý** 

#### Attention có hạn và có "điểm mù". Vì vậy, cách bạn bày context quyết định model chú ý vào đâu: 

**2 3 Giữ bàn làm việc sạch** Context rác = attention rác. Khi chat dài, tóm tắt lại thay vì kéo theo mọi thứ; khi vibe code, đưa đúng file liên quan, không nhớ hết hoặc nhét cả cuốn. dán cả repo. **Agent mạnh không phải vì context khổng lồ — mà vì nó có tools để lấy đúng thứ vào bàn làm việc đúng lúc** 



<!-- Start of picture text -->
1<br>Đặt điều quan trọng đầu – cuối<br><!-- End of picture text -->

###### **2 Giữ bàn làm việc sạch 3 Cho tra sổ thay vì bắt nhớ** 

Đầu và cuối prompt được chú ý nhiều nhất; đồ ở giữa dễ bị bỏ sót — yêu cầu quan trọng đừng chôn giữa. 

Tài liệu dài: lấy đoạn liên quan nhét vào context RAG) thay vì trông chờ model nhớ hết hoặc nhét cả cuốn. 

<!-- page: 17 -->

### **Tham số (parameter): những "khớp nối" model học được** 

Sau khi luyện xong, những gì model "biết" nằm trong các con số cố định bên trong gọi là **tham số** — hãy hình dung như **khớp nối thần kinh** : luyện càng kỹ, các khớp nối càng được siết đúng. **Tham số không phải thứ bạn chỉnh** khi dùng model — nó được đóng gói sẵn trong "bộ não" (file weights). Bạn chỉ chỉnh được context và các núm vặn lúc gọi (như temperature). 

như **khớp nối thần kinh** : luyện càng kỹ, các khớp nối càng được siết đúng. **Tham số không phải thứ bạn chỉnh** khi dùng model — nó được đóng gói sẵn trong "bộ não" (file weights). Bạn chỉ chỉnh được context và các núm vặn lúc gọi (như temperature). **2020  GPT3 2026  Kimi K3 175 tỷ 2.800 tỷ** một "bác sĩ đa năng" — mọi token đều đi qua toàn bộ khớp nối một "bệnh viện đa khoa" — mỗi token chỉ gọi vài chuyên gia (dense) MoE Nhiều tham số ≠ tốn hơn tuyến tính — nhờ MoE, **bệnh viện lớn gấp 16 lần mà chi phí mỗi ca khám gần như không đổi** compute / dữ liệu (thang log) → Luật chơi 20202024: cứ thêm compute + dữ liệu là model khôn lên **một cách dự đoán được** (scaling law, Kaplan et al. 2020 MoE Shazeer et al. 2017 — arxiv.org/abs/1701.06538 · Kimi K3 16/7/2026 2.8 nghìn tỷ tham số MoE — k3-kimi.com 

<!-- page: 18 -->

Mot LLM duoc “nudi I6n” qua 3 budéc — mdi budéc mét viéc khac nhau 



<!-- Start of picture text -->
1: PRE-TRAINING 2: SFT 3+ RLHF / DPO<br>“Doc nhiéu” “Buoc chi cach tra 1oi” “Duoc uén nan”<br>Doc gan nhu ca internet dé Nguoi ra vi du hdi-dap mau, Ngudi cham cau nao tét/té,<br>hoc ng6én ngtt & kién thu. model bat chuséc cach tra Idi. model chinh cho hgp y ngudi.<br>Nhu doc van cuén séch Nhu gia su lam mau Nhu bién taép uén giong cho<br>nhung chua biét cach tra Idi. “cau nay nén dap thé nay”. lich su, hitu ich, an toan.<br><!-- End of picture text -->

An du “hoc gia trong bong bong”: doc rat nhiéu (buéc 1) nhung phai duge chi (2) va uén nan (3) méi biét déi dép cho ra ngudi. 



<!-- page: 19 -->

### **RLHF: ba bước uốn cỗ máy đoán token thành trợ lý biết nghe lời** 



<!-- Start of picture text -->
① Model viết nhiều câu trả lời ② Người chấm xếp hạng ③ Huấn luyện theo điểm<br>«Cùng một câu hỏi» Trả lời B 1 LLM<br>↓ ↓<br>Trả lời D 2<br>LLM câu trả lời vừa viết<br>Trả lời A 3<br>↓<br>Trả lời A Trả lời B Trả lời C 4 tăng xác suất điểm: 9.2 / 10<br>câu ghi điểm<br>↓ cao<br>Trả lời C Trả lời D<br>REWARD MODEL<br>máy chấm điểm thay người<br>lặp lại hàng nghìn lần → model dần “biết nghe lờiˮ<br>AI IN ACTION - HACKATHON<br><!-- End of picture text -->

**Cỗ máy đoán token + điểm xếp hạng của con người → trợ lý helpful · harmless · honest** 

Ouyang et al. 2022, “Training language models to follow instructions with human feedbackˮ InstructGPT — arxiv.org/abs/2203.02155 · DPO (cách đơn giản hơn, 2023 — <u>arxiv.org/abs/2305.18290</u> 

<!-- page: 20 -->

### **Giới hạn bẩm sinh: học giả trong bong bóng** 

**Nói chắc như đúng rồi** Model tối ưu cho câu **nghe hợp lý** , không phải tra sự thật — nên có thể tự tin mà sai (hallucination). 

##### **Bong bóng thời gian** 

##### **Bàn làm việc có hạn** 

Model tối ưu cho câu **nghe hợp lý** , không phải tra sự thật — nên có thể tự tin mà sai dễ bỏ sót thông tin ở giữa. (hallucination). "Why does it work? We don't know — a lot here are intuitions, not theorems or truths." — Łukasz Kaiser, đồng tác giả "Attention Is All You Need" OpenAI Đây không phải lỗi tạm thời — đó là **bản chất của cỗ máy đoán token** . Vì vậy ta cần prompt tốt, context sạch, tra sổ RAG, tools, và luôn kiểm chứng. 

Context có trần; quá dài vừa tốn tiền vừa dễ bỏ sót thông tin ở giữa. 

Model bị "đóng băng" tại ngày ngừng đọc. Chuyện sau đó nó không biết — trừ khi bạn cung cấp thêm (knowledge cutoff). 

“Biết nhiềuˮ khác “làm đượcˮ: dữ liệu mới và hành động thật cần tools/retrieval/workflow — nền của các ngày sau. 

<!-- page: 21 -->

### **Vì sao model vẫn sai: nó rất giỏi học vẹt đường tắt** 

**3 Suy luận ngôn ngữ MNLI** Model thực chất đã học: **“câu có động từ phủ địnhˮ** 



<!-- Start of picture text -->
1<br>Phân loại spam<br><!-- End of picture text -->

**2 Câu chủ quan vs khách quan** Model thực chất đã học: 

Model thực chất đã học: Model thực chất đã học: Model thực chất đã học: **“đếm số hyperlink trong emailˮ “có phải câu trích từ film review** Email sạch nhưng nhiều link → vẫn bị gán **khôngˮ** spam Ăn gian bằng nguồn gốc câu, không phải nội dung câu Ba “đường tắtˮ (spurious cues) trên do **chính LLM tự động phát hiện** thật của benchmark OpenD5. Benchmark cao ≠ model hiểu đúng thứ bạn tưởng — **luôn test trên dữ liệu của chính mình** Zhong, Snell, Klein & Steinhardt 2022, “Describing Differences between Text Distributions with Natural Languageˮ, ICML 2022 · Zhong et al. 2023, “Goal Driven Discovery of Distributional Differences via Language Descriptionsˮ OpenD5, NeurIPS 2023 

Đổi cấu trúc dữ liệu test là điểm tụt ngay 

Ba “đường tắtˮ (spurious cues) trên do **chính LLM tự động phát hiện** và mô tả bằng ngôn ngữ tự nhiên — trên quy mô 675 bài toán thật của benchmark OpenD5. 

<!-- page: 22 -->

### **Chain-of-Thought: chỉ thêm "giấy nháp", từ sai thành đúng** 

Bài toán: "Có 5 quả bóng tennis. Mua thêm 2 hộp, mỗi hộp 3 quả. Hỏi tổng cộng có bao nhiêu quả?" 

**Không có nháp — trả lời ngay Có giấy nháp — "hãy nghĩ từng bước"** Model đọc câu hỏi → bật ra đáp án ngay: "Bắt đầu có 5 quả. "Đáp án là 27 quả." Mỗi hộp 3 quả × 2 hộp = 6 quả. 5 + 6 = 11. **✗ SAI** Đáp án là 11 quả." **✓ ĐÚNG Cùng một model, cùng một câu hỏi — cho nó được viết nháp từng bước, bản chất suy luận lộ ra** Wei et al. 2022, “Chain-of-Thought Prompting Elicits Reasoning in Large Language Modelsˮ — arxiv.org/abs/2201.11903 · Đây là mầm của các reasoning model (o1, R1...) và của test-time compute ở các slide sau. 

<!-- page: 23 -->

### **Từ LLM đến agent: bốn mức độ — mỗi bậc thêm một năng lực** 

mức tự chủ & tác động thật tăng dần → **LEVEL 3 LEVEL 2 Biết lập kế hoạch** agent) + tự chia mục tiêu thành nhiều **LEVEL 1** bước, dùng nhiều tool nối tiếp, tự **Có kết nối** kiểm tra kết quả từng bước + tools: search web, đọc database, gọi API — vượt khỏi bong bóng thời gian 

**LEVEL 3 Đội agent phối hợp** 

+ nhiều agent chuyên biệt chia việc như một đội ngũ (multiagent) 

**LEVEL 1 Có kết nối LEVEL 0** + tools: search web, đọc **Bộ não suy luận** database, gọi API — vượt khỏi bong bóng thời gian LLM trần — không công cụ, <u>không dữ liệu mới</u> 

Agent không phải “một loại model khácˮ — **đó là LLM được đặt vào vòng làm việc có mục tiêu và hành động** 

<!-- page: 24 -->

### **Giải phẫu một agent: 5 bộ phận là một vòng lặp** 



<!-- Start of picture text -->
① Goal<br>mục tiêu cần đạt<br>ghi / đọc<br>Memory<br>sổ tay ghi nhớ các bước ② Reasoning<br>bộ não LLM chia bước<br>vòng lặp<br>agent<br>quan sát kết quả → lặp lại<br>③ Tools<br>④ Action search · API · database ·<br>hành động ra đời thật<br>code<br>Agent = Goal + Reasoning + Tools + Memory + Action — chạy thành vòng lặp cho tới khi<br>xong việc<br>AI IN ACTION - HACKATHON<br><!-- End of picture text -->



<!-- page: 25 -->

<!-- Start of picture text -->
Gia cho cling mét nang luc giam ~10x/nam — open-weight (cam) nam 6 tang day<br>$60 Thang log: mdi vach doc = x10<br>@ Closed (déng)<br>@ Open-weight (md)<br>e > Cuing muic nang luc GPT-3.5<br>GPT-4 Turbo $10<br>) GPT-40 $5<br>/ GPT-5.6 $5<br>$10 / oO<br>) $20 - text-davinci-003 @ e@<br>2 (11/2022)<br>D@<br>c<br>o<br>Tat<br>Sd<br>8 Gemini 1.5 PI 3.5<br>2 emint ro $ DeepSeek R1 $0.55 r }<br>5 $1<br>Q<br>£<br>5 GPT-4 $30 r)<br>x GPT-5 $1.25<br>fe}<br>~<br><O-a<br>5 e ?<br>dq<br>~<br>38 ®<br>1)<br>$0.10 DeepSeek V3 $0.27<br>Claude 3 Haiku $0.25<br>cang xuéng DeepSeek V4 $0.14<br>= cang ré<br>>280x ré hon trong ~2 nam<br>(11/2022 > 10/2024, 20-0.07)<br>$0.01<br><!-- End of picture text -->

<!-- page: 26 -->

### **Chọn model theo TẦNG, không chọn theo tên** 

**VIỆC CỦA BẠN** 

###### **TẦNG MODEL** 

**TẦNG 1 — FRONTIER ĐÓNG Việc đơn giản, khối lượng lớn Fable 5 · GPT5.6 Sol · Opus 4.8** phân loại · trích xuất · tóm tắt ngắn đắt nhất — chỉ trả cho việc thật sự khó **Việc hàng ngày ★ MẶC ĐỊNH THỬ TẦNG NÀY TRƯỚC** viết · code · phân tích công việc · automation **TẦNG 2 — RẺ MÀ MẠNH Sonnet 4.6 · Terra · Gemini 3.1 Pro · Kimi K3 · Haiku · Flash Việc khó nhất** giải quyết đa số việc hằng ngày suy luận nhiều bước · code phức tạp · tài liệu dài · độ tin cậy cao **Việc cần kiểm soát TẦNG 3 — SELF-HOST / SIÊU RẺ** dữ liệu nhạy cảm · chi phí ở quy mô lớn **Kimi K3 open-weight · DeepSeek · Qwen** khi cần kiểm soát dữ liệu hoặc chi phí quy mô lớn **Hai lỗi đối xứng:** ✗ việc đơn giản mà gọi frontier → phí tiền ✗ việc khó mà cố dùng rẻ → kết quả tệ Bắt đầu từ model **đủ tốt và đủ rẻ** — chỉ nâng tầng khi kết quả thực sự chặn use case 

<!-- page: 27 -->

### **Token có giá: vé vào rẻ, vé ra đắt gấp 3–5 lần** 

**HÓA ĐƠN — 1 LẦN GỌI API** 

**VÉ VÀO — INPUT VÉ RA — OUTPUT 1 35** input 1.150 tok × $3 / 1MM output 200 tok × $15 / 1MM chữ BẠN gửi đi: chữ MODEL viết ra — nó phải prompt · system instruction · tự sinh từng mảnh một, vừa TỔNG context · lịch sử chat chậm vừa tốn số liệu ví dụ — giá thật tùy model & nhà cung cấp rẻ — model chỉ cần đọc đắt — model phải “vắt ócˮ Đọc mục **usage** giúp bạn kiểm soát chi phí từ ngày đầu. **Input tokens + Output tokens = Chi phí mỗi lần gọi — kiểm soát output là núm vặn lớn nhất** 

input 1.150 tok × $3 / 1MM $0.00345 output 200 tok × $15 / 1MM $0.00300 TỔNG ≈ $0.0065 số liệu ví dụ — giá thật tùy model & nhà cung cấp 

Đọc mục **usage** trong mỗi response — đó là hóa đơn chi tiết giúp bạn kiểm soát chi phí từ ngày đầu. 

<!-- page: 28 -->

### **Giải phẫu một prompt: bốn lớp xếp chồng** 



<!-- Start of picture text -->
LỚP 1<br>System “Lời dặn đầu caˮ: model là ai, cư xử thế «Bạn là trợ lý y khoa, trả lời<br>nào, không được làm gì ngắn gọn, không chẩn đoán…»<br>instruction<br>LỚP 2 Câu hỏi / yêu cầu của người dùng trong<br>«Tóm tắt báo cáo Q1 giúp mình»<br>User input lượt này<br>LỚP 3<br>Context bổ Tài liệu, lịch sử chat, dữ liệu tra sổ — phần «[đính kèm: bao_cao_q1.pdf — 3<br>bày lên “bàn làm việcˮ đoạn liên quan]»<br>sung<br>LỚP 4<br>Dạng kết quả: gạch đầu dòng? bảng? «3 bullet + 1 rủi ro chính, tiếng<br>Output mong JSON? dài bao nhiêu? Việt»<br>muốn<br>Viết rõ cả 4 lớp = đã làm tốt một nửa “prompt engineeringˮ —  phần còn lại là các ngày sau<br>AI IN ACTION - HACKATHON<br>1 PROMPT  4 PHẦN<br><!-- End of picture text -->

<!-- page: 29 -->

### **Hai núm vặn chọn từ: temperature & top_p** 

#### **temperature — “núm vặn độ liềuˮ** 

#### **top_p — “chỉ xem top đầu bảngˮ (p = 0.9** 

Cùng một câu: “Một tách ___ˮ — bảng xác suất đổi theo T 



<!-- Start of picture text -->
① Bảng xác suất gốc ② Bảng mới<br>giữ nhóm cộng dồn ≥ 90%<br>→<br>cắt &<br>chuẩn hóa lại<br>cà phê trà mưa sao cà phê trà mưa<br><!-- End of picture text -->

**① Bảng xác suất gốc** luôn chọn từ **chắc nhất giữ nhóm cộng dồn ≥ 90%** → ổn định, lặp lại, hợp → code & phân tích cắt & chuẩn hóa lại cà phê trà mưa sao cà phê trà mưa sao cân bằng tự nhiên — vẫn ưu tiên từ hợp lý “saoˮ (đuôi dài xác suất thấp) **bị loại khỏi lựa chọn** trong nhóm đáng tin. Thường chỉ vặn **một trong hai** cà phê trà mưa sao **Lưu ý quan trọng:** phân bố **phẳng ra** → **cách chọn từ** , không thêm tri thức. đa dạng, “phiêuˮ, dễ lạc đề cà phê trà mưa sao Mặc định an toàn: **temperature = 0** cho việc cần ổn định — chỉ tăng khi thật sự cần đa dạng 

###### **T  0** 

###### **T  1** 

“saoˮ (đuôi dài xác suất thấp) **bị loại khỏi lựa chọn** — model chỉ còn chọn trong nhóm đáng tin. Thường chỉ vặn **một trong hai** : temperature hoặc top_p. 

**Lưu ý quan trọng:** hai núm này không làm model thông minh hơn — chỉ đổi **cách chọn từ** , không thêm tri thức. 

**T  2** 

