import { FlowContext, useFlow } from "@naporin0624/react-flow";
import { useLoader, CacheContext } from "@naporin0624/react-loader";
import { useCallback, useMemo, useContext } from "react";
import { firstValueFrom } from "rxjs";

import { DatasourceKey, Datasource, getSource } from "./core";

export const useProvider = () => {
  const flow = useContext(FlowContext);
  const cache = useContext(CacheContext);
  if (!flow || !cache) throw new Error("Provider not found");

  return useMemo(() => ({ flow, cache }), [cache, flow]);
};

export const useReadData = <T>(key: DatasourceKey<T>): T => {
  useProvider();
  const $ = useMemo(() => getSource(key), [key]);
  const loader = useCallback(() => firstValueFrom($), [$]);

  return useFlow(key, $, useLoader(key, loader));
};

export const usePrefetch = <Args extends unknown[], T>(datasource: Datasource<Args, T>) => {
  const { cache } = useProvider();

  const prefetch = useCallback(
    async (...args: Args) => {
      const key = datasource(...args);
      const loader = () => firstValueFrom(getSource(key));

      try {
        const payload = await loader();
        cache?.set(key, { type: "success", payload });
        return payload;
      } catch (error) {
        cache?.set(key, { type: "error", payload: error instanceof Error ? error : new Error(JSON.stringify(error)) });
        throw error;
      }
    },
    [datasource, cache]
  );

  return prefetch;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useReset(): (key?: DatasourceKey<any> | Datasource<any[], any>) => void;
export function useReset<T>(key: DatasourceKey<T>): () => void;
export function useReset<Args extends unknown[], T>(key: Datasource<Args, T>): () => void;
export function useReset<Args extends unknown[], T>(input?: DatasourceKey<T> | Datasource<Args, T>) {
  const { flow, cache } = useProvider();

  const resetAll = useCallback(() => {
    flow?.state.clear();
    cache?.clear();
  }, [cache, flow]);
  const resetWithKey = useCallback(
    (key: string) => {
      flow?.state.forEach((v, k) => {
        if (k.startsWith(key)) flow.state.delete(k);
      });
      cache?.forEach((v, k) => {
        if (k.startsWith(key)) cache?.delete(k);
      });
    },
    [cache, flow.state]
  );

  const reset = useCallback(
    (args?: DatasourceKey<T> | Datasource<Args, T>) => {
      const key = input?.toString() ?? args?.toString();
      if (key) resetWithKey(key);
      else resetAll();
    },
    [input, resetAll, resetWithKey]
  );

  return reset;
}
