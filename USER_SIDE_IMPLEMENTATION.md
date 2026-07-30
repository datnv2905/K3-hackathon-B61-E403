# User-Side Implementation Doc

## Goal

Build the learner-facing first slice of the Slide + AI learning system.

The slice, in the required one-sentence format — **một người dùng · một công việc · một quyết định AI · một kết quả**:

> **Học viên đang tự đọc slide ngoài giờ lớp** · **cần xác nhận mình hiểu đúng một đoạn hoặc một diagram vừa đọc** · **AI quyết định: trả lời kèm trích dẫn trang, hỏi lại, hay từ chối khi bài giảng không đủ căn cứ** · **học viên biết mình hiểu đúng hay sai trong dưới 1 phút, không rời trang học.**

English gloss: *a learner reading slides alone needs to confirm they understood a passage; the AI decides whether to answer with a page citation, ask back, or refuse for lack of grounding; the learner finds out whether they were right in under a minute without leaving the page.*

Non-goals for this slice (the build must not violate them):

1. No knowledge from outside the lecture, even when the model knows the answer.
2. No auto-triggered quizzes — the learner opts in.
3. No consequential grading; quiz results are for self-checking only.

Keep this slice small. Admin dashboard, PDF versioning, diagram regeneration, long-term history, and analytics exports are out of scope for this pass.

## First Slice

### Must Work

- Show one lesson PDF or slide-like content in a scrollable viewer.
- Let the learner select context in one of two lightweight ways:
  - Text highlight, if selectable text exists.
  - Rectangle selection, if the content is visual or non-selectable.
- Send the learner question plus selected context to a real AI call.
- Return an answer with:
  - Short explanation.
  - Source citation: slide/page number and selected text or region label.
  - Low-confidence fallback when the context is insufficient.
- Let the learner generate a 1-3 question micro quiz from the latest AI answer.
- Let the learner answer the quiz and see explanation feedback.

### Can Be Mocked

- PDF text extraction can use preloaded slide text for the demo.
- Rectangle selection can store coordinates without real OCR.
- Quiz persistence can be in memory or `localStorage`.
- Final combined quiz can be a simple list assembled from generated micro quizzes.

### Do Not Build Yet

- Admin dashboard.
- Heatmap visualization.
- AI diagram regeneration.
- PDF export or version switching.
- User accounts.
- Production database.
- LMS integration.

## Screen Layout

Use a two-panel layout:

- Left: lesson viewer.
- Right: AI tutor panel.

Minimum controls:

- Lesson viewer:
  - Page number.
  - Highlight/select mode.
  - Clear selection.
- Tutor panel:
  - Selected context preview.
  - Question input.
  - Send button.
  - Answer card with citation.
  - Generate quiz button.
  - Quiz answer choices.
  - Useful / not useful rating.
  - Include in final quiz toggle.

## State Model

```ts
type SelectionContext = {
  id: string;
  type: "text" | "region";
  pageNumber: number;
  text?: string;
  region?: { x: number; y: number; width: number; height: number };
};

type TutorMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  // Which hard-case path this answer took — drives the UI chip and the eval metrics.
  kind?: "answer" | "needs_clarification" | "insufficient" | "out_of_scope" | "error";
  citation?: {
    pageNumber: number;
    quote?: string;
    regionLabel?: string;
    verified: boolean;          // citationVerified && quoteVerified
    citationVerified: boolean;  // cited page was actually retrieved
    quoteVerified: boolean;     // quote appears verbatim on that page
  };
  confidence?: "high" | "medium" | "low";
  retrievedPages?: number[];
};

type QuizQuestion = {
  id: string;
  type: "mcq" | "short_answer";
  prompt: string;
  explanation: string;
  pageNumber: number;
  options?: string[];           // mcq only
  correctOptionIndex?: number;  // mcq only
  referenceAnswer?: string;     // short_answer only
  // Filled in when the learner answers — this is what makes metrics measurable.
  learnerAnswerIndex?: number;
  learnerAnswer?: string;
  isCorrect?: boolean;
  feedback?: string;
  answeredAt?: string;
  draft?: string;               // in-progress typing, survives re-render
};

type MicroQuiz = {
  id: string;
  sourceMessageId: string;
  pageNumber: number;
  includeInFinal: boolean;
  rating?: "useful" | "not_useful";
  ratingReason?: string;
  createdAt?: string;
  questions: QuizQuestion[];
};

type FinalAttempt = {
  startedAt: string;
  submittedAt: string | null;   // non-null => list was locked and graded
  base: QuizQuestion[];         // Phần A, instructor-authored
  personalised: QuizQuestion[]; // Phần B, deduped + capped at 5
  responses: Record<string, { optionIndex?: number; text?: string; isCorrect?: boolean; feedback?: string }>;
};
```

## AI Contract

### Answer Request

Input:

```json
{
  "lessonId": "day06-ai-product-project-management",
  "pageNumber": 5,
  "question": "What does go / pilot / no-go mean?",
  "selectedText": "Pitch deck must be clear enough for stakeholder to decide go / pilot / no-go.",
  "selectedRegion": null
}
```

Output:

