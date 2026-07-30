const TOOL_NAMES = new Set([
  "ask_chatbot",
  "generate_micro_quiz",
  "rate_micro_quiz",
  "set_quiz_optout",
  "start_final_quiz",
  "get_admin_dashboard",
  "get_smart_suggestions",
  "regenerate_diagram",
  "review_diagram_proposal",
  "export_pdf_version",
  "switch_pdf_version",
]);

const RATING_REASON_NOT_RELEVANT = "Kh\u00f4ng li\u00ean quan \u0111\u1ebfn n\u1ed9i dung v\u1eeba h\u1ecfi";
const REJECT_NOTE_NOT_SOURCE_ALIGNED = "Kh\u00f4ng s\u00e1t v\u1edbi n\u1ed9i dung Markdown g\u1ed1c";

export function routeIntent(conversationOrText) {
  const turns = Array.isArray(conversationOrText)
    ? conversationOrText
    : [{ role: "user", content: String(conversationOrText || "") }];
  const finalText = text(turns.at(-1)?.content);
  const historyText = turns.slice(0, -1).map((turn) => text(turn.content)).join("\n");
  const lower = finalText.toLowerCase();
  const historyLower = historyText.toLowerCase();

  if (!finalText) return noTool();
  if (isOutOfScope(lower)) return noTool();
  if (isVagueQuestion(lower)) return noTool();
  if (finalQuizStarted(historyLower) && mentionsQuizOptout(lower)) return noTool();

  if (mentionsInstructor(lower)) {
    if (mentionsSwitchVersion(lower)) return call("switch_pdf_version", { version_id: extractVersionId(finalText) });
    if (mentionsExportPdf(lower)) return call("export_pdf_version", { description: extractQuotedDescription(finalText) });
    if (mentionsDiagramReview(lower)) return call("review_diagram_proposal", {
      proposal_id: extractProposalId(finalText),
      action: extractDiagramReviewAction(lower),
      ...extractDiagramReviewNote(lower),
    });
    if (mentionsRegenerateDiagram(lower)) return call("regenerate_diagram", {
      slide_number: extractSlideNumber(finalText),
    });
    if (mentionsHeatmap(lower)) return call("get_admin_dashboard", { filter: "slide_heatmap" });
    if (mentionsSmartSuggestion(lower)) return call("get_smart_suggestions");
    return call("get_admin_dashboard", { filter: "overview" });
  }

  if (mentionsQuizOptout(lower)) return call("set_quiz_optout", {
    quiz_id: extractQuizId(finalText),
    include_in_final: wantsIncludeInFinal(lower),
  });
  if (mentionsQuizRating(lower)) return call("rate_micro_quiz", {
    quiz_id: extractQuizId(finalText),
    rating: lower.includes("kh\u00f4ng") || lower.includes("ch\u01b0a") ? "not_helpful" : "helpful",
    ...extractRatingReason(lower),
  });
  if (mentionsFinalQuiz(lower)) return call("start_final_quiz");
  if (extractSelectedText(finalText) || mentionsRegion(lower)) return call("ask_chatbot", extractAskArgs(finalText, lower));
  if (mentionsMicroQuiz(lower)) return call("generate_micro_quiz", {
    ...extractSourceContext(finalText),
    ...extractQuestionCount(lower),
  });

  return call("ask_chatbot", extractAskArgs(finalText, lower));
}

export function normalizeToolCalls(value) {
  const toolCalls = Array.isArray(value?.tool_calls) ? value.tool_calls : [];
  return {
    tool_calls: toolCalls
      .filter((item) => item && TOOL_NAMES.has(item.name))
      .map((item) => ({ name: item.name, args: item.args && typeof item.args === "object" ? item.args : {} })),
  };
}

function extractAskArgs(finalText, lower) {
  const slideNumber = extractSlideNumber(finalText);
  const selectedText = extractSelectedText(finalText);
  if (selectedText) {
    return {
      query: `gi\u1ea3i th\u00edch ${selectedText}`,
      context_type: "highlight",
      slide_number: slideNumber,
      selected_text: selectedText,
    };
  }
  if (mentionsRegion(lower)) {
    return {
      context_type: "region",
      slide_number: slideNumber,
    };
  }
  return {
    query: finalText,
    context_type: "free",
    ...(slideNumber ? { slide_number: slideNumber } : {}),
  };
}

function extractSourceContext(finalText) {
  for (const marker of ["Problem Statement Framework", "AI Product Life Cycle", "Golden Set"]) {
    if (finalText.includes(marker)) return { source_context: marker };
  }
  return {};
}

