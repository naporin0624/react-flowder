import { useCallback, useMemo, useContext } from "react";
import { FlowContext, useFlow } from "@naporin0624/react-flow";
import { useLoader, CacheContext } from "@naporin0624/react-loader";
import { firstValueFrom } from "rxjs";

import { DatasourceKey, DatasourceBuilder, getSource } from "./core";

export const useProvider = () => {
  const flow = useContext(FlowContext);
  const cache = useContext(CacheContext);
  if (!flow || !cache) throw new Error("Provider not found");

  return { flow, cache };
};

export const useReadData = <T>(key: DatasourceKey<T>): T => {
  useProvider();
  const $ = useMemo(() => getSource(key), [key]);
  const loader = useCallback(() => firstValueFrom($), [$]);

  return useFlow(key, $, useLoader(key, loader));
};

export const usePrefetch = <Args extends unknown[], T>(builder: DatasourceBuilder<Args, T>) => {
  const { cache } = useProvider();

  const prefetch = useCallback(
    async (...args: Args) => {
      const key = builder(...args);
      const loader = () => firstValueFrom(getSource(key));

      try {
        const payload = await loader();
        cache?.set(key, { type: "success", payload });
      } catch (error) {
        cache?.set(key, { type: "error", payload: error instanceof Error ? error : new Error(JSON.stringify(error)) });
      }
    },
    [builder, cache]
  );

  return prefetch;
};

export function useReset(): () => void;
export function useReset<T>(flowder: DatasourceKey<T>): () => void;
export function useReset<Args extends unknown[], T>(builder: DatasourceBuilder<Args, T>): () => void;
export function useReset<Args extends unknown[], T>(input?: DatasourceKey<T> | DatasourceBuilder<Args, T>) {
  const { flow, cache } = useProvider();

  const resetAll = useCallback(() => {
    flow?.state.clear();
    cache?.clear();
  }, [cache, flow]);
  const resetWithKey = useCallback(() => {
    const key = input?.toString();
    if (!key) return;

    flow?.state.forEach((v, k) => {
      if (k.startsWith(key)) flow.state.delete(k);
    });
    cache?.forEach((v, k) => {
      if (k.startsWith(key)) cache?.delete(k);
    });
  }, [cache, flow, input]);

  const reset = useCallback(() => {
    const key = input?.toString();
    if (key) resetWithKey();
    else resetAll();
  }, [input, resetAll, resetWithKey]);

  return reset;
}
