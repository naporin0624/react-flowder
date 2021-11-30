import React, { FC } from "react";
import { Cache } from "@naporin0624/react-loader";
import { Provider as Flow } from "@naporin0624/react-flow";
import { FlowderContext, createFlowderRoot } from "./context";

import type { FlowderInject } from ".";

type Props = {
  value: FlowderInject;
};

export const Provider: FC<Props> = ({ children, value }) => {
  return (
    <FlowderContext.Provider value={createFlowderRoot(value)}>
      <Flow>
        <Cache>{children}</Cache>
      </Flow>
    </FlowderContext.Provider>
  );
};
