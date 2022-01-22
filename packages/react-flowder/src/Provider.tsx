import React, { FC } from "react";
import { Cache } from "@naporin0624/react-loader";
import { Provider as Flow } from "@naporin0624/react-flow";
import { createStore } from "@naporin0624/simple-store";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Status<T = any> =
  | {
      type: "success";
      payload: T;
    }
  | {
      type: "error";
      payload: Error;
    };

const store = createStore<string, Status>();
const config = {
  provider: store,
};

export const Provider: FC = ({ children }) => {
  return (
    <Flow config={config}>
      <Cache config={config}>{children}</Cache>
    </Flow>
  );
};
