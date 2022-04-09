import { useContext } from "react";

import { Context } from "./context";

import type { DefaultCache } from ".";
import type { CacheManager, Config } from "../core";

const useNonNullContext = () => {
  const c = useContext(Context);
  if (!c) throw new Error("Provider is not found");
  return c;
};

export const useCache = (): CacheManager<Config<DefaultCache>>["value"] => {
  return useNonNullContext().value;
};
