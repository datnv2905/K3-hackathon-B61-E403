import { createSessionChip, requireRole } from "/auth.js";

const STORAGE_PREFIX = "vlearn-tutor-session-v1";
const MAX_PERSONALISED = 5;
const DUPLICATE_THRESHOLD = 0.7;
const PDFJS_MODULE_URL = "/vendor/pdfjs/pdf.min.mjs";
const PDFJS_WORKER_URL = "/vendor/pdfjs/pdf.worker.min.mjs";
const PDF_RENDER_ROOT_MARGIN = "1200px 0px"; // render pages ~1.5 screens before they're visible
// Che do chon: "text" boi den chu (mac dinh, duong cu), "image" khoanh vung anh.
// Mot cu chi keo duy nhat, hai y dinh khac nhau - nen phai co cong tac hien ro tren
// thanh cong cu thay vi phim tat, de nguoi xem demo thay duoc dang o che do nao.
let selectMode = "text";
// Chan canh dai cua anh cat. Vung khoanh to + devicePixelRatio 2 de ra anh vai nghin
// pixel; gui thang len se doi token va lam cham demo ma khong them do chinh xac.
const MAX_CROP_EDGE = 1400;

const RATING_REASONS = [
  "Không liên quan đến nội dung vừa hỏi",
  "Câu hỏi quá dễ",
  "Câu hỏi quá khó",
  "Câu hỏi hoặc đáp án không rõ ràng",
  "Đáp án có vẻ không chính xác",
  "Nội dung bị lặp",
  "Lý do khác",
];

const els = {
  lessonList: document.querySelector("#lessonList"),
  viewer: document.querySelector("#viewer"),
  chat: document.querySelector("#chat"),
  contextPreview: document.querySelector("#contextPreview"),
  askForm: document.querySelector("#askForm"),
  askBtn: document.querySelector("#askBtn"),
  questionInput: document.querySelector("#questionInput"),
  clearSelectionBtn: document.querySelector("#clearSelectionBtn"),
  modeTextBtn: document.querySelector("#modeTextBtn"),
  modeImageBtn: document.querySelector("#modeImageBtn"),
  toolHint: document.querySelector("#toolHint"),
  resetSessionBtn: document.querySelector("#resetSessionBtn"),
  finalQuizBtn: document.querySelector("#finalQuizBtn"),
  finalOverlay: document.querySelector("#finalOverlay"),
  finalBody: document.querySelector("#finalBody"),
  closeFinalBtn: document.querySelector("#closeFinalBtn"),
  modelPill: document.querySelector("#modelPill"),
  mockBadge: document.querySelector("#mockBadge"),
  lessonTitle: document.querySelector("#lessonTitle"),
  lessonNavTitle: document.querySelector("#lessonNavTitle"),
  lessonFileName: document.querySelector("#lessonFileName"),
  statQuestions: document.querySelector("#statQuestions"),
  statQuizzes: document.querySelector("#statQuizzes"),
  statAccuracy: document.querySelector("#statAccuracy"),
  statIncluded: document.querySelector("#statIncluded"),
};

let lesson = null;
let lessons = [];
let state = null;
let selection = null;
let drag = null;
let busy = false;

// PDF-mode-only state. pageTextItems maps pageNumber -> [{str,left,top,width,height}]
// in CSS-pixel coordinates relative to that page's own rendered canvas, used for the
// drag-to-select geometry hit-test (see "Highlight without a native text layer" below).
let pdfDoc = null;
let pdfjsLib = null;
let pageTextItems = new Map();
let pageObserver = null;

init();

async function init() {
  // Cổng điều hướng demo: chưa đăng nhập thì về /login.html, admin thì sang dashboard.
  const session = requireRole("learner");
  if (!session) return;
  mountSessionChip(session);

  bindEvents();
  await loadLessonList();
  const startLessonId = localStorage.getItem("vlearn-active-lesson") || lessons[0]?.id;
  await Promise.all([loadLesson(startLessonId), loadHealth()]);
  renderChat();
  renderSummary();
}

function mountSessionChip(session) {
  document.querySelector(".topbar-right")?.prepend(createSessionChip(session));
}

/* ── Loading ─────────────────────────────────────────────── */

async function loadLessonList() {
  try {
    const response = await fetch("/api/lessons");
    lessons = await response.json();
  } catch {
    lessons = [];
  }
  renderLessonList(null);
}

function renderLessonList(activeLessonId) {
  els.lessonList.innerHTML = "";
  lessons.forEach((entry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lesson-item" + (entry.id === activeLessonId ? " is-active" : "");
    button.innerHTML = `
      <span>${entry.kind === "pdf" ? "PDF" : "MOCK"} · ${entry.pageCount}tr</span>
      <strong>${escapeHtml(entry.title)}</strong>
    `;
    button.addEventListener("click", () => {
      if (entry.id !== lesson?.id) switchLesson(entry.id);
    });
    els.lessonList.appendChild(button);
  });
}

async function switchLesson(id) {
  if (busy) return;
  cleanupPdfViewer();
  els.finalOverlay.hidden = true;
  localStorage.setItem("vlearn-active-lesson", id);
  await loadLesson(id);
  renderChat();
  renderSummary();
  trackEvent("lesson_switched", { lessonId: id });
}

