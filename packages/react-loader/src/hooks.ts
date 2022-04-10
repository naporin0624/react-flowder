import { useCallback, useContext, useEffect, useState } from "react";

import { CacheContext, CacheStore } from "./cache";

export const useLoader = <T extends Promise<unknown>>(key: string, loader: () => T): T extends Promise<infer U> ? U : never => {
  const cacheStore = useContext(CacheContext);
  if (cacheStore === null) throw new Error("CacheContext not found");

  const cache = cacheStore.get(key);
  if (cache) {
    switch (cache.type) {
      case "pending":
        throw cache.payload;
      case "success":
        return cache.payload;
      case "error":
        throw cache.payload;
    }
  }

  const promise = loader()
    .then((payload) => cacheStore.set(key, { type: "success", payload }))
    .catch((payload) => cacheStore.set(key, { type: "error", payload }));
  cacheStore.set(key, { type: "pending", payload: promise });
  throw promise;
};

export const usePrefetch = <T>(key: string, loader: () => Promise<T>): (() => Promise<void>) => {
  const cacheStore = useContext(CacheContext);
  return useCallback(async () => {
    try {
      const payload = await loader();
      cacheStore?.set(key, { type: "success", payload });
    } catch (error) {
      cacheStore?.set(key, { type: "error", payload: error instanceof Error ? error : new Error(JSON.stringify(error)) });
    }
  }, [cacheStore, key, loader]);
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
  }, [cacheStore]);

  return keys;
};

export const useCache = (): CacheStore => {
  const cacheStore = useContext(CacheContext);
  if (cacheStore === null) throw new Error("CacheContext not found");
  return cacheStore;
};
