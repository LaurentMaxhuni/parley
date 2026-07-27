/**
 * Attempts to extract and parse valid JSON from a model's text output,
 * handling common failure modes like markdown fences, trailing commas,
 * single-quoted keys, and truncation.
 */

function stripMarkdownFences(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return fenceMatch ? fenceMatch[1].trim() : text.trim();
}

function findJsonObject(text: string): string | null {
  const braceStart = text.indexOf("{");
  if (braceStart === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = braceStart; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\" && inString) { escape = true; continue; }
    if (ch === '"' && !escape) inString = !inString;
    if (inString) continue;
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (depth === 0) return text.slice(braceStart, i + 1);
  }
  return null;
}

function fixCommonJsonIssues(text: string): string {
  let fixed = text
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/(['"])\s*:\s*(['"])/g, "$1: $2")
    .replace(/:\s*'([^']*?)'/g, ': "$1"')
    .replace(/'/g, '"')
    .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
    .replace(/(:\s*)(\w+)(\s*[,}])/g, (_, p1, p2, p3) => {
      const lowered = p2.toLowerCase();
      if (lowered === "true" || lowered === "false" || lowered === "null") return `${p1}${lowered}${p3}`;
      return `${p1}"${p2}"${p3}`;
    })
    .replace(/,\s*([}\]])/g, "$1");

  return fixed;
}

function attemptParse(text: string): unknown {
  return JSON.parse(text);
}

export function extractJson(raw: string): { success: true; data: unknown } | { success: false; error: string } {
  if (!raw || typeof raw !== "string") {
    return { success: false, error: "Empty or non-string response" };
  }

  const strategies = [
    () => attemptParse(raw),
    () => attemptParse(stripMarkdownFences(raw)),
    () => {
      const obj = findJsonObject(raw);
      if (!obj) throw new Error("No JSON object found");
      return attemptParse(obj);
    },
    () => {
      const obj = findJsonObject(stripMarkdownFences(raw));
      if (!obj) throw new Error("No JSON object found after markdown strip");
      return attemptParse(obj);
    },
    () => {
      const fixed = fixCommonJsonIssues(raw);
      return attemptParse(fixed);
    },
    () => {
      const stripped = stripMarkdownFences(raw);
      const fixed = fixCommonJsonIssues(stripped);
      return attemptParse(fixed);
    },
    () => {
      const obj = findJsonObject(raw);
      if (!obj) throw new Error("No JSON object found for fix pass");
      const fixed = fixCommonJsonIssues(obj);
      return attemptParse(fixed);
    },
    () => {
      const stripped = stripMarkdownFences(raw);
      const obj = findJsonObject(stripped);
      if (!obj) throw new Error("No JSON object found for final pass");
      const fixed = fixCommonJsonIssues(obj);
      return attemptParse(fixed);
    },
  ];

  for (let i = 0; i < strategies.length; i++) {
    try {
      const data = strategies[i]();
      if (data !== null && typeof data === "object") {
        return { success: true, data };
      }
    } catch {
      continue;
    }
  }

  const preview = raw.length > 200 ? raw.slice(0, 200) + "..." : raw;
  return { success: false, error: `Could not parse model response as JSON after trying ${strategies.length} strategies. Raw preview: ${preview}` };
}
