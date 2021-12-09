import React, { FC } from "react";
import { flowder } from "../src/core";
import { useFlowder } from "../src/hooks";
import { Provider } from "../src/Provider";
import { act, cleanup, renderHook } from "@testing-library/react-hooks";
import { interval, BehaviorSubject, map, Subject } from "rxjs";

const timer = interval();
const timerFlowder = flowder(() => timer);
const any = new BehaviorSubject<unknown>(1);
const anyFlowder = flowder(() => any);

const number = new Subject<number>();
const flowderWithArgs = flowder((offset: number) => number.pipe(map((t) => t + offset)));

describe("useFlowder test", () => {
  afterEach(cleanup);
  const wrapper: FC = ({ children }) => <Provider>{children}</Provider>;

  test("suspend & data sync test", async () => {
    const { result, waitForNextUpdate, waitFor } = renderHook(() => useFlowder(timerFlowder()), { wrapper });
    await waitForNextUpdate();
    expect(result.current).toEqual(0);
    await waitFor(() => result.current === 1, { timeout: 1500 });
    expect(result.current).toEqual(1);
  });

  test("flowderWithArgs suspend & data sync test", async () => {
    const { result, waitForNextUpdate, rerender } = renderHook<{ offset: number }, number>(({ offset }) => useFlowder(flowderWithArgs(offset)), {
      wrapper,
      initialProps: { offset: 0 },
    });
    number.next(0);
    await waitForNextUpdate();
    expect(result.current).toEqual(0);

    act(() => number.next(1));
    expect(result.current).toEqual(1);

    rerender({ offset: 2 });
    act(() => number.next(0));
    await waitForNextUpdate();
    expect(result.current).toEqual(2);
  });

  test("any object sync test", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFlowder(anyFlowder()), { wrapper });
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
    const { result } = renderHook(() => useFlowder(anyFlowder()));
    expect(result.error).toEqual(new Error("Provider not found"));
  });
});
