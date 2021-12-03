import { createStore } from "@naporin0624/simple-store";
import { createFlowRoot } from "../src/context";
import { Subject, Subscription } from "rxjs";

const state = createStore<string, unknown>();
const counter = new Map<string, number>();
const disposer = new Map<string, Subscription>();

const flowRoot = createFlowRoot({ state, counter, disposer });

test("test", () => {
  const flowRoot = createFlowRoot();
  expect(flowRoot).not.toEqual(state);
});

describe("context test", () => {
  afterEach(() => {
    state.clear();
    counter.clear();
    disposer.clear();
    jest.clearAllMocks();
  });

  const key = "key";
  const any = new Subject<unknown>();

  test("inject state test", () => {
    expect(flowRoot.state).toEqual(state);
  });

  test("register test", () => {
    const spy = jest.spyOn(any, "subscribe");
    expect(counter.get(key)).toBe(undefined);
    flowRoot.register(key, any);
    expect(spy.mock.calls.length).toBe(1);
    expect(counter.get(key)).toBe(1);

    flowRoot.register(key, any);
    expect(counter.get(key)).toBe(2);
    expect(spy.mock.calls.length).toBe(1);
  });

  test("lift test", () => {
    const spy = jest.spyOn(any, "subscribe");
    expect(counter.get(key)).toBe(undefined);
    flowRoot.register(key, any);
    expect(spy.mock.calls.length).toBe(1);
    expect(counter.get(key)).toBe(1);

    flowRoot.lift(key);
    expect(counter.get(key)).toBe(0);

    flowRoot.lift(key);
    expect(counter.get(key)).toBe(0);
  });
});
