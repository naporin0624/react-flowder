import { useContext } from "react";
import { Context } from "./context";

import type { CacheManager } from "../core";
import type { Inject } from ".";

const useNonNullContext = () => {
  const c = useContext(Context);
  if (!c) throw new Error("Provider is not found");
  return c;
};

export const useCacheManager = (): CacheManager<Inject> => {
  return useNonNullContext();
};
