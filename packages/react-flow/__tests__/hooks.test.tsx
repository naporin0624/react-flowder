import React, { FC, useContext } from "react";
import { Subject } from "rxjs";
import { Provider, useFlow, FlowContext } from "../src";
import { act, cleanup, renderHook } from "@testing-library/react-hooks";
import { createStore } from "@naporin0624/simple-store";

const any = new Subject<unknown>();

describe("hook test", () => {
  const wrapper: FC = ({ children }) => <Provider>{children}</Provider>;
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test("context not found", () => {
    const { result } = renderHook(() => useFlow("test", any));
    expect(result.error).toEqual(new Error("FlowContext is not found"));
  });

  test("sync data", () => {
    const { result } = renderHook(() => useFlow("test", any), { wrapper });
    expect(result.current).toBe(undefined);
    act(() => {
      any.next(1);
    });

    expect(result.current).toBe(1);

    act(() => {
      any.next(undefined);
    });

    expect(result.current).toBe(undefined);
  });

  test("initialValue test", () => {
    const { result } = renderHook(() => useFlow("test", any, "initial"), { wrapper: wrapper });
    expect(result.current).toEqual("initial");
    act(() => {
      any.next(1);
    });
    expect(result.current).toEqual(1);
    act(() => {
      any.next(undefined);
    });
    expect(result.current).toEqual(undefined);
  });
});

describe("external state test", () => {
  const state = createStore<string, unknown>();
  const wrapper: FC = ({ children }) => <Provider config={{ provider: state }}>{children}</Provider>;
  const key = "test";

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
    state.clear();
  });

  test("set provider test", () => {
    const { result } = renderHook(() => useContext(FlowContext), { wrapper });
    expect(result.current?.state).toEqual(state);
  });

  test("set value from external store", () => {
    state.set(key, 1);
    const { result } = renderHook(() => useFlow(key, any), { wrapper });
    expect(result.current).toEqual(1);

    act(() => {
      state.set(key, 2);
    });
    expect(result.current).toEqual(2);
  });

  test("initialValue test when set value from external store", () => {
    state.set(key, 1);
    const { result } = renderHook(() => useFlow(key, any, "initial"), { wrapper });
    expect(result.current).toEqual(1);

    act(() => {
      state.set(key, undefined);
    });
    expect(result.current).toEqual(undefined);

    act(() => {
      state.delete(key);
    });
    expect(result.current).toEqual("initial");

    act(() => {
      state.set(key, 1);
    });
    expect(result.current).toEqual(1);
  });
});
