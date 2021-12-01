export type Option = {
  maxAge: number;
};
export type OmitReadonly<T> = {
  -readonly [K in keyof T]: T[K];
};

export type Config<T> = {
  [K in keyof T]: [OmitReadonly<T[K]> extends [infer U, Option] ? U : T[K], Option];
};

export const parser = <T>(input: T): Config<T> => {
  if (typeof input !== "object") throw new Error("input is not object");
  if (input === null || input === undefined) throw new Error("input is not object");
  if (Array.isArray(input)) throw new Error("input is not Record");

  const result: Config<T> = {} as Config<T>;
  for (const k in input) {
    const key: keyof T = k;
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    const value = descriptor?.value ?? descriptor?.get?.();
    if (!value) throw new Error(`Failed to get value from ${key}`);
    const [fn, op] = Array.isArray(value) ? value : [value, {}];
    if (typeof fn !== "function") throw new Error(`${key} is not function`);

    result[key] = [fn, optionParser(op)];
  }

  return result;
};

const optionParser = (value: unknown): Option => {
  const defaultValue: Option = { maxAge: 5 * 60 * 1000 };

  if (!value) return defaultValue;
  if (typeof value !== "object" || Array.isArray(value)) throw new Error("option parse error");

  const maxAge = has(value, "maxAge") ? value.maxAge : defaultValue.maxAge;
  if (typeof maxAge !== "number") throw new Error("maxAge is not number");
  if (maxAge < -1) throw new Error("maxAge must be greater than or equal to -1.");

  return { maxAge };
};

const has = <T, K extends string>(target: T, name: K): target is T & { [Name in K]: unknown } => {
  return name in target;
};
