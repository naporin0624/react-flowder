import { createContext } from "react";

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

export type CacheStore = Map<string, Status> & {
  subscribe(listener: () => void): { unsubscribe: () => void };
};

export const createCacheContext = () => {
  const CacheContext = createContext<CacheStore | null>(null);
  return CacheContext;
};

export const CacheContext = createCacheContext();

export const createCacheStore = (): CacheStore => {
  const listeners: Map<symbol, () => void> = new Map();
  const subscribe = (listener: () => void) => {
    const id = Symbol();
    listeners.set(id, listener);
    return {
      unsubscribe() {
        listeners.delete(id);
      },
    };
  };

  const map = new Map();
  const proxyMap = new Proxy(map, {
    get(target, prop) {
      let ret = Reflect.get(target, prop);
      if (typeof ret === "function") ret = ret.bind(target);
      if (typeof prop === "string" && ["set", "clear", "delete"].includes(prop)) {
        listeners.forEach((listener) => {
          listener();
        });
      }

      return ret;
    },
  });

  return Object.assign(proxyMap, {
    subscribe,
  });
};
