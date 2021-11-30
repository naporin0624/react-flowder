import React, { FC } from "react";
import { Provider, useFlowder, useFlowderKey } from "../src";
import { BehaviorSubject, map, Observable, from } from "rxjs";
import { cleanup, act, renderHook } from "@testing-library/react-hooks";

const counter = new BehaviorSubject<number>(0);
const add = (count: number) => counter.next(counter.getValue() + count);

type User = {
  id: string;
  name: string;
};
const initialUsers: User[] = [
  {
    id: "test1",
    name: "naporitan1",
  },
  {
    id: "test2",
    name: "naporitan2",
  },
  {
    id: "test3",
    name: "naporitan3",
  },
];
const users = new BehaviorSubject<User[]>(initialUsers);
const getUser = (id: string): Observable<User | undefined> => {
  return users.pipe(map((users) => users.find((user) => user.id === id)));
};
const throwFn = () => {
  return from(new Promise((resolve, reject) => setTimeout(() => reject(new Error("error occurred")), 100)));
};

const initialize = () => {
  users.next(initialUsers);
  counter.next(0);
};

export const inject = {
  counter: () => counter,
  getUser,
  throwFn,
  value: 1,
  fn: () => 1,
};

declare module "../src" {
  type A = typeof inject;
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface FlowderInject extends A {}
}

const Wrapper: FC = ({ children }) => {
  return <Provider value={inject}>{children}</Provider>;
};

describe("test flowder", () => {
  beforeEach(() => {
    initialize();
  });
  afterEach(cleanup);

  describe("context not found", () => {
    const { result } = renderHook(() => useFlowder(useFlowderKey().counter()));
    expect(result.error).toEqual(new Error("FlowderContext not found"));
  });

  describe("counter test", () => {
    test("suspend test", async () => {
      const { result, waitForNextUpdate } = renderHook(() => useFlowder(useFlowderKey().counter()), { wrapper: Wrapper });

      act(() => add(1));

      expect(result.current).toBe(undefined);
      await waitForNextUpdate();

      expect(result.current).toBe(1);
    });

    test("sync test", async () => {
      const { result, waitForNextUpdate } = renderHook(() => useFlowder(useFlowderKey().counter()), { wrapper: Wrapper });

      act(() => add(10));
      await waitForNextUpdate();

      expect(result.current).toBe(10);

      act(() => add(-10));
      expect(result.current).toBe(0);
    });
  });

  describe("object test", () => {
    test("suspend test", async () => {
      const { result, waitForNextUpdate } = renderHook(() => useFlowder(useFlowderKey().getUser("test1")), { wrapper: Wrapper });
      await waitForNextUpdate();

      expect(result.current).toBe(users.getValue().find((user) => user.id === "test1"));
    });

    test("sync test", async () => {
      const { result, waitForNextUpdate } = renderHook(() => useFlowder(useFlowderKey().getUser("test1")), { wrapper: Wrapper });
      await waitForNextUpdate();

      expect(result.current).toBe(users.getValue().find((user) => user.id === "test1"));
      act(() => {
        users.next([{ id: "test2", name: "naporitan" }]);
      });
      expect(result.current).toBe(users.getValue().find((user) => user.id === "test1"));
    });
  });
});
