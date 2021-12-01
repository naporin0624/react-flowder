import React, { FC, useEffect, useMemo } from "react";
import { createCacheManager, parser } from "../core";
import { Context } from "./context";

import type { Inject } from ".";
import type { SimpleStore } from "@naporin0624/simple-store";

type Props = {
  value: Inject;
  config?: {
    provider?: SimpleStore<string, [unknown, number]>;
  };
};

export const Provider: FC<Props> = ({ value, children, config }) => {
  const root = useMemo(() => createCacheManager(parser(value), { provider: config?.provider }), [config?.provider, value]);
  useEffect(() => {
    root.watch();
    return () => root.stop();
  }, [root]);

  return <Context.Provider value={root}>{children}</Context.Provider>;
};