async function loadLesson(id) {
  try {
    const response = await fetch(`/api/lesson?id=${encodeURIComponent(id || "")}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    lesson = await response.json();
  } catch {
    els.viewer.innerHTML = `<p class="hint">Không tải được bài giảng. Kiểm tra server đang chạy chưa.</p>`;
    return;
  }

  state = loadState(lesson.id);
  selection = null;

  els.lessonTitle.textContent = lesson.title;
  els.lessonNavTitle.textContent = lesson.title;
  els.lessonFileName.textContent = lesson.sourceFile;
  els.mockBadge.hidden = !lesson.isMock;
  if (lesson.isMock) els.mockBadge.title = lesson.mockNote || "";
  renderLessonList(lesson.id);
  renderSelection();

  if (lesson.kind === "pdf") {
    await renderPdfSlides();
  } else {
    renderSlides();
  }
}

async function loadHealth() {
  try {
    const response = await fetch("/api/health");
    const data = await response.json();
    // hasApiKey chứ không phải hasGeminiKey: chạy --claude mà máy không có key
    // Gemini thì pill sẽ báo sai "Chưa có API key" dù Claude đang hoạt động bình thường.
    const ready = data.hasApiKey ?? data.hasGeminiKey;
    els.modelPill.textContent = ready ? data.model : "Chưa có API key";
    els.modelPill.classList.toggle("is-off", !ready);
  } catch {
    els.modelPill.textContent = "Offline";
    els.modelPill.classList.add("is-off");
  }
}

/* ── Events ──────────────────────────────────────────────── */

function bindEvents() {
  els.askForm.addEventListener("submit", askTutor);
  els.clearSelectionBtn.addEventListener("click", clearSelection);
  els.resetSessionBtn.addEventListener("click", resetSession);
  els.finalQuizBtn.addEventListener("click", openFinalQuiz);
  els.closeFinalBtn.addEventListener("click", () => (els.finalOverlay.hidden = true));
  els.viewer.addEventListener("pointerup", captureTextSelection);
  els.modeTextBtn?.addEventListener("click", () => setSelectMode("text"));
  els.modeImageBtn?.addEventListener("click", () => setSelectMode("image"));
}

function setSelectMode(mode) {
  if (selectMode === mode) return;
  selectMode = mode;
  clearSelection();

  const isImage = mode === "image";
  els.modeTextBtn?.classList.toggle("is-active", !isImage);
  els.modeImageBtn?.classList.toggle("is-active", isImage);
  els.modeTextBtn?.setAttribute("aria-checked", String(!isImage));
  els.modeImageBtn?.setAttribute("aria-checked", String(isImage));
  els.toolHint.textContent = isImage
    ? "Kéo một khung quanh hình để hỏi AI"
    : "Bôi đen một đoạn để hỏi AI";
  els.viewer.classList.toggle("is-region-mode", isImage);
  trackEvent("select_mode_changed", { mode });
}

// Cắt đúng vùng người học kéo ra khỏi canvas đã render, rồi giữ lại dưới dạng data URL
// để gửi kèm câu hỏi. Canvas render ở scale × devicePixelRatio còn hộp kéo đo bằng
// pixel CSS — quên nhân tỉ lệ này thì trên màn Retina sẽ cắt lệch mất một nửa.
function selectRegionImage(pageNumber, box, body) {
  const canvas = body.querySelector("canvas");
  if (!canvas) return;

  const ratio = canvas.width / parseFloat(canvas.style.width || canvas.width);
  const sx = Math.max(0, Math.round(box.left * ratio));
  const sy = Math.max(0, Math.round(box.top * ratio));
  const sw = Math.min(canvas.width - sx, Math.round(box.width * ratio));
  const sh = Math.min(canvas.height - sy, Math.round(box.height * ratio));
  if (sw < 16 || sh < 16) return;

  // Thu nhỏ nếu vượt cạnh tối đa — giữ nguyên tỉ lệ khung hình.
  const shrink = Math.min(1, MAX_CROP_EDGE / Math.max(sw, sh));
  const out = document.createElement("canvas");
  out.width = Math.round(sw * shrink);
  out.height = Math.round(sh * shrink);
  out.getContext("2d").drawImage(canvas, sx, sy, sw, sh, 0, 0, out.width, out.height);

  const pageW = parseFloat(canvas.style.width) || canvas.width;
  const pageH = parseFloat(canvas.style.height) || canvas.height;

  selection = {
    id: crypto.randomUUID(),
    type: "region",
    pageNumber,
    dataUrl: out.toDataURL("image/jpeg", 0.82),
    region: {
      pageNumber,
      x: Math.round((box.left / pageW) * 100),
      y: Math.round((box.top / pageH) * 100),
      width: Math.round((box.width / pageW) * 100),
      height: Math.round((box.height / pageH) * 100),
    },
  };

  renderSelection();
  trackEvent("selection_region", { pageNumber, width: out.width, height: out.height });
}

/* ── Slide viewer ────────────────────────────────────────── */

function renderSlides() {
  els.viewer.innerHTML = "";
  lesson.pages.forEach((page) => {
    const slide = document.createElement("article");
    slide.className = "slide";
    slide.dataset.page = String(page.pageNumber);

    const meta = document.createElement("div");
    meta.className = "slide-meta";
    meta.innerHTML = `<span>Trang ${page.pageNumber} / ${lesson.totalPagesInRealDeck || lesson.pages.length}</span><span>${escapeHtml(lesson.sourceFile)}</span>`;

    const body = document.createElement("div");
    body.className = "slide-body";
    body.innerHTML = `
      <h2 class="slide-title ${escapeHtml(page.theme || "")}">${escapeHtml(page.title)}</h2>
      <div class="flow" aria-hidden="true">
        ${page.visual.map((item) => `<div class="flow-step">${escapeHtml(item)}</div>`).join("")}
      </div>
      <div class="slide-text">
        <p>${escapeHtml(page.text)}</p>
        <ul>${page.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
      </div>
    `;

    slide.append(meta, body);
    els.viewer.appendChild(slide);
  });
}

/* ── PDF viewer ──────────────────────────────────────────── */
//
// Renders the real PDF (pdf.js, vendored — see codebase/public/vendor/pdfjs)
// straight to <canvas>, one per page, lazily as pages scroll into view.
//
// Highlight without a native text layer: instead of pdf.js's TextLayer class
// (browser-native, cursor-based text selection with real DOM text nodes), the
// learner drags a box over the page and we hit-test that box against each text
// item's own geometry (computed from pdf.js's glyph transforms — see
// geometryForItem), then send the underlying real string to the tutor. There is
// no region (khoanh vùng) mode anywhere in the app — highlighting is the only
// interaction. This trades native OS text selection for a much smaller, more reliable
// implementation — see codebase/MOCKS.md.

async function getPdfjsLib() {
  if (!pdfjsLib) {
    pdfjsLib = await import(PDFJS_MODULE_URL);
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
  }
  return pdfjsLib;
}

async function renderPdfSlides() {
  cleanupPdfViewer();
  els.viewer.innerHTML = "";

  let lib;
  try {
    lib = await getPdfjsLib();
    // Uses a real dedicated Worker (pdf.js default), not disableWorker:true.
    // The main-thread "fake worker" mode used to be the choice here, but it
    // throws a Safari-only ReferenceError ("Cannot access uninitialized
    // variable") — a known pdf.js/WebKit module-evaluation incompatibility in
    // that code path specifically. A prior comment claimed a real Worker hung
    // after the first page; re-tested via CDP (real console + a full 29-page
    // scroll-through, not just a screenshot) and it completed cleanly with zero
    // errors, so that appears to have been fixed upstream since. withTimeout
    // still guards against a silent stall either way.
    pdfDoc = await withTimeout(
      lib.getDocument({ url: lesson.pdfUrl }).promise,
      20000,
      "Worker không phản hồi sau 20s"
    );
  } catch (error) {
    els.viewer.innerHTML = `<p class="hint">Không tải được PDF: ${escapeHtml(error.message)}</p>`;
    return;
  }

  pageObserver = new IntersectionObserver(onPageIntersect, {
    root: els.viewer,
    rootMargin: PDF_RENDER_ROOT_MARGIN,
  });

  for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber++) {
    const page = await pdfDoc.getPage(pageNumber);
    const baseViewport = page.getViewport({ scale: 1 });

    const slide = document.createElement("article");
    slide.className = "slide pdf-slide";
    slide.dataset.page = String(pageNumber);

    const meta = document.createElement("div");
    meta.className = "slide-meta";
    meta.innerHTML = `<span>Trang ${pageNumber} / ${pdfDoc.numPages}</span><span>${escapeHtml(lesson.sourceFile)}</span>`;

    const body = document.createElement("div");
    body.className = "slide-body pdf-page-body is-loading";
    body.dataset.page = String(pageNumber);
    body.dataset.rendered = "false";
    // Reserve the final on-screen size up front so pages above don't jump around
    // as later pages finish loading.
    const targetWidth = Math.min(els.viewer.clientWidth - 4 || 760, 900);
    const scale = targetWidth / baseViewport.width;
    body.style.width = `${Math.floor(targetWidth)}px`;
    body.style.height = `${Math.floor(baseViewport.height * scale)}px`;
    body.dataset.scale = String(scale);

    slide.append(meta, body);
    els.viewer.appendChild(slide);
    pageObserver.observe(body);
  }
}

// Rendering a PDF page (rasterizing vector content + any embedded images at
// devicePixelRatio) is heavy enough that a few pages firing at once from a wide
// IntersectionObserver margin visibly froze the tab. A one-at-a-time queue keeps
// the UI responsive; the scroll-ahead margin just decides what gets queued early.
const pdfRenderQueue = [];
let pdfRenderQueueRunning = false;

function onPageIntersect(entries) {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const body = entry.target;
    if (body.dataset.rendered === "true") continue;
    body.dataset.rendered = "true"; // claim immediately so we never double-queue
    pageObserver.unobserve(body);
    pdfRenderQueue.push(body);
  }
  if (!pdfRenderQueueRunning) drainPdfRenderQueue();
}

async function drainPdfRenderQueue() {
  pdfRenderQueueRunning = true;
  while (pdfRenderQueue.length > 0) {
    const body = pdfRenderQueue.shift();
    // A lesson switch mid-drain (cleanupPdfViewer) detaches the observer but this
    // queue is module-level, so guard against rendering into a torn-down viewer.
    if (!pdfDoc || !body.isConnected) continue;
    try {
      await renderPdfPage(Number(body.dataset.page), body);
    } catch (error) {
      body.classList.remove("is-loading");
      body.innerHTML = `<p class="hint">Lỗi tải trang: ${escapeHtml(error.message)}</p>`;
    }
  }
  pdfRenderQueueRunning = false;
}

async function renderPdfPage(pageNumber, body) {
  const page = await pdfDoc.getPage(pageNumber);
  const scale = Number(body.dataset.scale);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const outputScale = window.devicePixelRatio || 1;
  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = `${Math.floor(viewport.width)}px`;
  canvas.style.height = `${Math.floor(viewport.height)}px`;
  const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

  await page.render({ canvasContext: ctx, transform, viewport }).promise;

  const lib = await getPdfjsLib();
  const textContent = await page.getTextContent();
  const items = textContent.items
    .filter((item) => item.str && item.str.trim() && !isWatermarkText(item.str))
    .map((item) => geometryForItem(lib, item, viewport));
  pageTextItems.set(pageNumber, items);

  body.classList.remove("is-loading");
  body.style.width = `${Math.floor(viewport.width)}px`;
  body.style.height = `${Math.floor(viewport.height)}px`;
  body.appendChild(canvas);

  body.addEventListener("pointerdown", startPdfDrag);
  body.addEventListener("pointermove", movePdfDrag);
  body.addEventListener("pointerup", endPdfDrag);
  body.addEventListener("pointercancel", cancelPdfDrag);
}

// Every page of the Day 1 deck carries a diagonal "AI IN ACTION - HACKATHON"
// watermark as real (selectable) PDF text. It must never be draggable into a
// highlight — hardcoded filter, not a guess. Kept in sync with server.js's copy.
function isWatermarkText(str) {
  const normalized = String(str || "").replace(/\s+/g, "").toUpperCase();
  return normalized.length > 0 && (normalized === "AIINACTION-HACKATHON" || normalized.includes("HACKATHON"));
}

// Approximates each glyph run's on-canvas bounding box from pdf.js's transform
// matrices. Good enough for a drag-to-select hit-test; not pixel-perfect for
// rotated or vertical text, which this deck (plain horizontal Vietnamese) doesn't use.
function geometryForItem(lib, item, viewport) {
  const tx = lib.Util.transform(viewport.transform, item.transform);
  const fontHeight = Math.hypot(tx[2], tx[3]) || 1;
  const scaleMagnitude = Math.hypot(tx[0], tx[1]) || 1;
  const left = tx[4];
  const top = tx[5] - fontHeight;
  const width = Math.abs(item.width * (scaleMagnitude / (Math.hypot(item.transform[0], item.transform[1]) || 1)));
  return { str: item.str, left, top, width: width || fontHeight, height: fontHeight * 1.15 };
}

function cleanupPdfViewer() {
  pageObserver?.disconnect();
  pageObserver = null;
  pdfDoc = null;
  pageTextItems = new Map();
  pdfRenderQueue.length = 0;
}

function startPdfDrag(event) {
  const body = event.currentTarget;
  const rect = body.getBoundingClientRect();

  body.querySelectorAll(".drag-box").forEach((box) => box.remove());
  const box = document.createElement("div");
  box.className = "drag-box";
  body.appendChild(box);

  drag = {
    body,
    box,
    pageNumber: Number(body.dataset.page),
    startX: event.clientX - rect.left,
    startY: event.clientY - rect.top,
  };
  body.setPointerCapture(event.pointerId);
  paintRegion(event);
}

function movePdfDrag(event) {
  if (drag) paintRegion(event);
}

function endPdfDrag(event) {
  if (!drag) return;
  paintRegion(event);

  const bodyRect = drag.body.getBoundingClientRect();
  const boxRect = drag.box.getBoundingClientRect();
  const boxLocal = {
    left: boxRect.left - bodyRect.left,
    top: boxRect.top - bodyRect.top,
    width: boxRect.width,
    height: boxRect.height,
  };

  if (boxLocal.width < 8 || boxLocal.height < 8) {
    drag.box.remove();
    releaseDrag(event);
    return;
  }

  if (selectMode === "image") {
    selectRegionImage(drag.pageNumber, boxLocal, drag.body);
  } else {
    selectTextInBox(drag.pageNumber, boxLocal, drag.body);
  }
  releaseDrag(event);
}

function cancelPdfDrag(event) {
  if (drag) {
    drag.box.remove();
    releaseDrag(event);
  }
}

function selectTextInBox(pageNumber, box, body) {
  const items = pageTextItems.get(pageNumber) || [];
  const boxRight = box.left + box.width;
  const boxBottom = box.top + box.height;

  const matched = items.filter((item) => {
    const itemRight = item.left + item.width;
    const itemBottom = item.top + item.height;
    return item.left < boxRight && itemRight > box.left && item.top < boxBottom && itemBottom > box.top;
  });

  body.querySelectorAll(".drag-box, .text-highlight-box").forEach((el) => el.remove());

  if (matched.length === 0) {
    selection = null;
    renderSelection();
    return;
  }

  matched.forEach((item) => {
    const highlight = document.createElement("div");
    highlight.className = "text-highlight-box";
    Object.assign(highlight.style, {
      left: `${item.left}px`,
      top: `${item.top}px`,
      width: `${item.width}px`,
      height: `${item.height}px`,
    });
    body.appendChild(highlight);
  });

  const text = matched.map((item) => item.str).join(" ").replace(/\s+/g, " ").trim();
  selection = { id: crypto.randomUUID(), type: "text", pageNumber, text };
  renderSelection();
  trackEvent("selection_text", { pageNumber, length: text.length, viaDrag: true });
}

/* ── Mock-lesson viewer (fabricated card content — see codebase/MOCKS.md) ── */

function captureTextSelection() {
  if (lesson?.kind === "pdf") return; // PDF pages use the drag-to-highlight path instead
  const picked = window.getSelection();
  const value = picked?.toString().trim();
  if (!value) return;

  const node = picked.anchorNode;
  const host = (node?.nodeType === 1 ? node : node?.parentElement)?.closest?.(".slide");
  if (!host) return;

  selection = {
    id: crypto.randomUUID(),
    type: "text",
    pageNumber: Number(host.dataset.page),
    text: value,
  };
  renderSelection();
  trackEvent("selection_text", { pageNumber: selection.pageNumber, length: value.length });
}

function releaseDrag(event) {
  try {
    drag.body.releasePointerCapture(event.pointerId);
  } catch {
    /* pointer already released */
  }
  drag = null;
}

function paintRegion(event) {
  const rect = drag.body.getBoundingClientRect();
  const currentX = clamp(event.clientX - rect.left, 0, rect.width);
  const currentY = clamp(event.clientY - rect.top, 0, rect.height);
  Object.assign(drag.box.style, {
    left: `${Math.min(drag.startX, currentX)}px`,
    top: `${Math.min(drag.startY, currentY)}px`,
    width: `${Math.abs(currentX - drag.startX)}px`,
    height: `${Math.abs(currentY - drag.startY)}px`,
  });
}

function clearSelection() {
  selection = null;
  window.getSelection()?.removeAllRanges();
  document.querySelectorAll(".text-highlight-box, .drag-box").forEach((box) => box.remove());
  renderSelection();
}

function renderSelection() {
  els.contextPreview.innerHTML = "";

  if (!selection) {
    els.contextPreview.textContent = "Chưa chọn nội dung";
    return;
  }

  if (selection.type === "region") {
    // Hiện đúng ảnh sắp gửi đi, không phải mô tả toạ độ. Người học phải thấy được
    // AI sắp nhìn cái gì trước khi bấm hỏi — cắt hụt hay cắt lệch thì lộ ra ngay.
    const label = document.createElement("p");
    label.className = "region-label";
    label.textContent = `Vùng đã khoanh trên trang ${selection.pageNumber}`;
    const preview = document.createElement("img");
    preview.className = "region-preview";
    preview.src = selection.dataUrl;
    preview.alt = `Vùng đã khoanh trên trang ${selection.pageNumber}`;
    els.contextPreview.append(label, preview);
    return;
  }

  els.contextPreview.textContent = `Trang ${selection.pageNumber}: “${selection.text}”`;
}

/* ── Asking the tutor ────────────────────────────────────── */

async function askTutor(event) {
  event.preventDefault();
  const question = els.questionInput.value.trim();
  if (!question || busy) return;

  const pageNumber = selection?.pageNumber || nearestVisiblePage();
  setBusy(true);
  els.questionInput.value = "";

  state.messages.push({ id: crypto.randomUUID(), role: "user", content: question });
  const pending = { id: crypto.randomUUID(), role: "assistant", content: "Đang tra bài giảng…", pending: true };
  state.messages.push(pending);
  renderChat({ scrollToEnd: true });
  trackEvent("ask_question", { pageNumber, hasSelection: Boolean(selection), question });

  try {
    const data = await postJson("/api/tutor/answer", {
      lessonId: lesson.id,
      pageNumber,
      question,
      selectedText: selection?.type === "text" ? selection.text : "",
      ...(selection?.type === "region"
        ? { regionImage: selection.dataUrl, selectedRegion: selection.region }
        : {}),
    });

    replaceMessage(pending.id, {
      id: pending.id,
      role: "assistant",
      content: data.answer,
      kind: data.kind,
      confidence: data.confidence,
      citation: data.citation,
      retrievedPages: data.retrievedPages,
    });
    trackEvent("tutor_answer", {
      pageNumber: data.citation?.pageNumber,
      kind: data.kind,
      confidence: data.confidence,
      citationVerified: data.citation?.verified,
    });
  } catch (error) {
    replaceMessage(pending.id, {
      id: pending.id,
      role: "assistant",
      content: `Không gọi được AI: ${error.message}`,
      kind: "error",
      confidence: "low",
    });
    trackEvent("tutor_error", { message: error.message });
  }

  setBusy(false);
  saveState();
  renderChat({ scrollToEnd: true });
  renderSummary();
}

function replaceMessage(id, next) {
  const index = state.messages.findIndex((message) => message.id === id);
  if (index >= 0) state.messages[index] = next;
  else state.messages.push(next);
}

function setBusy(value) {
  busy = value;
  els.askBtn.disabled = value;
  els.questionInput.disabled = value;
}

function nearestVisiblePage() {
  const viewerTop = els.viewer.getBoundingClientRect().top;
  let best = lesson.pages[0].pageNumber;
  let bestDistance = Infinity;
  els.viewer.querySelectorAll(".slide").forEach((slide) => {
    const distance = Math.abs(slide.getBoundingClientRect().top - viewerTop);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = Number(slide.dataset.page);
    }
  });
  return best;
}

/* ── Chat rendering ──────────────────────────────────────── */

function renderChat({ scrollToEnd = false } = {}) {
  const previousScroll = els.chat.scrollTop;

  if (state.messages.length === 0) {
    els.chat.innerHTML = `<p class="hint">Bôi đen một đoạn trên slide, rồi đặt câu hỏi.<br />AI chỉ trả lời từ nội dung bài giảng và luôn kèm trang nguồn.</p>`;
    return;
  }

  els.chat.innerHTML = "";
  state.messages.forEach((message) => {
    els.chat.appendChild(renderMessage(message));
    state.quizzes
      .filter((quiz) => quiz.sourceMessageId === message.id)
      .forEach((quiz) => els.chat.appendChild(renderQuizCard(quiz)));
  });

  els.chat.scrollTop = scrollToEnd ? els.chat.scrollHeight : previousScroll;
}

function renderMessage(message) {
  const wrapper = document.createElement("div");
  wrapper.className = `msg ${message.role}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (message.kind === "error") bubble.classList.add("is-error");
  if (["insufficient", "out_of_scope", "needs_clarification"].includes(message.kind)) {
    bubble.classList.add("is-refusal");
  }

  const body = document.createElement("div");
  body.textContent = message.content;
  bubble.appendChild(body);

  if (message.citation?.pageNumber) {
    const citation = document.createElement("div");
    citation.className = "citation";
    const quote = message.citation.quote ? ` — “${message.citation.quote}”` : "";
    const region = message.citation.regionLabel ? ` · ${message.citation.regionLabel}` : "";
    citation.innerHTML = `Nguồn: <strong>trang ${message.citation.pageNumber}</strong>${escapeHtml(quote)}${escapeHtml(region)}`;
    bubble.appendChild(citation);
  }

  if (message.role === "assistant" && !message.pending) {
    const flags = document.createElement("div");
    flags.className = "flags";
    if (message.confidence) flags.appendChild(chip(message.confidence, `độ tin: ${message.confidence}`));
    // Only a real answer makes a grounding claim — a refusal has nothing to verify.
    if (message.citation && message.kind === "answer") {
      flags.appendChild(
        message.citation.verified
          ? chip("verified", "nguồn đã đối chiếu")
          : chip("unverified", "chưa đối chiếu được nguồn")
      );
    }
    if (message.kind === "out_of_scope") flags.appendChild(chip("low", "③ ngoài phạm vi"));
    if (message.kind === "insufficient") flags.appendChild(chip("low", "① bài giảng không đủ căn cứ"));
    if (message.kind === "needs_clarification") flags.appendChild(chip("low", "② cần hỏi lại"));
    // Cau tra loi doc tu pixel: khong doi chieu duoc voi text bai giang. Noi that
    // muc kiem chung thay vi de nguyen chip "chua doi chieu duoc nguon" gay hieu nham.
    if (message.kind === "visual") flags.appendChild(chip("visual", "đọc từ hình — chưa đối chiếu được với text"));
    if (flags.children.length > 0) bubble.appendChild(flags);

    if (message.kind === "answer") bubble.appendChild(renderAnswerActions(message));
  }

  wrapper.appendChild(bubble);
  return wrapper;
}

function renderAnswerActions(message) {
  const actions = document.createElement("div");
  actions.className = "actions";

  const already = state.quizzes.some((quiz) => quiz.sourceMessageId === message.id);
  const quizBtn = document.createElement("button");
  quizBtn.type = "button";
  quizBtn.textContent = already ? "Tạo thêm micro quiz" : "Kiểm tra mức độ hiểu";
  quizBtn.addEventListener("click", () => generateQuiz(message));
  actions.appendChild(quizBtn);

  const rephrase = document.createElement("button");
  rephrase.type = "button";
  rephrase.className = "secondary";
  rephrase.textContent = "Hỏi lại rõ hơn";
  rephrase.addEventListener("click", () => {
    els.questionInput.value = `Giải thích rõ hơn: `;
    els.questionInput.focus();
  });
  actions.appendChild(rephrase);

  return actions;
}

function chip(kind, label) {
  const span = document.createElement("span");
  span.className = `chip ${kind}`;
  span.textContent = label;
  return span;
}

/* ── Micro quiz ──────────────────────────────────────────── */

async function generateQuiz(message) {
  if (busy) return;
  setBusy(true);

  const placeholder = {
    id: crypto.randomUUID(),
    sourceMessageId: message.id,
    pageNumber: message.citation?.pageNumber || 0,
    includeInFinal: true,
    pending: true,
    questions: [],
  };
  state.quizzes.push(placeholder);
  renderChat({ scrollToEnd: true });

  try {
    const data = await postJson("/api/tutor/quiz", {
      sourceAnswer: message.content,
      pageNumber: message.citation?.pageNumber || 0,
      questionCount: 2,
    });
    Object.assign(placeholder, { pending: false, questions: data.questions, createdAt: new Date().toISOString() });
    trackEvent("quiz_generated", { quizId: placeholder.id, pageNumber: placeholder.pageNumber, count: data.questions.length });
  } catch (error) {
    Object.assign(placeholder, { pending: false, failed: true, error: error.message });
    trackEvent("quiz_error", { message: error.message });
  }

  setBusy(false);
  saveState();
  renderChat({ scrollToEnd: true });
  renderSummary();
}

function renderQuizCard(quiz) {
  const card = document.createElement("article");
  card.className = "quiz-card";

  const heading = document.createElement("h3");
  heading.textContent = quiz.pageNumber ? `Micro quiz · trang ${quiz.pageNumber}` : "Micro quiz";
  card.appendChild(heading);

  if (quiz.pending) {
    card.appendChild(hint("Đang tạo câu hỏi kiểm tra…"));
    return card;
  }

  if (quiz.failed) {
    const failure = hint(`Không tạo được quiz: ${quiz.error}`);
    card.appendChild(failure);
    return card;
  }

  quiz.questions.forEach((question, index) => card.appendChild(renderQuestion(quiz, question, index)));
  card.appendChild(renderQuizFooter(quiz));
  return card;
}

function renderQuestion(quiz, question, index) {
  const block = document.createElement("div");
  block.className = "q-block";

  const prompt = document.createElement("p");
  prompt.className = "q-prompt";
  prompt.textContent = `Câu ${index + 1}. ${question.prompt}`;
  block.appendChild(prompt);

  const type = document.createElement("span");
  type.className = "q-type";
  type.textContent = question.type === "short_answer" ? "Tự luận ngắn" : "Trắc nghiệm";
  block.appendChild(type);

  const answered = question.answeredAt != null;

  if (question.type === "short_answer") {
    block.appendChild(renderShortAnswer(quiz, question, answered));
  } else {
    question.options.forEach((option, optionIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "q-option";
      button.textContent = option;
      button.disabled = answered;
      if (answered) {
        if (optionIndex === question.correctOptionIndex) button.classList.add("correct");
        else if (optionIndex === question.learnerAnswerIndex) button.classList.add("wrong");
      }
      button.addEventListener("click", () => answerMcq(quiz, question, optionIndex));
      block.appendChild(button);
    });
  }

  if (answered) {
    const feedback = document.createElement("p");
    feedback.className = `q-feedback ${question.isCorrect ? "correct" : "wrong"}`;
    const verdict = question.isCorrect ? "Đúng." : "Chưa đúng.";
    const detail = question.feedback ? ` ${question.feedback}` : "";
    feedback.textContent = `${verdict}${detail} ${question.explanation}`;
    block.appendChild(feedback);
  }

  return block;
}

function renderShortAnswer(quiz, question, answered) {
  const wrap = document.createElement("div");
  wrap.className = "q-short";

  const textarea = document.createElement("textarea");
  textarea.placeholder = "Trả lời ngắn bằng lời của bạn…";
  textarea.value = question.learnerAnswer || question.draft || "";
  textarea.disabled = answered;
  textarea.addEventListener("input", () => {
    question.draft = textarea.value;
  });
  wrap.appendChild(textarea);

  if (!answered) {
    const submit = document.createElement("button");
    submit.type = "button";
    submit.textContent = "Nộp câu trả lời";
    submit.addEventListener("click", async () => {
      const value = textarea.value.trim();
      if (!value) return;
      submit.disabled = true;
      submit.textContent = "Đang chấm…";
      await answerShort(quiz, question, value);
    });
    wrap.appendChild(submit);
  }

  return wrap;
}

function answerMcq(quiz, question, optionIndex) {
  if (question.answeredAt) return;
  question.learnerAnswerIndex = optionIndex;
  question.isCorrect = optionIndex === question.correctOptionIndex;
  question.answeredAt = new Date().toISOString();
  recordAnswer(quiz, question);
}

async function answerShort(quiz, question, value) {
  question.learnerAnswer = value;
  delete question.draft;

  try {
    const data = await postJson("/api/tutor/grade", {
      prompt: question.prompt,
      referenceAnswer: question.referenceAnswer || "",
      learnerAnswer: value,
      pageNumber: question.pageNumber,
    });
    question.isCorrect = data.isCorrect;
    question.feedback = data.feedback;
  } catch (error) {
    question.isCorrect = false;
    question.feedback = `Chưa chấm được tự động (${error.message}).`;
  }

  question.answeredAt = new Date().toISOString();
  recordAnswer(quiz, question);
}

// This is the record that makes every downstream metric measurable:
// correctness is stored per question, attributed to a slide.
function recordAnswer(quiz, question) {
  saveState();
  renderChat();
  renderSummary();
  trackEvent("quiz_answered", {
    quizId: quiz.id,
    questionId: question.id,
    questionType: question.type,
    pageNumber: question.pageNumber || quiz.pageNumber,
    isCorrect: question.isCorrect,
  });
}

function renderQuizFooter(quiz) {
  const foot = document.createElement("div");
  foot.className = "quiz-foot";
  const locked = isFinalLocked();

  const rateRow = document.createElement("div");
  rateRow.className = "rate-row";
  rateRow.appendChild(label("Chất lượng câu hỏi:"));

  [
    ["useful", "Hữu ích"],
    ["not_useful", "Chưa hữu ích"],
  ].forEach(([value, text]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.classList.toggle("is-on", quiz.rating === value);
    button.addEventListener("click", () => rateQuiz(quiz, value));
    rateRow.appendChild(button);
  });
  foot.appendChild(rateRow);

  if (quiz.rating === "not_useful") {
    const select = document.createElement("select");
    select.className = "reason-select";
    select.innerHTML = `<option value="">— Lý do (tuỳ chọn) —</option>`;
    RATING_REASONS.forEach((reason) => {
      const option = document.createElement("option");
      option.value = reason;
      option.textContent = reason;
      option.selected = quiz.ratingReason === reason;
      select.appendChild(option);
    });
    select.addEventListener("change", () => {
      quiz.ratingReason = select.value;
      saveState();
      trackEvent("quiz_rated", { quizId: quiz.id, rating: quiz.rating, reason: select.value });
    });
    foot.appendChild(select);
  }

  const toggleRow = document.createElement("label");
  toggleRow.className = "toggle-row";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = quiz.includeInFinal;
  checkbox.disabled = locked;
  checkbox.addEventListener("change", () => {
    quiz.includeInFinal = checkbox.checked;
    saveState();
    renderSummary();
    trackEvent("quiz_include_toggled", { quizId: quiz.id, includeInFinal: checkbox.checked });
  });
  toggleRow.append(checkbox, document.createTextNode("Đưa lại các câu hỏi này vào quiz tổng hợp cuối bài"));
  foot.appendChild(toggleRow);

  if (locked) {
    const note = document.createElement("p");
    note.className = "locked-note";
    note.textContent = "Quiz tổng hợp đã bắt đầu — danh sách câu hỏi đã khoá cho lần làm này.";
    foot.appendChild(note);
  }

  return foot;
}

function rateQuiz(quiz, rating) {
  quiz.rating = quiz.rating === rating ? undefined : rating;
  if (quiz.rating !== "not_useful") delete quiz.ratingReason;
  saveState();
  renderChat();
  trackEvent("quiz_rated", { quizId: quiz.id, rating: quiz.rating || "cleared", reason: quiz.ratingReason || "" });
}

/* ── Final quiz ──────────────────────────────────────────── */

function isFinalLocked() {
  return Boolean(state.finalAttempt && !state.finalAttempt.submittedAt);
}

function buildPersonalisedSet() {
  const candidates = state.quizzes
    .filter((quiz) => quiz.includeInFinal && !quiz.failed && !quiz.pending)
    .flatMap((quiz) => quiz.questions.map((question) => ({ ...question, quizId: quiz.id })));

  // Priority order from PRD §9.2: wrong answers first, then unattempted, then the rest.
  const rank = (question) => {
    if (question.answeredAt && question.isCorrect === false) return 0;
    if (!question.answeredAt) return 1;
    return 2;
  };

  const ordered = candidates.sort((a, b) => rank(a) - rank(b));
  const kept = [];
  for (const question of ordered) {
    if (kept.length >= MAX_PERSONALISED) break;
    if (kept.some((existing) => similarity(existing.prompt, question.prompt) >= DUPLICATE_THRESHOLD)) continue;
    kept.push(question);
  }
  return kept;
}

function openFinalQuiz() {
  if (!state.finalAttempt || state.finalAttempt.submittedAt) {
    const personalised = buildPersonalisedSet();
    state.finalAttempt = {
      startedAt: new Date().toISOString(),
      submittedAt: null,
      base: (lesson.baseQuestions || []).map((question) => ({ ...question, section: "A" })),
      personalised: personalised.map((question) => ({ ...question, section: "B" })),
      responses: {},
    };
    saveState();
    trackEvent("final_quiz_started", {
      baseCount: state.finalAttempt.base.length,
      personalisedCount: state.finalAttempt.personalised.length,
    });
  }

  els.finalOverlay.hidden = false;
  renderFinalQuiz();
  renderChat();
}

function renderFinalQuiz() {
  const attempt = state.finalAttempt;
  els.finalBody.innerHTML = "";

  const all = [...attempt.base, ...attempt.personalised];
  if (all.length === 0) {
    els.finalBody.appendChild(hint("Chưa có câu hỏi nào cho quiz tổng hợp."));
    return;
  }

  if (attempt.submittedAt) {
    els.finalBody.appendChild(renderFinalScore(attempt, all));
    return;
  }

  appendSection("Phần A · Câu hỏi nền do giảng viên chuẩn bị", attempt.base);
  appendSection(`Phần B · Câu hỏi cá nhân hoá từ micro quiz (${attempt.personalised.length})`, attempt.personalised);

  const submit = document.createElement("button");
  submit.className = "final-btn";
  submit.type = "button";
  submit.style.margin = "0";
  submit.textContent = "Nộp quiz tổng hợp";
  submit.addEventListener("click", () => submitFinalQuiz(submit));
  els.finalBody.appendChild(submit);

  function appendSection(title, questions) {
    const heading = document.createElement("p");
    heading.className = "final-section-title";
    heading.textContent = title;
    els.finalBody.appendChild(heading);

    if (questions.length === 0) {
      els.finalBody.appendChild(hint("Không có câu hỏi trong phần này."));
      return;
    }

    questions.forEach((question, index) => {
      const block = document.createElement("div");
      block.className = "q-block";
      const prompt = document.createElement("p");
      prompt.className = "q-prompt";
      prompt.textContent = `${index + 1}. ${question.prompt}`;
      block.appendChild(prompt);

      const key = finalKey(question);
      if (question.type === "short_answer") {
        const textarea = document.createElement("textarea");
        textarea.placeholder = "Trả lời ngắn…";
        textarea.value = attempt.responses[key]?.text || "";
        textarea.addEventListener("input", () => {
          attempt.responses[key] = { text: textarea.value };
        });
        const wrap = document.createElement("div");
        wrap.className = "q-short";
        wrap.appendChild(textarea);
        block.appendChild(wrap);
      } else {
        question.options.forEach((option, optionIndex) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "q-option";
          button.textContent = option;
          // "selected", not "correct" — nothing is graded until submit.
          if (attempt.responses[key]?.optionIndex === optionIndex) button.classList.add("selected");
          button.addEventListener("click", () => {
            attempt.responses[key] = { optionIndex };
            saveState();
            renderFinalQuiz();
          });
          block.appendChild(button);
        });
      }
      els.finalBody.appendChild(block);
    });
  }
}

async function submitFinalQuiz(button) {
  const attempt = state.finalAttempt;
  const all = [...attempt.base, ...attempt.personalised];
  button.disabled = true;
  button.textContent = "Đang chấm…";

  for (const question of all) {
    const key = finalKey(question);
    const response = attempt.responses[key];

    if (question.type === "short_answer") {
      const value = response?.text?.trim();
      if (!value) {
        attempt.responses[key] = { text: "", isCorrect: false, feedback: "Chưa trả lời." };
        continue;
      }
      try {
        const data = await postJson("/api/tutor/grade", {
          prompt: question.prompt,
          referenceAnswer: question.referenceAnswer || "",
          learnerAnswer: value,
          pageNumber: question.pageNumber,
        });
        attempt.responses[key] = { text: value, isCorrect: data.isCorrect, feedback: data.feedback };
      } catch (error) {
        attempt.responses[key] = { text: value, isCorrect: false, feedback: `Chưa chấm được (${error.message}).` };
      }
    } else {
      const isCorrect = response?.optionIndex === question.correctOptionIndex;
      attempt.responses[key] = { ...(response || {}), isCorrect };
    }
  }

  attempt.submittedAt = new Date().toISOString();
  const correct = all.filter((question) => attempt.responses[finalKey(question)]?.isCorrect).length;
  saveState();
  renderFinalQuiz();
  renderChat();
  trackEvent("final_quiz_submitted", { total: all.length, correct, score: Math.round((correct / all.length) * 100) });
}

function renderFinalScore(attempt, all) {
  const container = document.createElement("div");
  const correct = all.filter((question) => attempt.responses[finalKey(question)]?.isCorrect).length;

  const score = document.createElement("div");
  score.className = "final-score";
  score.innerHTML = `<strong>${correct} / ${all.length}</strong> câu đúng · Phần A ${attempt.base.length} câu · Phần B ${attempt.personalised.length} câu cá nhân hoá`;
  container.appendChild(score);

  const heading = document.createElement("p");
  heading.className = "final-section-title";
  heading.textContent = "Nội dung nên xem lại";
  container.appendChild(heading);

  const wrong = all.filter((question) => !attempt.responses[finalKey(question)]?.isCorrect);
  if (wrong.length === 0) {
    container.appendChild(hint("Bạn trả lời đúng tất cả. Không có nội dung cần xem lại."));
  } else {
    const list = document.createElement("ul");
    list.className = "review-list";
    wrong.forEach((question) => {
      const item = document.createElement("li");
      const response = attempt.responses[finalKey(question)];
      const page = question.pageNumber ? ` (trang ${question.pageNumber})` : "";
      item.textContent = `${question.prompt}${page} — ${question.explanation}${response?.feedback ? ` ${response.feedback}` : ""}`;
      list.appendChild(item);
    });
    container.appendChild(list);
  }

  const again = document.createElement("button");
  again.className = "final-btn";
  again.type = "button";
  again.style.margin = "0";
  again.textContent = "Làm lại với danh sách câu hỏi mới";
  again.addEventListener("click", () => {
    state.finalAttempt = null;
    saveState();
    openFinalQuiz();
  });
  container.appendChild(again);

  return container;
}

function finalKey(question) {
  return `${question.section}:${question.id}`;
}

/* ── Summary + persistence ───────────────────────────────── */

function renderSummary() {
  const answered = allAnsweredQuestions();
  const correct = answered.filter((question) => question.isCorrect).length;

  els.statQuestions.textContent = String(state.messages.filter((message) => message.role === "user").length);
  els.statQuizzes.textContent = String(state.quizzes.filter((quiz) => !quiz.pending && !quiz.failed).length);
  els.statAccuracy.textContent = `${correct} / ${answered.length}`;
  els.statIncluded.textContent = String(buildPersonalisedSet().length);
}

function allAnsweredQuestions() {
  return state.quizzes.flatMap((quiz) => (quiz.questions || []).filter((question) => question.answeredAt));
}

function resetSession() {
  state = { sessionId: crypto.randomUUID(), messages: [], quizzes: [], finalAttempt: null };
  selection = null;
  els.finalOverlay.hidden = true;
  saveState();
  renderSelection();
  renderChat();
  renderSummary();
  trackEvent("session_reset", {});
}

// Each lesson keeps its own session — switching lessons must not mix pageNumbers
// or quiz state from a different lesson's content into this one.
function storageKeyFor(lessonId) {
  return `${STORAGE_PREFIX}:${lessonId || "default"}`;
}

function loadState(lessonId) {
  const fallback = { sessionId: crypto.randomUUID(), messages: [], quizzes: [], finalAttempt: null };
  try {
    const stored = JSON.parse(localStorage.getItem(storageKeyFor(lessonId)) || "null");
    if (!stored || typeof stored !== "object") return fallback;
    return {
      sessionId: stored.sessionId || fallback.sessionId,
      messages: Array.isArray(stored.messages) ? stored.messages.filter((message) => !message.pending) : [],
      quizzes: Array.isArray(stored.quizzes) ? stored.quizzes.filter((quiz) => !quiz.pending) : [],
      finalAttempt: stored.finalAttempt || null,
    };
  } catch {
    return fallback;
  }
}

function saveState() {
  if (!lesson) return;
  try {
    localStorage.setItem(storageKeyFor(lesson.id), JSON.stringify(state));
  } catch {
    /* storage full or blocked — the session still works in memory */
  }
}

// Fire-and-forget: analytics must never block or break the learner flow.
function trackEvent(type, payload) {
  const event = { type, sessionId: state.sessionId, lessonId: lesson?.id || null, at: new Date().toISOString(), ...payload };
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ events: [event] }),
    keepalive: true,
  }).catch(() => {});
}

/* ── Helpers ─────────────────────────────────────────────── */

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

function similarity(a, b) {
  const left = tokens(a);
  const right = tokens(b);
  if (left.size === 0 || right.size === 0) return 0;
  let shared = 0;
  for (const token of left) if (right.has(token)) shared += 1;
  return shared / Math.min(left.size, right.size);
}

function tokens(value) {
  return new Set(
    String(value)
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((token) => token.length > 2)
  );
}

function hint(text) {
  const paragraph = document.createElement("p");
  paragraph.className = "hint";
  paragraph.textContent = text;
  return paragraph;
}

function label(text) {
  const span = document.createElement("span");
  span.textContent = text;
  return span;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}
