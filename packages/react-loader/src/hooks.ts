import { useContext, useEffect, useState } from "react";
import { CacheContext, CacheStore } from "./cache";

export const useLoader = <T extends Promise<unknown>>(key: string, promise: T): T extends Promise<infer U> ? U : never => {
  const cacheStore = useContext(CacheContext);
  if (cacheStore === null) throw new Error("CacheContext not found");

  const cache = cacheStore.get(key);
  if (cache) {
    switch (cache.type) {
      case "success":
        return cache.payload;
      case "error":
        throw cache.payload;
    }
  }

  throw promise.then((payload) => cacheStore.set(key, { type: "success", payload })).catch((payload) => cacheStore.set(key, { type: "error", payload }));
};

export const useCacheKey = (): string[] => {
  const cacheStore = useContext(CacheContext);
  if (cacheStore === null) throw new Error("CacheContext not found");
  const [keys, setKeys] = useState<string[]>(Array.from(cacheStore.keys()));

  useEffect(() => {
    const disposable = cacheStore.subscribe(() => {
      const key = Array.from(cacheStore.keys());
      setKeys(key);
    });

    return () => {
      disposable.unsubscribe();
    };
  }, []);

  return keys;
};

export const useCache = (): CacheStore => {
  const cacheStore = useContext(CacheContext);
  if (cacheStore === null) throw new Error("CacheContext not found");
  return cacheStore;
};
