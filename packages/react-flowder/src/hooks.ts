import { useCallback, useContext, useMemo } from "react";
import { FlowContext, useFlow } from "@naporin0624/react-flow";
import { CacheContext, useLoader } from "@naporin0624/react-loader";
import { firstValueFrom } from "rxjs";

import { Flowder, FlowderBuilder, getSource } from "./core";

export const useFlowderContext = () => {
  const flow = useContext(FlowContext);
  const cache = useContext(CacheContext);
  if (!flow || !cache) throw new Error("Provider not found");

  return useMemo(() => ({ flow, cache }), [flow, cache]);
};

export const useFlowder = <T>(flowder: Flowder<T>): T => {
  useFlowderContext();
  const $ = useMemo(() => getSource(flowder), [flowder]);
  const p = useMemo(() => firstValueFrom($), [$]);

  return useFlow(flowder, $, useLoader(flowder, p));
};

export function useReset(): () => void;
export function useReset<T>(flowder: Flowder<T>): () => void;
export function useReset<Args extends unknown[], T>(flowderBuilder: FlowderBuilder<Args, T>): () => void;
export function useReset<Args extends unknown[], T>(input?: Flowder<T> | FlowderBuilder<Args, T>) {
  const { flow, cache } = useFlowderContext();

  const resetAll = useCallback(() => {
    flow.state.clear();
    cache.clear();
  }, [cache, flow.state]);
  const resetWithKey = useCallback(() => {
    const key = input?.toString();
    if (!key) return;

    flow.state.forEach((v, k) => {
      if (k.startsWith(key)) flow.state.delete(k);
    });
    cache.forEach((v, k) => {
      if (k.startsWith(key)) cache.delete(k);
    });
  }, [cache, flow.state, input]);

  const reset = useCallback(() => {
    const key = input?.toString();
    if (key) resetWithKey();
    else resetAll();
  }, [input, resetAll, resetWithKey]);

  return reset;
}
