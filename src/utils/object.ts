export function orderObjectKeys<T extends Record<string, unknown>>(obj?: T): T {
  if (!obj) {
    return {} as T;
  }

  const entries = Object.keys(obj)
    .sort()
    .map((key) => [key, obj[key as keyof T]] as const);
  return Object.fromEntries(entries) as T;
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    // TODO: refactor this as a reduce, maybe?
    // eslint-disable-next-line
    delete result[key];
  }
  return result;
}
