import stringify from "fast-json-stable-stringify";
import { createContext } from "react";
import { isObservable, Observable } from "rxjs";
import type { FlowderInject } from ".";
import type { FlowderKeyBuilder, Flowder, FlowderKey, KeyBuilder } from "./types";

export interface FlowderRoot {
  keyBuilder: FlowderKeyBuilder<Flowder<FlowderInject>>;
  from<Args extends unknown[], T>(key: FlowderKey<Args, T>): Observable<T>;
}

export const FlowderContext = createContext<FlowderRoot | null>(null);

export const createFlowderRoot = (inject: Flowder<FlowderInject>): FlowderRoot => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const keyBuilder: FlowderKeyBuilder<Flowder<any>> = {};

  for (const key in inject) {
    const descriptor = Object.getOwnPropertyDescriptor(inject, key);
    const value = descriptor?.value ?? descriptor?.get?.();
    if (typeof value !== "function") continue;
    const builder: KeyBuilder<unknown[], unknown> = (...args: unknown[]) => ({
      toString() {
        return `${key}__${stringify(args)}`;
      },
      get config() {
        return { key, args };
      },
    });
    keyBuilder[key] = builder;
  }

  const from = <Args extends unknown[], T>({ config }: FlowderKey<Args, T>): Observable<T> => {
    const { key, args } = config;
    const descriptor = Object.getOwnPropertyDescriptor(inject, key);
    if (!descriptor) throw new Error(`${key} is not inject`);
    const fn = descriptor.value ?? descriptor.get?.();
    if (!fn || typeof fn !== "function") throw new Error(`${key} is not function`);
    const value = fn(...args);
    if (!isObservable(value)) throw new Error(`${key} is not Observable`);

    return value as Observable<T>;
  };

  return {
    keyBuilder,
    from,
  };
};
