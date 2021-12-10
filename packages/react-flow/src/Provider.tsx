import React, { FC, useMemo } from "react";
import { FlowContext, createFlowRoot, Status } from "./context";

import type { SimpleStore } from "@naporin0624/simple-store";

type Props = {
  config?: {
    provider?: SimpleStore<string, Status>;
  };
};
export const Provider: FC<Props> = ({ children, config }) => {
  const value = useMemo(() => createFlowRoot({ state: config?.provider }), [config?.provider]);

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
};
