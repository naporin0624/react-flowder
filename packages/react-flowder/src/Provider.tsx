import React, { FC } from "react";
import { Cache } from "@naporin0624/react-loader";
import { Provider as Flow } from "@naporin0624/react-flow";

export const Provider: FC = ({ children }) => {
  return (
    <Flow>
      <Cache>{children}</Cache>
    </Flow>
  );
};
