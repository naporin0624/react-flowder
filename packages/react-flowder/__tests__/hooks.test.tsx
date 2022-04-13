import { act, cleanup, renderHook } from "@testing-library/react-hooks";
import React, { FC } from "react";
import { Subject } from "rxjs";

import { datasource } from "../src/core";
import { useDatasourceResolver, usePrefetch, useReadData, useReset } from "../src/hooks";
import { Provider } from "../src/Provider";

const any = new Subject<unknown>();
const resource = datasource(() => any);

describe("useReadData test", () => {
  afterEach(() => {
    cleanup();
  });
  const wrapper: FC = ({ children }) => <Provider>{children}</Provider>;

  test("suspend & data sync test", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useReadData(resource()), { wrapper });
    act(() => {
      any.next(1);
    });
    await waitForNextUpdate();
    expect(result.current).toEqual(1);
    act(() => {
      any.next(2);
    });
    expect(result.current).toEqual(2);
  });

  test("any object sync test", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useReadData(resource()), { wrapper });
    act(() => any.next(1));
    await waitForNextUpdate();

    expect(result.current).toEqual(1);
    act(() => any.next(undefined));
    expect(result.current).toEqual(undefined);
    act(() => any.next(null));
    expect(result.current).toEqual(null);
    act(() => any.next({}));
    expect(result.current).toEqual({});
  });

  test("reset after suspend", async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => {
        const data = useReadData(resource());
        const reset = useReset();
        return { data, reset };
      },
      { wrapper }
    );

    let updated = waitForNextUpdate();
    act(() => {
      any.next(1);
    });
    await updated;
    expect(result.current.data).toEqual(1);

    updated = waitForNextUpdate();
    act(() => {
      result.current.reset();
      any.next(2);
    });
    await updated;
    expect(result.current.data).toEqual(2);
  });

  test("context not found test", () => {
    const { result } = renderHook(() => useReadData(resource()));
    expect(result.error).toEqual(new Error("Provider not found"));
  });
});

describe("usePrefetch test", () => {
  const any = new Subject<unknown>();
  const anyDatasource = datasource(() => any);
  const error = new Error("error");
  const any1 = new Subject<unknown>();
  const errorDatasource = datasource(() => {
    any1.error(error);
    return any1;
  });
  const wrapper: FC = ({ children }) => <Provider>{children}</Provider>;

  test("datasource", async () => {
    const { result } = renderHook(
      () => {
        const prefetch = usePrefetch(anyDatasource);
        const resolver = useDatasourceResolver();
        return { prefetch, resolver };
      },
      { wrapper }
    );
    const prefetched = result.current.prefetch();
    act(() => {
      any.next(1);
    });
    await expect(result.current.resolver.getStatus(anyDatasource()).data).resolves.toEqual(1);
    await expect(prefetched).resolves.not.toThrow();
    expect(result.current.resolver.getStatus(anyDatasource()).data).toEqual(1);
  });

  test("error check", async () => {
    const { result } = renderHook(
      () => {
        const prefetch = usePrefetch(errorDatasource);
        const resolver = useDatasourceResolver();
        return { prefetch, resolver };
      },
      { wrapper }
    );
    const prefetched = result.current.prefetch();
    await expect(prefetched).rejects.toThrow();
    expect(result.current.resolver.getStatus(errorDatasource())).toEqual({ type: "error", data: error });
  });
});
