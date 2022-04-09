import React, { FC, ReactNode, useEffect, useMemo } from "react";

import { createCacheManager, parse } from "../core";

import { Context } from "./context";

import type { DefaultCache } from ".";
import type { SimpleStore } from "@naporin0624/simple-store";

type Props = {
  value: DefaultCache;
  config?: {
    provider?: SimpleStore<string, [unknown, number]>;
  };
  children?: ReactNode | undefined;
};

export const Provider: FC<Props> = ({ value, children, config }) => {
  const root = useMemo(() => createCacheManager(parse(value), { provider: config?.provider }), [config?.provider, value]);
  useEffect(() => {
    root.watch();
    return () => root.stop();
  }, [root]);

  return <Context.Provider value={root}>{children}</Context.Provider>;
};
