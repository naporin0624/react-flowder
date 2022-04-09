import { createStore } from "@naporin0624/simple-store";
import { act, cleanup, renderHook } from "@testing-library/react-hooks";
import React, { FC, useContext, useState } from "react";
import { concatMap, of, Subject, throwError } from "rxjs";

import { Provider, useFlow, FlowContext, Status } from "../src";

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

  test("change key test", () => {
    const { result } = renderHook(
      () => {
        const [key, setKey] = useState("test");
        const result = useFlow(key, any, "initial");
        return { result, setKey };
      },
      { wrapper }
    );

    expect(result.current.result).toEqual("initial");
    act(() => {
      any.next(1);
    });
    expect(result.current.result).toEqual(1);

    act(() => {
      result.current.setKey("test1");
    });
    expect(result.current.result).toEqual("initial");
  });

  test("change $ test", () => {
    const any1 = new Subject<unknown>();
    const { result } = renderHook(
      () => {
        const [$, set$] = useState(any);
        const [initial, setInitial] = useState("initial");
        const result = useFlow("test", $, initial);
        return { result, set$, setInitial };
      },
      { wrapper }
    );

    expect(result.current.result).toEqual("initial");
    act(() => {
      any.next(1);
    });
    expect(result.current.result).toEqual(1);

    act(() => {
      result.current.set$(any1);
    });
    expect(result.current.result).toEqual("initial");

    act(() => {
      any1.next(1);
    });
    expect(result.current.result).toEqual(1);
  });

  test("change initial test", () => {
    const { result } = renderHook(
      () => {
        const [initial, setInitial] = useState("initial");
        const data = useFlow("test", any, initial);
        return { data, setInitial };
      },
      { wrapper }
    );

    expect(result.current.data).toEqual("initial");
    act(() => {
      result.current.setInitial("test");
    });
    expect(result.current.data).toEqual("test");

    act(() => {
      any.next(1);
    });
    expect(result.current.data).toEqual(1);
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
  const state = createStore<string, Status>();
  const wrapper: FC = ({ children }) => <Provider config={{ provider: state }}>{children}</Provider>;
  const key = "test";

  const anyWithError$ = any.pipe(
    concatMap((value) => {
      if (value instanceof Error) return throwError(() => value);
      return of(value);
    })
  );

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
    state.set(key, { type: "success", payload: 1 });
    const { result } = renderHook(() => useFlow(key, any), { wrapper });
    expect(result.current).toEqual(1);

    act(() => {
      state.set(key, { type: "success", payload: 2 });
    });
    expect(result.current).toEqual(2);
  });

  test("initialValue test when set value from external store", () => {
    state.set(key, { type: "success", payload: 1 });
    const { result } = renderHook(() => useFlow(key, any, "initial"), { wrapper });
    expect(result.current).toEqual(1);

    act(() => {
      state.set(key, { type: "success", payload: undefined });
    });
    expect(result.current).toEqual(undefined);

    act(() => {
      state.delete(key);
    });
    expect(result.current).toEqual("initial");

    act(() => {
      state.set(key, { type: "success", payload: 1 });
    });
    expect(result.current).toEqual(1);
  });

  test("error observable test", async () => {
    const { result } = renderHook(() => useFlow("test", anyWithError$), { wrapper });
    act(() => {
      any.next(1);
    });
    expect(result.current).toEqual(1);
    const error = new Error("error");
    act(() => {
      any.next(error);
    });
    expect(result.error).toEqual(error);

    act(() => {
      any.next(2);
    });
    expect(result.error).toEqual(error);
    expect(state.get("test")).toEqual(undefined);
  });
});
