export function jsonParseNoThrow<T>(doc: string): T | null {
  try {
    return JSON.parse(doc) as T;
  } catch (_e) {
    console.error("Error parsing JSON", _e);
  }

  return null;
}
