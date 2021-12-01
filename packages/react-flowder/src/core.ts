import type { Observable } from "rxjs";

export type Flowder<T> = {
  toString(): string;
  source: Observable<T>;
};

let keyCount = 1;
export const flowder = <T>($: Observable<T>): Flowder<T> => {
  const key = `flowder__${++keyCount}`;
  return {
    toString() {
      return key;
    },
    source: $,
  };
};
