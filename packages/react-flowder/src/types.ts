import type { Observable } from "rxjs";

export type Builder<Args extends unknown[], T> = (...args: Args) => Observable<T>;

export type Flowder<T> = {
  [K in keyof T as T[K] extends Builder<never[], unknown> ? K : never]: T[K];
};

declare const $key: unique symbol;
export type FlowderKey<Args, T> = {
  [$key]?: T;
  toString(): string;
  config: { key: string; args: Args };
};

export type KeyBuilder<Args extends unknown[], T> = (...args: Args) => FlowderKey<Args, T>;

export type FlowderKeyBuilder<T> = {
  [K in keyof T]: T[K] extends Builder<infer Args, infer U> ? KeyBuilder<Args, U> : never;
};
