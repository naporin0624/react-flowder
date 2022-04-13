import React, { createContext, FC, ReactNode } from "react";

import { DatasourceResolver, DatasourceResolverImpl } from "./core";

export const Context = createContext<DatasourceResolver | null>(null);
Context.displayName = "DatasourceResolverContext";

export const Provider: FC<{ children?: ReactNode | undefined }> = ({ children }) => {
  return <Context.Provider value={new DatasourceResolverImpl()}>{children}</Context.Provider>;
};
