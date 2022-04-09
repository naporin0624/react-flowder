import { createStore, SimpleStore } from "@naporin0624/simple-store";
import { createContext } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Status<T = any> =
  | {
      type: "pending";
      payload: Promise<unknown>;
    }
  | {
      type: "success";
      payload: T;
    }
  | {
      type: "error";
      payload: Error;
    };

export type CacheStore = SimpleStore<string, Status>;

export const CacheContext = createContext<CacheStore | null>(null);
CacheContext.displayName = "CacheContext";

export const createCacheStore = (): CacheStore => {
  return createStore<string, Status>();
};
