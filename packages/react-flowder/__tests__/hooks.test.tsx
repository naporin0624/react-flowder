import React, { FC } from "react";
import { flowder } from "../src/core";
import { useFlowder } from "../src/hooks";
import { Provider } from "../src/Provider";
import { act, cleanup, renderHook } from "@testing-library/react-hooks";
import { interval, BehaviorSubject } from "rxjs";

const timer = interval();
const key1 = flowder(timer);
const any = new BehaviorSubject<unknown>(1);
const anyKey = flowder(any);

describe("useFlowder test", () => {
  afterEach(cleanup);
  const wrapper: FC = ({ children }) => <Provider>{children}</Provider>;

  test("suspend & data sync test", async () => {
    const { result, waitForNextUpdate, waitFor } = renderHook(() => useFlowder(key1), { wrapper });
    await waitForNextUpdate();
    expect(result.current).toEqual(0);
    await waitFor(() => result.current === 1, { timeout: 1500 });
    expect(result.current).toEqual(1);
  });

  test("any object sync test", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFlowder(anyKey), { wrapper });
    await waitForNextUpdate();
    expect(result.current).toEqual(1);
    act(() => any.next(undefined));
    expect(result.current).toEqual(undefined);
    act(() => any.next(null));
    expect(result.current).toEqual(null);
    act(() => any.next({}));
    expect(result.current).toEqual({});
  });

  test("context not found test", () => {
    const { result } = renderHook(() => useFlowder(anyKey));
    expect(result.error).toEqual(new Error("Provider not found"));
  });
});
