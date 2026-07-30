# User-Side Implementation Doc

## Goal

Build the learner-facing first slice of the Slide + AI learning system:

> A learner reads a PDF slide, selects a confusing part, asks AI for help, receives a cited answer, then optionally generates a short quiz from that answer.

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
  citation?: {
    pageNumber: number;
    quote?: string;
    regionLabel?: string;
  };
  confidence?: "high" | "medium" | "low";
};

type MicroQuiz = {
  id: string;
  sourceMessageId: string;
  includeInFinalQuiz: boolean;
  rating?: "useful" | "not_useful";
  questions: {
    prompt: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
  }[];
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
  "answer": "Go means proceed, pilot means test with limited scope, and no-go means stop or revisit assumptions.",
  "citation": {
    "pageNumber": 5,
    "quote": "go / pilot / no-go"
  },
  "confidence": "high"
}
```

Rules:

- Answer only from the lesson content provided to the model.
- If the selected context is unclear, ask one clarification question or give a low-confidence answer.
- Always include a page citation.
- Do not search the internet.

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

Output:

```json
{
  "questions": [
    {
      "prompt": "What does 'pilot' mean in this context?",
      "options": ["Stop the project", "Test with limited scope", "Skip validation"],
      "correctOptionIndex": 1,
      "explanation": "Pilot means trying the idea with a smaller group before committing fully."
    }
  ]
}
```

## Implementation Steps

1. Create the two-panel learner layout.
2. Load one demo lesson and map visible pages to simple text snippets.
3. Add text highlight and rectangle selection state.
4. Show selected context in the tutor panel.
5. Wire the tutor question form to a real AI endpoint.
6. Render cited AI answers.
7. Add micro quiz generation from the latest answer.
8. Add quiz answer feedback, rating, and include/exclude toggle.
9. Save the current session state in memory or `localStorage`.
10. Add one simple final quiz view using included micro quiz questions.

## Done Criteria

- A learner can complete the full slice without manual intervention.
- At least one real AI call is used for the tutor answer or quiz generation.
- Every AI answer shows a page citation.
- Low-confidence or missing-context behavior is visible in the UI.
- The team can explain which parts are real and which are mocked.
- The demo takes under 5 minutes.

