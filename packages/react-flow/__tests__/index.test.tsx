import React, { FC, useContext } from "react";
import { Subject } from "rxjs";
import { Provider, useFlow, FlowContext } from "../src";
import { act, renderHook } from "@testing-library/react-hooks";
import { createStore } from "@naporin0624/simple-store";

const Wrapper: FC = ({ children }) => {
  return <Provider>{children}</Provider>;
};

const any = new Subject<unknown>();

describe("index test", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("sync data", () => {
    const spy = jest.spyOn(any, "subscribe");
    const { result } = renderHook(() => useFlow("test", any), { wrapper: Wrapper });
    expect(result.current).toBe(undefined);
    act(() => {
      any.next(1);
    });

    expect(result.current).toBe(1);
    expect(spy.mock.calls.length).toBe(1);

    act(() => {
      any.next(undefined);
    });

    expect(result.current).toBe(undefined);
    expect(spy.mock.calls.length).toBe(1);
  });

  test("subscribe once call", () => {
    const spy = jest.spyOn(any, "subscribe");
    const { result } = renderHook(
      () => {
        const a = useFlow("test", any);
        const b = useFlow("test", any);
        const c = useFlow("test1", any);
        return [a, b, c] as const;
      },
      { wrapper: Wrapper }
    );
    act(() => {
      any.next(1);
    });

    expect(result.current).toEqual(expect.arrayContaining([1, 1, 1]));
    expect(spy.mock.calls.length).toBe(2);
    spy.mockRestore();
  });

  test("unmount test", () => {
    const { result, unmount } = renderHook(() => [useFlow("test", any), useContext(FlowContext)] as const, { wrapper: Wrapper });
    expect(result.current[0]).toBe(undefined);

    act(() => {
      any.next(1);
    });
    expect(result.current[0]).toBe(1);
    expect(result.current[1]?.state.get("test")).toBe(1);
    unmount();

    expect(result.current[1]?.state.has("test")).toBe(false);
  });

  test("context not found", () => {
    const { result } = renderHook(() => useFlow("test", any));
    expect(result.error).toEqual(new Error("FlowContext is not found"));
  });

  const state = createStore<string, unknown>();
  test("set provider test", () => {
    const { result } = renderHook(() => useContext(FlowContext), { wrapper: ({ children }) => <Provider config={{ provider: state }}>{children}</Provider> });
    expect(result.current?.state).toEqual(state);
  });
});
