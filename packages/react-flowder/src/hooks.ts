import { useFlow, FlowContext } from "@naporin0624/react-flow";
import { useLoader } from "@naporin0624/react-loader";
import { useContext, useMemo } from "react";
import { firstValueFrom } from "rxjs";
import { FlowderContext } from "./context";

import type { FlowderInject } from ".";
import type { FlowderKeyBuilder, Flowder, FlowderKey } from "./types";

export const useFlowderKey = (): FlowderKeyBuilder<Flowder<FlowderInject>> => {
  const context = useContext(FlowderContext);
  if (!context) throw new Error("FlowderContext not found");

  return useMemo(() => context.keyBuilder, [context]);
};
export const useFlowder = <Args extends unknown[], T>(key: FlowderKey<Args, T>): T => {
  const flowContext = useContext(FlowContext);
  const flowderContext = useContext(FlowderContext);
  if (!flowderContext || !flowContext) throw new Error("FlowderContext not found");

  const $ = useMemo(() => flowderContext.from(key), [key, flowderContext]);
  const p = useMemo(() => {
    flowContext.register(key.toString(), $);
    return firstValueFrom($).finally(() => flowContext.lift(key.toString()));
  }, [$, flowContext, key]);

  const d = useLoader(
    useMemo(() => key.toString(), [key]),
    p
  );

  const r = useFlow(
    useMemo(() => key.toString(), [key]),
    useMemo(() => $, [$])
  );

  return useMemo(() => (flowContext.state.has(key.toString()) ? r : d) as unknown as T, [flowContext.state, key, r, d]);
};
