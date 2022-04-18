import { useCallback, useContext, useEffect } from "react";
import { firstValueFrom } from "rxjs";
import { useSyncExternalStore } from "use-sync-external-store/shim";

import { DatasourceKey, Datasource, DatasourceResolver, getSource } from "./core";
import { DatasourceResolverContext, ReferenceCounterContext } from "./Provider";

export const useDatasourceResolver = (): DatasourceResolver => {
  const context = useContext(DatasourceResolverContext);
  if (!context) throw new Error("Provider not found");

  return context;
};
const useReferenceCounter = () => {
  const context = useContext(ReferenceCounterContext);
  if (!context) throw new Error("Provider not found");

  return context;
};

export const useReadData = <T>(key: DatasourceKey<T>): T => {
  const refCounter = useReferenceCounter();

  useEffect(() => {
    refCounter.increment(key);
    return () => refCounter.decrement(key);
  }, [refCounter, key]);

  const resolver = useDatasourceResolver();
  resolver.register(key);

  return useSyncExternalStore(
    useCallback(
      (onSnapshot) => {
        onSnapshot();
        return resolver.watchStatus(key).subscribe({
          next: onSnapshot,
        }).unsubscribe;
      },
      [key, resolver]
    ),
    useCallback(() => {
      const status = resolver.getStatus(key);
      if (status.type === "success") return status.data;
      throw status.data;
    }, [key, resolver])
  );
};

export const usePrefetch = <Args extends unknown[], T>(datasource: Datasource<Args, T>) => {
  const resolver = useDatasourceResolver();
  const prefetch = useCallback(
    async (...args: Args) => {
      const key = datasource(...args);
      const loader = () => firstValueFrom(getSource(key));
      try {
        const data = await loader();
        resolver.writeCache(key, { type: "success", data });
        return data;
      } catch (error) {
        resolver.writeCache(key, { type: "error", data: error instanceof Error ? error : new Error(JSON.stringify(error)) });
        throw error;
      }
    },
    [datasource, resolver]
  );
  return prefetch;
};

export function useReset(): <Args extends unknown[], T>(key?: Datasource<Args, T> | DatasourceKey<T>) => void {
  const resolver = useDatasourceResolver();

  return useCallback((key) => resolver.resetCache(key), [resolver]);
}
