import React, { useMemo, FC } from "react";
import { CacheContext, createCacheStore } from "./cache";

export const Provider: FC = ({ children }) => {
  const cache = useMemo(() => createCacheStore(), []);
  return <CacheContext.Provider value={cache}>{children}</CacheContext.Provider>;
};
