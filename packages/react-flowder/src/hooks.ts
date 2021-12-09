import { useContext, useMemo } from "react";
import { FlowContext, useFlow } from "@naporin0624/react-flow";
import { CacheContext, useLoader } from "@naporin0624/react-loader";
import { firstValueFrom } from "rxjs";

import { Flowder, getSource } from "./core";

export const useFlowder = <T>(flowder: Flowder<T>): T => {
  const flow = useContext(FlowContext);
  const cache = useContext(CacheContext);
  if (!flow || !cache) throw new Error("Provider not found");

  const $ = useMemo(() => getSource(flowder), [flowder]);
  const p = useMemo(() => firstValueFrom($), [$]);

  return useFlow(flowder, $, useLoader(flowder, p));
};
