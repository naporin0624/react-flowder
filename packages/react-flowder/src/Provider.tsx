import React, { FC, ReactNode, useEffect, useMemo } from "react";
import { Cache, createCacheStore } from "@naporin0624/react-loader";
import { Provider as Flow, Status } from "@naporin0624/react-flow";
import { createStore } from "@naporin0624/simple-store";

export const Provider: FC<{ children?: ReactNode | undefined }> = ({ children }) => {
  const store = useMemo(() => ({ loader: createCacheStore(), flow: createStore<string, Status>() }), []);
  const flowConfig = useMemo(() => ({ provider: store.flow }), [store.flow]);
  const loaderConfig = useMemo(() => ({ provider: store.loader }), [store.loader]);

  useEffect(() => {
    const dispose = store.flow.subscribe((method, key) => {
      if (method === "set" && key) {
        const value = store.flow.get(key);
        if (!value) return;

        store.loader.set(key, value);
      }
    });

    return () => {
      dispose.unsubscribe();
    };
  }, [store]);

  return (
    <Flow config={flowConfig}>
      <Cache config={loaderConfig}>{children}</Cache>
    </Flow>
  );
};
