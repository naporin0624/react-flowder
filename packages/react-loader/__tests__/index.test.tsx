import React, { FC, Suspense, useState } from "react";
import { act, renderHook } from "@testing-library/react-hooks";
import { Cache, useLoader, useCacheKey } from "..";

const Wrapper: FC = ({ children }) => {
  return (
    <Suspense fallback={null}>
      <Cache>{children}</Cache>
    </Suspense>
  );
};

const timeout = (ms = 1000, error?: Error): Promise<number> => {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      error ? reject(error) : resolve(ms);
    }, ms)
  );
};

describe("userLoader", () => {
  test("simple usage", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useLoader("timeout", timeout(100)), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toBe(100);
  });

  test("useLoader & useState", async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => {
        const [count, setCount] = useState(100);
        const data = useLoader(`timeout__${count}`, timeout(count));
        return [data, setCount] as const;
      },
      { wrapper: Wrapper }
    );
    await waitForNextUpdate();
    expect(result.current[0]).toBe(100);

    act(() => result.current[1](200));
    await waitForNextUpdate();
    expect(result.current[0]).toBe(200);
  });
});

describe("useCacheKey", () => {
  test("simple usage", async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => {
        useLoader("timeout", timeout(100));
        return useCacheKey();
      },
      { wrapper: Wrapper }
    );
    await waitForNextUpdate();

    expect(result.current).toEqual(expect.arrayContaining(["timeout"]));
  });
});