```json
{
  "kind": "answer",
  "answer": "Go nghĩa là triển khai tiếp, pilot nghĩa là thử nghiệm giới hạn, no-go nghĩa là dừng hoặc quay lại giả định.",
  "clarifyingQuestion": "",
  "confidence": "high",
  "citation": {
    "pageNumber": 5,
    "quote": "Go nghĩa là triển khai tiếp, pilot nghĩa là thử nghiệm giới hạn",
    "regionLabel": "",
    "verified": true,
    "citationVerified": true,
    "quoteVerified": true
  },
  "retrievedPages": [1, 4, 5, 6],
  "selectionEcho": "…"
}
```

Rules — enforced by the server, not trusted to the model:

- The model only sees the pages returned by retrieval (top 4 by token overlap, plus the page the learner selected). It cannot cite anything else.
- `citation.pageNumber` outside `retrievedPages` is overwritten and `citationVerified` goes false.
- `citation.quote` must appear verbatim on the cited page or `quoteVerified` goes false.
- Either verification failing forces `confidence` down to `low` — the UI then shows *chưa đối chiếu được nguồn*.
- The final wording of every refusal is chosen by the server, so a chatty model cannot talk past it:
  - `kind: "insufficient"` → lesson lacks grounding (layer ①).
  - `kind: "needs_clarification"` → too vague, asks back with exactly one question (layer ②).
  - `kind: "out_of_scope"` → forbidden request or unrelated topic (layer ③).
- No internet access.

### Quiz Request

Input:

```json
{
  "sourceAnswer": "Go means proceed, pilot means test with limited scope, and no-go means stop or revisit assumptions.",
  "sourceCitation": {
    "pageNumber": 5,
    "quote": "go / pilot / no-go"
  },
  "questionCount": 3
}
```

Output — at least one `mcq`; `short_answer` allowed when it fits:

```json
{
  "questions": [
    {
      "id": "q-1785398000100-0",
      "type": "mcq",
      "prompt": "Pilot nghĩa là gì trong ngữ cảnh này?",
      "options": ["Dừng dự án", "Thử nghiệm giới hạn", "Bỏ qua validation"],
      "correctOptionIndex": 1,
      "explanation": "Pilot là thử với nhóm nhỏ trước khi cam kết toàn bộ.",
      "pageNumber": 5
    },
    {
      "id": "q-1785398000100-1",
      "type": "short_answer",
      "prompt": "Nêu khác biệt giữa pilot và no-go.",
      "referenceAnswer": "Pilot là thử giới hạn, no-go là dừng hoặc quay lại giả định.",
      "explanation": "Hai quyết định khác nhau về việc có tiếp tục hay không.",
      "pageNumber": 5
    }
  ]
}
```

### Grade Request — `POST /api/tutor/grade`

Needed because `short_answer` cannot be graded client-side.

```json
{ "prompt": "…", "referenceAnswer": "…", "learnerAnswer": "…", "pageNumber": 2 }
```

```json
{ "isCorrect": true, "feedback": "…", "missingPoints": [] }
```

### Event Request — `POST /api/events`

Appends to `codebase/var/events.jsonl` (gitignored). Fire-and-forget: analytics must never block the learner.

```json
{ "events": [{ "type": "quiz_answered", "quizId": "…", "questionId": "…", "pageNumber": 4, "isCorrect": false }] }
```

Types emitted: `selection_text`, `selection_region`, `ask_question`, `tutor_answer`, `tutor_error`, `quiz_generated`, `quiz_error`, `quiz_answered`, `quiz_rated`, `quiz_include_toggled`, `final_quiz_started`, `final_quiz_submitted`, `session_reset`.

## Implementation Steps

1. Create the two-panel learner layout.
2. Load the demo lesson from `/api/lesson` and render pages in a scroll viewer.
3. Add text highlight and rectangle selection state.
4. Show selected context in the tutor panel.
5. Wire the tutor question form to the real AI endpoint.
6. Render cited answers with confidence and verification chips.
7. Add micro quiz generation attached to the specific answer that produced it.
8. Add quiz feedback, rating with reason, and include/exclude toggle.
9. Persist session state in `localStorage`; stream events to the server.
10. Assemble the final quiz: Phần A + deduped, capped Phần B, locked on start.
11. **Build the golden set in `eval/`** — ≥20 cases, ≥2 per hard-case layer, and record run 1 against the bar in PRD §19.0.
12. **Run validation** — ≥3 named people outside the team try the slice; log verbatim feedback in `validation/`.

## Done Criteria

Functional:

- A learner completes the full slice with no manual intervention.
- Three real AI calls exercised: answer, quiz generation, short-answer grading.
- Every answer carries a page citation and a verification chip.
- All four experience paths are reachable and visibly different: happy · low-confidence · failure · correction.
- All four hard-case layers demonstrable live (see PRD §10.5 for the case list).

Measured — against the bar frozen in PRD §19.0:

- ≥80% of golden-set cases pass every required dimension.
- 100% of answers carry a page citation.
- Zero cases present outside knowledge as lesson content.
- 100% of layer ③ requests refused.

Process:

- Every team member can explain the part with their name on it (CP5 checks at random).
- `codebase/MOCKS.md` matches reality — mocked parts declared, not glossed over.
- The demo runs in under 5 minutes and includes one live failure case.

