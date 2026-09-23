export declare function orderObjectKeys<T extends Record<string, unknown>>(obj?: T): T;
export declare function omit<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K>;
