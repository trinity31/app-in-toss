const validQuestions = (value) =>
  Array.isArray(value) && value.every((question) => typeof question === "string");

function parseEnvelope(text) {
  try {
    const value = JSON.parse(text);
    if (value && validQuestions(value.follow_up_questions)) return value;
  } catch {
    // Ordinary reading text is Markdown, not JSON.
  }
  return null;
}

// Some responses embed question metadata in the reading instead of its own field.
// Normalize at display time so saved conversations receive the same correction.
export function normalizeDeepReadingMessage(content, followUpQuestions) {
  const result = {
    content: typeof content === "string" ? content : "",
    followUpQuestions: validQuestions(followUpQuestions) ? followUpQuestions : [],
  };
  const text = result.content.trim();
  const unwrapped = text.replace(/^```(?:json)?\s*\n([\s\S]*?)\n```$/i, "$1");
  const envelope = parseEnvelope(unwrapped);
  if (envelope && typeof envelope.reading === "string") {
    return { content: envelope.reading, followUpQuestions: envelope.follow_up_questions };
  }

  // Only remove a complete metadata object at the end, preserving other JSON/prose.
  const trailer = /(?:^|\n)[ \t]*(?:```(?:json)?[ \t]*\n[ \t]*)?(\{\s*"follow_up_questions"\s*:[\s\S]*?\})[ \t]*(?:\n[ \t]*```)?[ \t]*$/i.exec(text);
  if (!trailer) return result;
  const metadata = parseEnvelope(trailer[1]);
  if (!metadata || Object.keys(metadata).length !== 1) return result;
  return {
    content: text.slice(0, trailer.index).trimEnd(),
    followUpQuestions: metadata.follow_up_questions,
  };
}
