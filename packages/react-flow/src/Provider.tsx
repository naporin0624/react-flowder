import React, { FC } from "react";
import { FlowContext, createFlowRoot } from "./context";

export const Provider: FC = ({ children }) => {
  return <FlowContext.Provider value={createFlowRoot()}>{children}</FlowContext.Provider>;
};
