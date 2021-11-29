import { createContext } from "react";
import { createStore, SimpleStore } from "@naporin0624/simple-store";

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

export type CacheStore = SimpleStore<string, Status>;

export const createCacheContext = () => {
  const CacheContext = createContext<CacheStore | null>(null);
  return CacheContext;
};

export const CacheContext = createCacheContext();

export const createCacheStore = (): CacheStore => {
  return createStore<string, Status>();
};
