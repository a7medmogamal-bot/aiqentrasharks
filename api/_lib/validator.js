const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard", "exam"]);

const VALID_TYPES = new Set([
  "multiple_choice", "true_false", "fill_blank", "short_answer",
  "essay", "jre", "rewrite", "explain", "results",
  "what_happens", "why", "authenticity", "prove", "choose_justify"
]);

function validateResult(parsed) {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("invalid_json_response");
  }

  if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    throw new Error("no_questions_generated");
  }

  parsed.questions = parsed.questions.filter(q => {
    if (!q || typeof q !== "object") return false;
    if (!VALID_DIFFICULTIES.has(q.difficulty)) return false;
    if (!VALID_TYPES.has(q.type)) return false;
    if (typeof q.question !== "string" || !q.question.trim()) return false;
    if (typeof q.answer !== "string" || !q.answer.trim()) return false;
    if (typeof q.explanation !== "string") q.explanation = "";

    if (!q.source || typeof q.source !== "object") {
      q.source = { text: "" };
    }
    if (typeof q.source.text !== "string") q.source.text = "";

    if (Array.isArray(q.options)) {
      q.options = q.options.filter(o => typeof o === "string" && o.trim());
      if (q.type === "multiple_choice" && q.options.length < 2) return false;
    } else {
      delete q.options;
    }

    return true;
  });

  if (!parsed.questions.length) {
    throw new Error("no_questions_generated");
  }

  if (typeof parsed.title !== "string" || !parsed.title.trim()) {
    parsed.title = "Question Set";
  }
  parsed.title = parsed.title.trim().slice(0, 80);

  if (!parsed.contentAnalysis || typeof parsed.contentAnalysis !== "object") {
    parsed.contentAnalysis = { mainIdeas: [], relationships: [] };
  }

  if (!Array.isArray(parsed.contentAnalysis.mainIdeas)) {
    parsed.contentAnalysis.mainIdeas = [];
  }
  if (!Array.isArray(parsed.contentAnalysis.relationships)) {
    parsed.contentAnalysis.relationships = [];
  }

  return parsed;
}

export { validateResult };
