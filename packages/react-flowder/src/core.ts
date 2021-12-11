/* eslint-disable @typescript-eslint/no-explicit-any */
import stringify from "fast-json-stable-stringify";
import { isObservable, Observable } from "rxjs";

type ObservableBuilder<Args extends unknown[], T> = (...args: Args) => Observable<T>;

declare const __flowderKey: unique symbol;
export type Flowder<T> = string & {
  [__flowderKey]?: T;
};
export interface FlowderBuilder<Args extends unknown[], T> {
  (...args: Args): Flowder<T>;
  toString(): string;
}

const sources = new Map<string, Observable<any>>();

let keyCount = 0;
export const flowder = <Args extends unknown[], T>(builder: ObservableBuilder<Args, T>): FlowderBuilder<Args, T> => {
  const key = `flowder__${++keyCount}`;
  const flowderBuilder = (...args: Args) => {
    const flowderKey = `${key}:${stringify(args)}`;
    if (!sources.has(flowderKey)) sources.set(flowderKey, builder(...args));

    return flowderKey;
  };

  return Object.assign(flowderBuilder, {
    toString() {
      return key;
    },
  });
};

export const getSource = <T>(flowder: Flowder<T>): Observable<T> => {
  const $ = sources.get(flowder.toString());
  if (!$) throw new Error("This flowder has not been registered.");
  if (!isObservable($)) throw new Error("The registered Object is not an Observable.");

  return $ as Observable<T>;
};
