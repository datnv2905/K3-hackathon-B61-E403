import { createSessionChip, requireRole } from "/auth.js";

const els = {
  lessonSelect: document.querySelector("#lessonSelect"),
  refreshBtn: document.querySelector("#refreshBtn"),
  autoRefreshToggle: document.querySelector("#autoRefreshToggle"),
  overviewCards: document.querySelector("#overviewCards"),
  pageTableBody: document.querySelector("#pageTableBody"),
  pageTable: document.querySelector("#pageTable"),
  detailPanel: document.querySelector("#detailPanel"),
  detailTitle: document.querySelector("#detailTitle"),
  closeDetailBtn: document.querySelector("#closeDetailBtn"),
  commonQuestionsList: document.querySelector("#commonQuestionsList"),
  quizQualityKv: document.querySelector("#quizQualityKv"),
  notUsefulReasonsList: document.querySelector("#notUsefulReasonsList"),
  suggestBtn: document.querySelector("#suggestBtn"),
  suggestionHint: document.querySelector("#suggestionHint"),
  suggestionCard: document.querySelector("#suggestionCard"),
};

let lessons = [];
let overview = null;
let selectedPage = null;
let sortKey = "questionCount";
let sortDir = -1;

init();

async function init() {
  // Cổng điều hướng demo: học viên vào đây sẽ bị đẩy về màn học.
  const session = requireRole("admin");
  if (!session) return;
  document.querySelector(".admin-topbar")?.append(createSessionChip(session));

  bindEvents();
  await loadLessonList();
  const startId = localStorage.getItem("vlearn-admin-lesson") || lessons[0]?.id;
  if (startId) await loadOverview(startId);
  startAutoRefresh();
}

/* ── Auto-refresh ────────────────────────────────────────── */

// Để mở màn giảng viên cạnh màn học viên và thấy số liệu nhúc nhích ngay khi học
// viên thao tác, khỏi phải bấm "Làm mới" mỗi lần.
//
// CỐ Ý không bỏ qua khi document.hidden: nếu để hai màn ở hai TAB cùng cửa sổ thì
// tab admin luôn ẩn, bỏ qua là nó không bao giờ làm mới — đúng ngay kịch bản cần
// dùng. Trình duyệt vốn đã tự bóp interval của tab nền nên không cần tự chặn.
// Bù lại, làm mới ngay khi tab được nhìn lại để số liệu không bị cũ.
const AUTO_REFRESH_MS = 5000;
let autoRefreshTimer = null;

function startAutoRefresh() {
  stopAutoRefresh();
  if (!els.autoRefreshToggle?.checked) return;
  autoRefreshTimer = setInterval(() => {
    loadOverview(els.lessonSelect.value, { quiet: true });
  }, AUTO_REFRESH_MS);
}

function refreshOnVisible() {
  if (!document.hidden && els.autoRefreshToggle?.checked) {
    loadOverview(els.lessonSelect.value, { quiet: true });
  }
}

function stopAutoRefresh() {
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);
  autoRefreshTimer = null;
}

function bindEvents() {
  els.refreshBtn.addEventListener("click", () => loadOverview(els.lessonSelect.value));
  els.autoRefreshToggle?.addEventListener("change", startAutoRefresh);
  document.addEventListener("visibilitychange", refreshOnVisible);
  const toggle = document.querySelector("#toggleAdminSidebarBtn");
  const apply = (collapsed) => {
    document.body.classList.toggle("admin-sidebar-collapsed", collapsed);
    toggle.textContent = collapsed ? "›" : "‹";
    toggle.title = `${collapsed ? "Mở lại" : "Thu gọn"} bảng bên trái`;
    toggle.setAttribute("aria-label", toggle.title);
  };
  apply(localStorage.getItem("vlearn-admin-sidebar") === "collapsed");
  toggle?.addEventListener("click", () => {
    const collapsed = !document.body.classList.contains("admin-sidebar-collapsed");
    localStorage.setItem("vlearn-admin-sidebar", collapsed ? "collapsed" : "open");
    apply(collapsed);
  });
  els.lessonSelect.addEventListener("change", () => {
    localStorage.setItem("vlearn-admin-lesson", els.lessonSelect.value);
    loadOverview(els.lessonSelect.value);
  });
  els.closeDetailBtn.addEventListener("click", closeDetail);
  els.suggestBtn.addEventListener("click", generateSuggestion);
  els.pageTable.querySelectorAll("th[data-sort]").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      sortDir = sortKey === key ? -sortDir : -1;
      sortKey = key;
      renderPageTable();
    });
  });
}

