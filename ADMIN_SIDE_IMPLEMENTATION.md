# Admin-Side Implementation Doc

## Goal

Build the instructor-facing first slice of the Slide + AI learning system — the counterpart to `USER_SIDE_IMPLEMENTATION.md`, which covers the learner side already shipped.

The slice, in the required one-sentence format — **một người dùng · một công việc · một quyết định AI · một kết quả**:

> **Giảng viên đang xem lại một buổi giảng sau khi học viên đã dùng AI tutor** · **cần biết trang nào trong bài đang thực sự gây khó hiểu, không phải đoán** · **AI quyết định: tổng hợp tín hiệu thật trên từng trang (số câu hỏi, số lượt bôi đen, tỷ lệ trả lời sai) rồi viết một nhận định + đề xuất cải thiện cho từng trang đáng ưu tiên** · **giảng viên có một danh sách ưu tiên kèm bằng chứng cụ thể, dùng được ngay để quyết định sửa trang nào trước.**

English gloss: *an instructor reviewing a lecture after learners have used the AI tutor needs to know which pages are actually causing confusion; the AI aggregates real per-page signals and writes a grounded insight + recommendation for the pages that cross a threshold; the instructor gets an evidence-backed priority list instead of a guess.*

This maps to PRD §12 (Smart Suggestion Engine) and §13 (Admin Dashboard) — not §14–16 (diagram regeneration, approve/reject workflow, PDF versioning), which are out of scope for this slice. See Non-goals below.

Non-goals for this slice (the build must not violate them):

1. No AI-generated diagram images (PRD §14) — the suggestion is text only: what's wrong and what to try, not a redrawn visual.
2. No approve/regenerate/reject workflow (PRD §15) — admin only *views* suggestions in this slice, mirroring PRD §13.4's own scoping note ("Admin chỉ xem dữ liệu; chưa cần màn hình chỉnh sửa").
3. No PDF export or version switching (PRD §16) — there is no concept of a "new version" in this slice.
4. No pixel-coordinate heatmap. **Important scoping consequence:** the learner app no longer has a "khoanh vùng" (region/rectangle) mode — see `codebase/MOCKS.md` and the conversation that removed it. There is no x/y region data to heat-map. "Vùng tương tác" becomes **per-page highlighted-passage frequency**, not a spatial overlay. If PRD §13.3's literal heatmap is wanted later, region selection would need to come back first — flagging this rather than quietly building something PRD didn't ask for.
5. No admin authentication — same posture as the learner side (no accounts), reached via its own route.

## Required fix before this slice can start

**Events are not currently tagged with `lessonId`.** `codebase/public/app.js`'s `trackEvent()` sends `{ type, sessionId, at, ...payload }` — no lesson identifier. Since the app now serves two lessons (the Day 1 PDF and the Day 6 mock) with independent page numbering, `pageNumber: 3` is ambiguous across lessons without it. Every per-page aggregation in this doc depends on this being fixed first:

```js
// codebase/public/app.js — trackEvent()
function trackEvent(type, payload) {
  const event = { type, sessionId: state.sessionId, lessonId: lesson?.id || null, at: new Date().toISOString(), ...payload };
  ...
}
```

This is Implementation Step 1 below, not a separate task — the dashboard is not buildable correctly without it, and every event already logged in `codebase/var/events.jsonl` before this fix lacks the field (existing local dev logs should be treated as disposable, not backfilled).

## First Slice

### Must Work

- Read `codebase/var/events.jsonl`, filter by `lessonId`, and compute:
  - Overview counts: total questions asked, total highlights, total micro quizzes generated, overall quiz accuracy, % rated "hữu ích", % opt-out (PRD §13.1).
  - Per-page breakdown: question count, highlight count, quiz accuracy, average micro-quiz rating (PRD §13.2, minus the spatial parts).
