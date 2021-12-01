import React, { FC, useContext } from "react";
import { Subject } from "rxjs";
import { Provider, useFlow, FlowContext } from "../src";
import { act, renderHook } from "@testing-library/react-hooks";

const Wrapper: FC = ({ children }) => {
  return <Provider>{children}</Provider>;
};

const subject = new Subject<number>();

test("sync data", () => {
  const spy = jest.spyOn(subject, "subscribe");
  const { result } = renderHook(() => useFlow("test", subject), { wrapper: Wrapper });
  expect(result.current).toBe(undefined);
  act(() => {
    subject.next(1);
  });

  expect(result.current).toBe(1);
  expect(spy.mock.calls.length).toBe(1);
  spy.mockRestore();
});

test("subscribe once call", () => {
  const spy = jest.spyOn(subject, "subscribe");
  const { result } = renderHook(
    () => {
      const a = useFlow("test", subject);
      const b = useFlow("test", subject);
      const c = useFlow("test1", subject);
      return [a, b, c] as const;
    },
    { wrapper: Wrapper }
  );
  act(() => {
    subject.next(1);
  });

  expect(result.current).toEqual(expect.arrayContaining([1, 1, 1]));
  expect(spy.mock.calls.length).toBe(2);
  spy.mockRestore();
});

test("unmount test", () => {
  const { result, unmount } = renderHook(() => [useFlow("test", subject), useContext(FlowContext)] as const, { wrapper: Wrapper });
  expect(result.current[0]).toBe(undefined);

  act(() => {
    subject.next(1);
  });
  expect(result.current[0]).toBe(1);
  expect(result.current[1]?.state.get("test")).toBe(1);
  unmount();

  expect(result.current[1]?.state.has("test")).toBe(false);
});

test("context not found", () => {
  const { result } = renderHook(() => useFlow("test", subject));
  expect(result.error).toEqual(new Error("FlowContext is not found"));
});