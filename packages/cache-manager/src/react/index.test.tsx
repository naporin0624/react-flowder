import React, { FC } from "react";
import { useCache, Provider } from ".";
import { createStore } from "@naporin0624/simple-store";
import { renderHook } from "@testing-library/react-hooks";

let keyCount = 0;
const inject = {
  buildKey(a: number, b: string) {
    return `buildKey__${++keyCount}_${a}_${b}`;
  },
  noCache: [() => `noCache__${++keyCount}`, { maxAge: 1 }] as const,
  noClear: [() => `noClear__${++keyCount}`, { maxAge: -1 }] as const,
};

declare module "." {
  type Custom = typeof inject;
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultCache extends Custom {}
}

describe("hook test", () => {
  const cacheStore = createStore<string, [unknown, number]>();
  beforeEach(() => {
    cacheStore.clear();
  });

  const wrapper: FC = ({ children }) => (
    <Provider value={inject} config={{ provider: cacheStore }}>
      {children}
    </Provider>
  );
  test("Provider not found test", () => {
    const { result } = renderHook(() => useCache());

    expect(result.error).toEqual(new Error("Provider is not found"));
  });

  test("register & lift test", () => {
    const subscribeSpy = jest.spyOn(cacheStore, "subscribe");
    const clearSpy = jest.spyOn(cacheStore, "clear");

    const { unmount } = renderHook(() => useCache(), { wrapper });

    expect(subscribeSpy.mock.calls.length).toEqual(1);
    unmount();
    expect(clearSpy.mock.calls.length).toEqual(2);
  });
});