- A **real AI call** that takes the per-page aggregation for pages crossing a minimum-signal threshold and returns one grounded insight + recommendation per flagged page (PRD §12). This is the slice's central AI decision — everything else on the page is a read-only rollup, so this is what must not be faked.
- Admin screen: overview cards, a per-page ranking table (sortable by question count / accuracy), and a "Tạo smart suggestion" action that renders the AI's output per page.
- Common questions: list distinct learner questions per page with counts (exact-string grouping is fine — see Can Be Mocked).
- Micro-quiz quality view: questions ranked by rating and by opt-out rate, with the "not useful" reasons learners picked (PRD §13.4 — admin views only, matches PRD's own scoping note).

### Can Be Mocked

- "Common questions" clustering can be exact-string or simple token-overlap grouping instead of real semantic clustering.
- No live-refresh — a manual "Làm mới" reload of the aggregation is fine; no websocket/polling needed.
- The per-page ranking table **is** the heatmap for this slice (see Non-goal 4) — no canvas overlay needed.

### Do Not Build Yet

AI diagram regeneration · diagram approve/regenerate/reject workflow · PDF export or version switching · admin accounts/auth · LMS integration · editing the base question set (Phần A) from the UI.

## Screen Layout

New route, `/admin.html`, served as a second static page alongside the learner app (not a mode toggle inside it — the audiences and layouts are different enough that a shared shell would compromise both). Two-column layout:

- Left: lesson selector (same two lessons as the learner sidebar) + overview cards (PRD §13.1 numbers).
- Right: per-page table. Selecting a row opens a detail panel below with: common questions on that page, micro-quiz rating breakdown, and the "Tạo smart suggestion" button. Once generated, the suggestion renders as a card: insight sentence, recommendation, and the exact numbers it was grounded in (so a skeptical instructor can verify it wasn't invented).

Minimum controls:

- Lesson selector (reuses `GET /api/lessons`).
- Refresh button.
- Sortable per-page table.
- Per-page "Tạo smart suggestion" button + rendered suggestion card.

## Data Model

```ts
type PageAggregate = {
  pageNumber: number;
  questionCount: number;
  highlightCount: number;
  microQuizCount: number;
  quizAttempts: number;
  quizCorrect: number;         // quizAttempts - quizCorrect = wrong count used for §12 signal 3
  ratingUseful: number;
  ratingNotUseful: number;
  optOutCount: number;
  commonQuestions: { text: string; count: number }[]; // top N by count
};

type OverviewAggregate = {
  lessonId: string;
  totalLearners: number;       // distinct sessionId count — the closest proxy to "số người học" without accounts
  totalQuestions: number;
  totalHighlights: number;
  totalMicroQuizzes: number;
  quizAccuracy: number;        // 0..1
  ratingUsefulRate: number;    // 0..1, of rated quizzes only
  optOutRate: number;          // 0..1
  pages: PageAggregate[];
};

type SmartSuggestion = {
  pageNumber: number;
  issueType: string;           // model-chosen short label, e.g. "Câu hỏi trùng lặp nhiều lần"
  insight: string;             // grounded sentence citing the real numbers
  recommendation: string;      // concrete next step
  evidence: {                  // echoed back so the UI can show its receipts
    affectedLearners: number;
    affectedRate: number;      // affectedLearners / totalLearners
    wrongRate: number;         // quizCorrect/quizAttempts inverted, for pages with quiz data
    topQuestions: string[];
  };
  generatedAt: string;
};
```

`totalLearners` is a necessary substitution for PRD §12.1's "số lượng người học tương tác" — there are no accounts, so distinct `sessionId` in the event log is the only available proxy. This should be stated on the admin screen, not silently presented as a real headcount.

## API Contract

All new, additive — nothing in `codebase/server.js`'s existing routes changes.

### `GET /api/admin/overview?lessonId=`

Returns `OverviewAggregate` computed by streaming and reducing `codebase/var/events.jsonl` server-side. Pure aggregation, no AI call, must be fast enough to compute on every request rather than cached (the log is small; premature caching would be over-engineering for this slice).

### `POST /api/admin/suggestions`

Input:

```json
{ "lessonId": "d1-ai-llm-foundation", "pageNumber": 13 }
```

The server re-derives that page's `PageAggregate` itself from the event log — it does **not** trust a client-supplied aggregate, for the same reason the learner side never trusts the model's citation without verifying it: the numbers a suggestion is grounded in must be numbers the server itself computed.

Output: `SmartSuggestion` (see Data Model). Rules, enforced server-side the same way `normalizeAnswer()` already does for the learner tutor:

- The model receives only the aggregated numbers and the list of common questions for that page — never raw event dumps, never other pages' data.
- The model must not invent a number that isn't in the input. If asked to justify a claim, it can only restate what was given.
- If the page has fewer than a minimum-signal threshold (e.g. `questionCount < 2 && highlightCount < 2`), the server refuses to call the model and returns a `422` with a clear "not enough signal yet" message — this mirrors the learner tutor's insufficient-context refusal (PRD §10.3) rather than letting the model pad a suggestion out of nothing.

### `GET /api/admin/pages/:pageNumber/questions?lessonId=`

Returns the full list of learner questions asked on that page (for the "common questions" detail panel), not just the top-N summary embedded in the overview response.

## Implementation Steps

1. **Fix `trackEvent()` to include `lessonId`** (see Required fix above) — nothing else here works without this.
2. Write the server-side aggregation function: stream `events.jsonl`, group by `lessonId` then `pageNumber`, produce `OverviewAggregate`.
3. Add `GET /api/admin/overview` and `GET /api/admin/pages/:pageNumber/questions`.
4. Add `POST /api/admin/suggestions` with the minimum-signal guard and the grounded prompt.
5. Build `codebase/public/admin.html` + `admin.js`: lesson selector, overview cards, sortable page table.
6. Add the per-page detail panel: common questions, quiz/rating breakdown, "Tạo smart suggestion" button wired to the new endpoint.
7. Render the suggestion card with its evidence numbers visible — this is what makes it checkable rather than a black box.
8. Manually generate enough real learner-side interaction (varied pages, some wrong quiz answers, some highlights) to have non-trivial data to aggregate and demo against.

## Done Criteria

Functional:

- Every number on the overview and per-page table is computed from real `events.jsonl` data — none hand-typed or hardcoded.
- At least one real AI call (`POST /api/admin/suggestions`) — the slice's central decision.
- A page with too little signal is refused with a clear reason, not padded into a fake suggestion.
- The suggestion card shows the exact numbers it was grounded in, next to the AI's text.

Process:

- `codebase/MOCKS.md` gets a new row for the admin slice once built, same honesty standard as the learner side.
- Whoever builds this can explain, unprompted, why heatmap became a ranking table (region-select was removed) and why §14–16 aren't here.