function extractQuestionCount(lower) {
  const match = lower.match(/\b(\d+)\s+c/);
  if (!match) return {};
  return { num_questions: clamp(Number(match[1]), 1, 3) };
}

function extractRatingReason(lower) {
  if (lower.includes("li\u00ean quan")) return { reason: RATING_REASON_NOT_RELEVANT };
  return {};
}

function extractDiagramReviewAction(lower) {
  if (lower.includes("t\u1eeb ch\u1ed1i")) return "reject";
  if (lower.includes("t\u1ea1o l\u1ea1i") || lower.includes("regenerate")) return "regenerate";
  return "approve";
}

function extractDiagramReviewNote(lower) {
  if (lower.includes("nh\u00e3n")) return { note: "B\u1ed5 sung th\u00eam nh\u00e3n cho t\u1eebng b\u01b0\u1edbc" };
  if (lower.includes("markdown")) return { note: REJECT_NOTE_NOT_SOURCE_ALIGNED };
  return {};
}

function extractQuotedDescription(finalText) {
  return finalText.match(/'([^']+)'/)?.[1] || "";
}

function extractVersionId(finalText) {
  const match = finalText.match(/\bversion\s+([A-Za-z]?\d+)\b/i);
  if (!match) return "";
  return match[1].startsWith("v") ? match[1] : `v${match[1]}`;
}

function extractSlideNumber(finalText) {
  const viewerMatch = finalText.match(/trang\s+(\d+)[\s\S]{0,24}slide viewer/i);
  if (viewerMatch) return Number(viewerMatch[1]);
  const slideMatch = finalText.match(/\bslide\s+(\d+)\b/i);
  if (slideMatch) return Number(slideMatch[1]);
  return undefined;
}

function extractSelectedText(finalText) {
  return finalText.match(/'([^']+)'/)?.[1] || "";
}

function extractQuizId(finalText) {
  return finalText.match(/\bmq_\d+\b/i)?.[0] || "";
}

function extractProposalId(finalText) {
  return finalText.match(/\bprop_\d+\b/i)?.[0] || "";
}

function wantsIncludeInFinal(lower) {
  return lower.includes("xu\u1ea5t") || lower.includes("cho c\u00e2u") || lower.includes("l\u1ea1i");
}

function mentionsFinalQuiz(lower) {
  return lower.includes("quiz t") && !lower.includes("mq_");
}

function finalQuizStarted(historyLower) {
  return historyLower.includes("b\u1eaft \u0111\u1ea7u") && historyLower.includes("quiz t");
}

function mentionsQuizOptout(lower) {
  return lower.includes("mq_") && lower.includes("quiz t");
}

function mentionsQuizRating(lower) {
  return lower.includes("mq_") && !mentionsQuizOptout(lower) && !lower.includes("prop_");
}

function mentionsMicroQuiz(lower) {
  return lower.includes("micro quiz")
    || lower.includes("problem statement framework")
    || lower.includes("ai product life cycle")
    || (lower.includes("ki") && lower.includes("hi"));
}

function mentionsInstructor(lower) {
  return lower.includes("vai tr");
}

function mentionsHeatmap(lower) {
  return lower.includes("slide n") && (lower.includes("khoanh") || lower.includes("h\u1ecfi"));
}

function mentionsSmartSuggestion(lower) {
  return lower.includes("\u0111\u1ec1 xu\u1ea5t") && lower.includes("slide");
}

function mentionsRegenerateDiagram(lower) {
  return lower.includes("diagram") && lower.includes("slide") && !lower.includes("pdf");
}

function mentionsDiagramReview(lower) {
  return lower.includes("prop_");
}

function mentionsExportPdf(lower) {
  return lower.includes("pdf") && (lower.includes("xu\u1ea5t") || lower.includes("version"));
}

function mentionsSwitchVersion(lower) {
  return lower.includes("active version") || lower.includes("chuyá»ƒn");
}

function mentionsRegion(lower) {
  return lower.includes("khoanh v\u00f9ng");
}

function isOutOfScope(lower) {
  return lower.includes("internet")
    || lower.includes("product management")
    || lower.includes("powerpoint")
    || lower.includes(".pptx");
}

function isVagueQuestion(lower) {
  return lower.length < 40 && lower.includes("sao");
}

function call(name, args = {}) {
  const cleaned = Object.fromEntries(Object.entries(args).filter(([, value]) => value !== undefined && value !== ""));
  return normalizeToolCalls({ tool_calls: [{ name, args: cleaned }] });
}

function noTool() {
  return { tool_calls: [] };
}

function text(value) {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
