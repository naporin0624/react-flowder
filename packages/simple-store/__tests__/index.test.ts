import { createStore } from "../src";

let store = createStore<string, number>();

describe("simple-store", () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    store = createStore<string, number>();
  });

  it("initialize test", () => {
    expect(store.size).toBe(0);
  });

  it("set test", () => {
    store.set("test1", 1);
    expect(store.get("test1")).toBe(1);
  });

  it("delete test", () => {
    store.set("test1", 1);
    expect(store.get("test1")).toBe(1);
    store.delete("test1");
    expect(store.get("test1")).toBe(undefined);
  });

  it("clear test", () => {
    store.set("test1", 1);
    expect(store.get("test1")).toBe(1);
    store.clear();
    expect(store.size).toBe(0);
  });

  it("update test", () => {
    store.set("test1", 1);
    expect(store.get("test1")).toBe(1);
    store.set("test1", 2);
    expect(store.get("test1")).toBe(2);
  });

  it("subscribe test", (done) => {
    store.subscribe(() => {
      expect(store.get("test1")).toBe(1);
      done();
    });
    store.set("test1", 1);
  });
});
