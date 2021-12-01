import React, { FC, useState } from "react";
import { act, renderHook } from "@testing-library/react-hooks";
import { Cache, useLoader, useCacheKey, useCache } from "../src";

const Wrapper: FC = ({ children }) => {
  return <Cache>{children}</Cache>;
};

const timeout = (ms = 10, error?: boolean): Promise<number> => {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      error ? reject(new Error("error")) : resolve(ms);
    }, ms)
  );
};

describe("test react-loader", () => {
  describe("useCacheKey", () => {
    test("simple usage", async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => {
          useLoader("timeout", timeout(20, false));
          return useCacheKey();
        },
        {
          wrapper: Wrapper,
        }
      );
      await waitForNextUpdate();

      expect(result.current).toEqual(expect.arrayContaining(["timeout"]));
    });
  });
  describe("useCache", () => {
    test("simple usage", async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => {
          useLoader("timeout", timeout(20, false));
          return useCache();
        },
        { wrapper: Wrapper }
      );
      await waitForNextUpdate();

      expect(result.current.get("timeout")).toEqual({ payload: 20, type: "success" });
    });
  });
  describe("userLoader", () => {
    test("simple usage", async () => {
      const { result, waitForNextUpdate } = renderHook(() => useLoader("timeout", timeout(10)), { wrapper: Wrapper });
      await waitForNextUpdate();

      expect(result.current).toBe(10);
    });

    test("useLoader & useState", async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => {
          const [count, setCount] = useState(10);
          const data = useLoader(`timeout__${count}`, timeout(count));
          return [data, setCount] as const;
        },
        { wrapper: Wrapper }
      );
      await waitForNextUpdate();
      expect(result.current[0]).toBe(10);

      act(() => result.current[1](20));
      await waitForNextUpdate();
      expect(result.current[0]).toBe(20);
    });
    test("reject", async () => {
      const { result, waitForNextUpdate } = renderHook(() => useLoader("reject", timeout(0, true)), { wrapper: Wrapper });
      await waitForNextUpdate();
      return expect(result.error).toEqual(new Error("error"));
    });
  });
});
