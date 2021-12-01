import { useFlow, FlowContext } from "@naporin0624/react-flow";
import { useLoader } from "@naporin0624/react-loader";
import { useContext, useMemo } from "react";
import { firstValueFrom } from "rxjs";
import type { Flowder } from "./core";

export const useFlowder = <T>(flowder: Flowder<T>): T => {
  const flowContext = useContext(FlowContext);
  if (!flowContext) throw new Error("Provider not found");

  const $ = useMemo(() => flowder.source, [flowder.source]);
  const p = useMemo(() => {
    flowContext.register(flowder.toString(), $);
    return firstValueFrom($).finally(() => flowContext.lift(flowder.toString()));
  }, [$, flowContext, flowder]);

  const d = useLoader(
    useMemo(() => flowder.toString(), [flowder]),
    p
  );

  const r = useFlow(
    useMemo(() => flowder.toString(), [flowder]),
    useMemo(() => $, [$])
  );

  return useMemo(() => (flowContext.state.has(flowder.toString()) ? r : d) as unknown as T, [flowContext.state, flowder, r, d]);
};
