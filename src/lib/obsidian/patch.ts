const PATCH_OPERATIONS = new Set(["append", "prepend", "replace", "search-replace"]);
const PATCH_TARGET_TYPES = new Set(["heading", "block", "frontmatter"]);

export interface PatchBodyArgs {
  operation: string;
  targetType?: string;
  target: string;
  content: unknown;
  targetDelimiter?: string;
  trimTargetWhitespace?: boolean;
  createTargetIfMissing?: boolean;
}

export function buildPatchBody({
  operation,
  targetType,
  target,
  content,
  targetDelimiter,
  trimTargetWhitespace,
  createTargetIfMissing = true,
}: PatchBodyArgs): string {
  if (!PATCH_OPERATIONS.has(operation)) {
    throw new TypeError("`operation` musi być jedną z wartości: append, prepend, replace, search-replace.");
  }

  if (operation !== "search-replace") {
    if (!targetType || !PATCH_TARGET_TYPES.has(targetType)) {
      throw new TypeError("`targetType` musi być jedną z wartości: heading, block, frontmatter.");
    }
  }

  if (typeof target !== "string" || target.trim() === "") {
    throw new TypeError("`target` musi być niepustym stringiem.");
  }

  // obsidian-local-rest-api (PATCH v3, JSON body) przyjmuje nagłówek tylko jako tablicę ścieżki
  // nagłówków, więc "A::B" rozbijamy po delimiterze (domyślnie "::").
  const isHeading = operation !== "search-replace" && targetType === "heading";
  const body: Record<string, unknown> = {
    operation,
    target: isHeading ? target.split(targetDelimiter ?? "::").map((part) => part.trim()) : target,
    content: typeof content === "string" ? content : JSON.stringify(content),
  };

  if (operation !== "search-replace") {
    body.targetType = targetType;
    body.createTargetIfMissing = createTargetIfMissing;
  }

  if (targetDelimiter !== undefined && !isHeading) {
    body.targetDelimiter = targetDelimiter;
  }
  if (trimTargetWhitespace !== undefined) {
    body.trimTargetWhitespace = trimTargetWhitespace;
  }

  return JSON.stringify(body);
}