async function loadLessonList() {
  try {
    const response = await fetch("/api/lessons");
    lessons = await response.json();
  } catch {
    lessons = [];
  }
  els.lessonSelect.innerHTML = lessons
    .map((entry) => `<option value="${entry.id}">${escapeHtml(entry.title)}</option>`)
    .join("");
}

// quiet = true: dùng cho auto-refresh. Không đóng panel chi tiết đang mở và không
// nháy "Đang tải…" — nếu không thì cứ vài giây màn hình lại giật một lần, xem
// song song với màn học viên sẽ rất khó chịu. Lỗi cũng nuốt im để một lần mạng
// chập không xoá mất số liệu đang hiển thị.
async function loadOverview(lessonId, { quiet = false } = {}) {
  if (!lessonId) return;
  els.lessonSelect.value = lessonId;
  if (!quiet) {
    closeDetail();
    els.overviewCards.innerHTML = `<p class="hint">Đang tải…</p>`;
    els.pageTableBody.innerHTML = "";
  }

  try {
    const response = await fetch(`/api/admin/overview?lessonId=${encodeURIComponent(lessonId)}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    overview = await response.json();
  } catch (error) {
    if (quiet) return;
    els.overviewCards.innerHTML = `<p class="hint">Không tải được dữ liệu: ${escapeHtml(error.message)}</p>`;
    overview = null;
    return;
  }

  renderOverviewCards();
  renderPageTable();
  // Vẽ lại panel chi tiết cho khớp số liệu mới. Bỏ qua khi đang hiện một smart
  // suggestion vừa tạo — openDetail() ẩn thẻ suggestion đi, auto-refresh mà gọi
  // vào sẽ xoá mất kết quả người dùng vừa bỏ công (và tiền) tạo ra.
  if (selectedPage != null && els.suggestionCard.hidden) openDetail(selectedPage);
}

function renderOverviewCards() {
  const pct = (value) => `${Math.round(value * 100)}%`;
  const cards = [
    ["Số người học (session)", overview.totalLearners],
    ["Tổng câu hỏi", overview.totalQuestions],
    ["Tổng lượt bôi đen", overview.totalHighlights],
    ["Tổng micro quiz", overview.totalMicroQuizzes],
    ["Độ chính xác quiz", pct(overview.quizAccuracy)],
    ["Tỷ lệ đánh giá hữu ích", pct(overview.ratingUsefulRate)],
    ["Tỷ lệ opt-out", pct(overview.optOutRate)],
  ];

  els.overviewCards.innerHTML = cards
    .map(([label, value]) => `<div class="admin-stat"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
}

function renderPageTable() {
  if (!overview) return;
  const rows = [...overview.pages].map((page) => ({
    ...page,
    accuracy: page.quizAttempts > 0 ? page.quizCorrect / page.quizAttempts : null,
  }));

  rows.sort((a, b) => {
    const av = a[sortKey] ?? -1;
    const bv = b[sortKey] ?? -1;
    return (av - bv) * sortDir;
  });

  els.pageTableBody.innerHTML = "";
  rows.forEach((page) => {
    const tr = document.createElement("tr");
    tr.className = "admin-row" + (selectedPage === page.pageNumber ? " is-selected" : "");
    tr.innerHTML = `
      <td>${page.pageNumber}</td>
      <td>${page.questionCount}</td>
      <td>${page.highlightCount}</td>
      <td>${page.microQuizCount}</td>
      <td>${page.accuracy == null ? "—" : `${Math.round(page.accuracy * 100)}%`}</td>
      <td>${page.ratingUseful}</td>
      <td>${page.optOutCount}</td>
    `;
    tr.addEventListener("click", () => openDetail(page.pageNumber));
    els.pageTableBody.appendChild(tr);
  });
}

function openDetail(pageNumber) {
  selectedPage = pageNumber;
  const page = overview.pages.find((entry) => entry.pageNumber === pageNumber);
  if (!page) return;

  els.detailPanel.hidden = false;
  els.detailTitle.textContent = `Trang ${pageNumber}`;
  renderPageTable();

  els.commonQuestionsList.innerHTML = page.commonQuestions.length
    ? page.commonQuestions.map((q) => `<li>${escapeHtml(q.text)} <span class="admin-count">×${q.count}</span></li>`).join("")
    : `<li class="hint">Chưa có câu hỏi nào trên trang này.</li>`;

  els.quizQualityKv.innerHTML = `
    <div><dt>Lượt làm quiz</dt><dd>${page.quizAttempts}</dd></div>
    <div><dt>Trả lời đúng</dt><dd>${page.quizCorrect}</dd></div>
    <div><dt>Đánh giá hữu ích</dt><dd>${page.ratingUseful}</dd></div>
    <div><dt>Đánh giá chưa hữu ích</dt><dd>${page.ratingNotUseful}</dd></div>
    <div><dt>Opt-out khỏi quiz tổng hợp</dt><dd>${page.optOutCount}</dd></div>
  `;

  els.notUsefulReasonsList.innerHTML = page.notUsefulReasons.length
    ? page.notUsefulReasons
        .map((r) => `<li>${escapeHtml(r.reason)} <span class="admin-count">×${r.count}</span></li>`)
        .join("")
    : `<li class="hint">Chưa có lý do "chưa hữu ích" nào.</li>`;

  els.suggestionCard.hidden = true;
  els.suggestionHint.textContent = "";
  const hasSignal = page.questionCount >= 2 || page.highlightCount >= 2;
  els.suggestBtn.disabled = !hasSignal;
  if (!hasSignal) {
    els.suggestionHint.textContent = "Chưa đủ tín hiệu (cần ≥2 câu hỏi hoặc ≥2 lượt bôi đen) để tạo smart suggestion.";
  }
}

function closeDetail() {
  selectedPage = null;
  els.detailPanel.hidden = true;
  renderPageTable();
}

async function generateSuggestion() {
  if (!overview || selectedPage == null) return;
  els.suggestBtn.disabled = true;
  els.suggestionHint.textContent = "Đang gọi AI…";
  els.suggestionCard.hidden = true;

  try {
    const response = await fetch("/api/admin/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: overview.lessonId, pageNumber: selectedPage }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);

    els.suggestionHint.textContent = "";
    els.suggestionCard.hidden = false;
    els.suggestionCard.innerHTML = `
      <span class="admin-suggestion-tag">${escapeHtml(data.issueType)}</span>
      <p class="admin-suggestion-insight">${escapeHtml(data.insight)}</p>
      <p class="admin-suggestion-reco"><strong>Đề xuất:</strong> ${escapeHtml(data.recommendation)}</p>
      <dl class="admin-kv admin-evidence">
        <div><dt>Số người tương tác với trang</dt><dd>${data.evidence.affectedLearners}</dd></div>
        <div><dt>Tỷ lệ trên tổng người học</dt><dd>${Math.round(data.evidence.affectedRate * 100)}%</dd></div>
        <div><dt>Tỷ lệ trả lời sai</dt><dd>${Math.round(data.evidence.wrongRate * 100)}%</dd></div>
      </dl>
      ${
        data.evidence.topQuestions.length
          ? `<p class="admin-evidence-questions"><strong>Câu hỏi lặp lại:</strong> ${data.evidence.topQuestions.map(escapeHtml).join(" · ")}</p>`
          : ""
      }
    `;
  } catch (error) {
    els.suggestionHint.textContent = `Không tạo được: ${error.message}`;
  }

  els.suggestBtn.disabled = false;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}
