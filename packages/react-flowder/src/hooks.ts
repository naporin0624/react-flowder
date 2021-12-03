import { useContext, useMemo } from "react";
import { FlowContext, useFlow } from "@naporin0624/react-flow";
import { CacheContext, useLoader } from "@naporin0624/react-loader";
import { firstValueFrom } from "rxjs";

import type { Flowder } from "./core";

export const useFlowder = <T>(flowder: Flowder<T>): T => {
  const flow = useContext(FlowContext);
  const cache = useContext(CacheContext);
  if (!flow || !cache) throw new Error("Provider not found");

  const key = useMemo(() => flowder.toString(), [flowder]);
  const $ = useMemo(() => flowder.source, [flowder]);
  const p = useMemo(() => firstValueFrom($), [$]);

  return useFlow(key, $, useLoader(key, p));
};
