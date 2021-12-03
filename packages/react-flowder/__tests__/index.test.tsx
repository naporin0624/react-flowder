import React, { FC } from "react";
import { useFlowder, flowder, Provider } from "../src";
import { act, cleanup, renderHook } from "@testing-library/react-hooks";
import { interval, isObservable, BehaviorSubject } from "rxjs";

describe("react-flowder test", () => {
  afterEach(cleanup);
  const wrapper: FC = ({ children }) => {
    return <Provider>{children}</Provider>;
  };
  const timer = interval();
  const key1 = flowder(timer);
  const key2 = flowder(timer);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const any = new BehaviorSubject<unknown>(1);
  const anyKey = flowder(any);

  describe("flowder test", () => {
    test("unique key test", () => {
      expect(key1.toString() === key2.toString()).toBe(false);
    });
    test("source property test", () => {
      expect(isObservable(key1.source)).toBe(true);
      expect(isObservable(key2.source)).toBe(true);
    });
  });

  describe("useFlowder test", () => {
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
      /* FIXME: suspend 後の useFlow には値が入っていない.
       * subscribe するのは ReactComponent の mount 後なので初期値は undefined
       * そのあとに undefined が送られてきても再レンダリング抑制が働くので....
       */
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
});
