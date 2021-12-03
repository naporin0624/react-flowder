import type { SimpleStore } from "@naporin0624/simple-store";
import React, { FC } from "react";
import { FlowContext, createFlowRoot } from "./context";

type Props = {
  config?: {
    provider?: SimpleStore<string, unknown>;
  };
};
export const Provider: FC<Props> = ({ children, config }) => {
  return <FlowContext.Provider value={createFlowRoot({ state: config?.provider })}>{children}</FlowContext.Provider>;
};
