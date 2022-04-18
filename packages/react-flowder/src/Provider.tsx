import { createStore } from "@naporin0624/simple-store";
import React, { createContext, FC, ReactNode, useMemo, useEffect } from "react";

import { DatasourceResolver, DatasourceResolverImpl, DatasourceKey } from "./core";

export const DatasourceResolverContext = createContext<DatasourceResolver | null>(null);
DatasourceResolverContext.displayName = "DatasourceResolverContext";

interface ReferenceCounter {
  increment(key: DatasourceKey<unknown>): void;
  decrement(key: DatasourceKey<unknown>): void;
}
export const ReferenceCounterContext = createContext<ReferenceCounter | null>(null);
ReferenceCounterContext.displayName = "ReferenceCounterContext";

export const Provider: FC<{ children?: ReactNode | undefined }> = ({ children }) => {
  const resolver = useMemo(() => new DatasourceResolverImpl(), []);
  const count = useMemo(() => createStore<DatasourceKey<unknown>, number>(), []);

  const referenceCounter = useMemo<ReferenceCounter>(
    () => ({
      increment: (key) => count.set(key, (count.get(key) ?? 0) + 1),
      decrement: (key) => count.set(key, Math.max((count.get(key) ?? 0) - 1, 0)),
    }),
    [count]
  );
  const cleanup = useMemo(() => new Map<string, () => void>(), []);

  useEffect(() => {
    const subscription = count.subscribe((method, key) => {
      if (method !== "set" || !key) return;

      const current = count.get(key) ?? 0;
      if (current < 1) {
        // reference counter が 5分間 0のままの時は cleanup を実行する
        const id = setTimeout(() => {
          count.delete(key);
          resolver.cancel(key);
        }, 1000 * 60 * 5);
        cleanup.set(key, () => clearTimeout(id));
      } else {
        // reference counter が 0 以上の時は cleanup を解除する
        cleanup.get(key)?.();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [cleanup, count, resolver]);

  return (
    <DatasourceResolverContext.Provider value={resolver}>
      <ReferenceCounterContext.Provider value={referenceCounter}>{children}</ReferenceCounterContext.Provider>
    </DatasourceResolverContext.Provider>
  );
};
