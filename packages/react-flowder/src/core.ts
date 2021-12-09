/* eslint-disable @typescript-eslint/no-explicit-any */
import stringify from "fast-json-stable-stringify";
import type { Observable } from "rxjs";

declare const __flowderKey: unique symbol;
export type Flowder<T> = string & {
  [__flowderKey]?: T;
};

type FlowderBuilder<Args extends unknown[], T> = (...args: Args) => Flowder<T>;
type ObservableBuilder<Args extends unknown[], T> = (...args: Args) => Observable<T>;

const sources = new Map<string, Observable<any>>();

let keyCount = 0;
export const flowder = <Args extends unknown[], T>(builder: ObservableBuilder<Args, T>): FlowderBuilder<Args, T> => {
  const key = `flowder__${++keyCount}`;
  const flowderBuilder = (...args: Args) => {
    const flowderKey = `${key}:${stringify(args)}`;
    if (!sources.has(flowderKey)) sources.set(flowderKey, builder(...args));

    return flowderKey;
  };

  return flowderBuilder;
};

export const getSource = <T>(flowder: Flowder<T>): Observable<T> => {
  const $ = sources.get(flowder.toString());
  if (!$) throw new Error("This flowder has not been registered.");

  return $;
};
