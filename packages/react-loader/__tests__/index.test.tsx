import React, { FC, useState } from "react";
import { act, renderHook, cleanup } from "@testing-library/react-hooks";
import { Cache, useLoader, useCacheKey, useCache, createCacheStore } from "../src";

const timeout = (ms = 10, error?: boolean): Promise<number> => {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      error ? reject(new Error("error")) : resolve(ms);
    }, ms)
  );
};

describe("react-loader test", () => {
  afterEach(cleanup);
  describe("inject provider test", () => {
    const cacheStore = createCacheStore();
    const config = {
      provider: cacheStore,
    };
    const wrapper: FC = ({ children }) => {
      return <Cache config={config}>{children}</Cache>;
    };

    beforeEach(() => {
      cacheStore.clear();
    });

    test("provider equal hook", async () => {
      const key = "timeout";
      const { result, waitForNextUpdate } = renderHook(() => useLoader(key, () => timeout(10)), { wrapper });
      expect(result.current).toEqual(undefined);
      await waitForNextUpdate();

      expect(result.current).toEqual(10);
      expect(result.current === cacheStore.get(key)?.payload).toBe(true);
    });

    test("change cacheStore after rerender test", async () => {
      const key = "timeout";
      const { result, waitForNextUpdate, rerender } = renderHook(() => useLoader(key, () => timeout(10)), { wrapper });
      expect(result.current).toEqual(undefined);
      await waitForNextUpdate();
      expect(result.current).toEqual(10);

      cacheStore.set(key, { type: "success", payload: 100 });
      expect(result.current).toEqual(10);
      rerender();
      expect(result.current).toEqual(100);
    });
  });

  describe("hook test", () => {
    const wrapper: FC = ({ children }) => {
      return <Cache>{children}</Cache>;
    };
    test("useCacheKey test", async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => {
          useLoader("timeout", () => timeout(20, false));
          return useCacheKey();
        },
        { wrapper }
      );
      await waitForNextUpdate();

      expect(result.current).toEqual(expect.arrayContaining(["timeout"]));
    });
    test("useCache test", async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => {
          useLoader("timeout", () => timeout(20, false));
          return useCache();
        },
        { wrapper }
      );
      await waitForNextUpdate();

      expect(result.current.get("timeout")).toEqual({ payload: 20, type: "success" });
    });
    test("useLoader test", async () => {
      const { result, waitForNextUpdate } = renderHook(() => useLoader("timeout", () => timeout(10)), { wrapper: wrapper });
      await waitForNextUpdate();

      expect(result.current).toBe(10);
    });

    test("useLoader & useState test", async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => {
          const [count, setCount] = useState(10);
          const data = useLoader(`timeout__${count}`, () => timeout(count));
          return [data, setCount] as const;
        },
        { wrapper: wrapper }
      );
      await waitForNextUpdate();
      expect(result.current[0]).toBe(10);

      act(() => result.current[1](20));
      await waitForNextUpdate();
      expect(result.current[0]).toBe(20);
    });
    test("useLoader error occurred test", async () => {
      const { result, waitForNextUpdate } = renderHook(() => useLoader("reject", () => timeout(0, true)), { wrapper: wrapper });
      await waitForNextUpdate();
      return expect(result.error).toEqual(new Error("error"));
    });
  });
});
