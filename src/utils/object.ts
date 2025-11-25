export function orderObjectKeys<T extends Record<string, unknown>>(obj?: T): T {
  if (!obj) {
    return {} as T;
  }

  const entries = Object.keys(obj)
    .sort()
    .map((key) => [key, obj[key as keyof T]] as const);
  return Object.fromEntries(entries) as T;
}
