/* eslint-disable @typescript-eslint/no-explicit-any */
import { createStore, SimpleStore } from "@naporin0624/simple-store";
import stringify from "fast-json-stable-stringify";
import { Option, parse, Config } from "./config";
export { Config, parse };

type CacheValue<T> = {
  [K in keyof T]: T[K] extends [infer U, Option] ? U : never;
};

export type CacheManager<T> = {
  watch(): void;
  stop(): void;
  value: CacheValue<T>;
};

export function createCacheManager<T extends Record<string, [fn: (...args: any[]) => unknown, option: Option]>>(
  config: T,
  option?: { provider?: SimpleStore<string, [unknown, number]> }
): CacheManager<T> {
  const store = option?.provider ?? createStore<string, [unknown, number]>();

  let dispose: (() => void) | null = null;
  const watch = () => {
    stop();
    const d = store.subscribe(() => {
      store.forEach(([, time], k) => {
        if (k === "called") return;
        const configKey = k.split("__")[0];
        const target = Object.entries(config).find(([key]) => key === configKey);
        if (!target) return;
        const [, [, option]] = target;
        const { maxAge } = option;
        if (maxAge === -1) return;
        if (Date.now() - time < maxAge) return;
        store.delete(k);
      });
    });

    dispose = () => d.unsubscribe();
  };
  const stop = () => {
    dispose?.();
    store.clear();
  };

  const caches: CacheValue<T> = {} as CacheValue<T>;
  for (const key in config) {
    const [fn] = config[key];
    const build: any = (...args: unknown[]) => {
      store.set("call", [true, Date.now()]);
      const cacheKey = `${key}__${stringify(args)}`;
      const cache = store.get(cacheKey);
      if (cache) return cache[0];

      const result = fn(...args);
      store.set(cacheKey, [result, Date.now()]);
      return result;
    };
    caches[key] = build;
  }

  return {
    watch,
    stop,
    value: caches,
  };
}
