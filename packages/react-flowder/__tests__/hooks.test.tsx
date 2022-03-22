import React, { FC } from "react";
import { datasource } from "../src/core";
import { useReadData, useReset, useProvider, usePrefetch } from "../src/hooks";
import { Provider } from "../src/Provider";
import { act, cleanup, renderHook } from "@testing-library/react-hooks";
import { interval, BehaviorSubject, map, Subject } from "rxjs";

const timer = interval();
const timerDatasource = datasource(() => timer);
const any = new BehaviorSubject<unknown>(1);
const anyDatasource = datasource(() => any);

const number = new Subject<number>();
const datasourceWithArgs = datasource((offset: number) => number.pipe(map((t) => t + offset)));

describe("useReadData test", () => {
  afterEach(() => {
    cleanup();
    any.next(1);
  });
  const wrapper: FC = ({ children }) => <Provider>{children}</Provider>;

  test("suspend & data sync test", async () => {
    const { result, waitForNextUpdate, waitFor } = renderHook(() => useReadData(timerDatasource()), { wrapper });
    await waitForNextUpdate();
    expect(result.current).toEqual(0);
    await waitFor(() => result.current === 1, { timeout: 1500 });
    expect(result.current).toEqual(1);
  });

  test("datasourceWithArgs suspend & data sync test", async () => {
    const { result, waitForNextUpdate, rerender } = renderHook<{ offset: number }, number>(({ offset }) => useReadData(datasourceWithArgs(offset)), {
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
    const { result, waitForNextUpdate } = renderHook(() => useReadData(anyDatasource()), { wrapper });
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
    const { result } = renderHook(() => useReadData(anyDatasource()));
    expect(result.error).toEqual(new Error("Provider not found"));
  });
});

describe("useReset test", () => {
  afterEach(() => {
    cleanup();
    any.next(1);
  });
  const wrapper: FC = ({ children }) => <Provider>{children}</Provider>;
  const number = new BehaviorSubject<number>(0);
  const datasourceWithArgs = datasource((offset: number) => number.pipe(map((t) => t + offset)));

  test("resetAll test", async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => {
        useReadData(datasourceWithArgs(1));
        const context = useProvider();
        const reset = useReset();
        return { context, reset };
      },
      { wrapper }
    );
    await waitForNextUpdate();

    expect(result.current.context.cache.size).not.toEqual(0);
    expect(result.current.context.flow.state.size).not.toEqual(0);

    result.current.reset();
    expect(result.current.context.cache.size).toEqual(0);
    expect(result.current.context.flow.state.size).toEqual(0);
  });

  test("resetWithKey test (datasourceBuilder)", async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => {
        useReadData(anyDatasource());
        useReadData(timerDatasource());
        const context = useProvider();
        const reset = useReset(anyDatasource);
        return { context, reset };
      },
      { wrapper }
    );

    await waitForNextUpdate();
    expect(Array.from(result.current.context.cache.keys()).some((key) => key.startsWith(anyDatasource().toString()))).toEqual(true);
    expect(Array.from(result.current.context.flow.state.keys()).some((key) => key.startsWith(anyDatasource().toString()))).toEqual(true);

    result.current.reset();
    expect(Array.from(result.current.context.cache.keys()).some((key) => key.startsWith(anyDatasource().toString()))).toEqual(false);
    expect(Array.from(result.current.context.flow.state.keys()).some((key) => key.startsWith(anyDatasource().toString()))).toEqual(false);
  });

  test("resetWithKey test (datasourceKey)", async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => {
        useReadData(anyDatasource());
        useReadData(datasourceWithArgs(0));
        useReadData(datasourceWithArgs(1));
        const context = useProvider();
        const reset = useReset(datasourceWithArgs(1));
        return { context, reset };
      },
      { wrapper }
    );

    await waitForNextUpdate();
    expect(Array.from(result.current.context.cache.keys()).some((key) => key === datasourceWithArgs(1).toString())).toEqual(true);
    expect(Array.from(result.current.context.flow.state.keys()).some((key) => key === datasourceWithArgs(1).toString())).toEqual(true);

    act(() => {
      result.current.reset();
    });

    // reset された時点で loader が走り始めるので key は作られる
    expect(result.current.context.cache.get(datasourceWithArgs(1))?.type).toEqual("pending");
    expect(Array.from(result.current.context.flow.state.keys()).some((key) => key === datasourceWithArgs(1).toString())).toEqual(false);
  });
});

describe("usePrefetch test", () => {
  const any = new Subject<unknown>();
  const anyDatasource = datasource(() => {
    return any;
  });
  const error = new Error("error");
  const any1 = new Subject<unknown>();
  const errorDatasource = datasource(() => {
    any1.error(error);
    return any1;
  });
  const wrapper: FC = ({ children }) => <Provider>{children}</Provider>;

  test("datasource", async () => {
    const { result, waitFor } = renderHook(
      () => {
        const prefetch = usePrefetch(anyDatasource);
        const context = useProvider();
        return { prefetch, context };
      },
      { wrapper }
    );
    act(() => {
      result.current.prefetch();
      any.next(1);
    });
    await waitFor(() => result.current.context.cache.get(anyDatasource())?.type !== undefined);

    expect(result.current.context.cache.get(anyDatasource())).toEqual({ type: "success", payload: 1 });
  });

  test("error check", async () => {
    const { result, waitFor } = renderHook(
      () => {
        const prefetch = usePrefetch(errorDatasource);
        const context = useProvider();
        return { prefetch, context };
      },
      { wrapper }
    );
    act(() => {
      result.current.prefetch().catch(() => {
        //
      });
    });

    await waitFor(() => result.current.context.cache.get(errorDatasource())?.type !== undefined);

    expect(result.current.context.cache.get(errorDatasource())).toEqual({ type: "error", payload: error });
  });
});
