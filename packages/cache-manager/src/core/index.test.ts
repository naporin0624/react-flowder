import { parser, createCacheManager } from ".";
import { createStore } from "@naporin0624/simple-store";

let keyCount = 0;
const config = {
  buildKey(a: number, b: string) {
    return `buildKey__${++keyCount}_${a}_${b}`;
  },
  noCache: [() => `noCache__${++keyCount}`, { maxAge: 1 }] as const,
  noClear: [() => `noClear__${++keyCount}`, { maxAge: -1 }] as const,
};

describe("validated test", () => {
  test("valid object test", () => {
    const validated = parser(config);
    const [fn, option] = validated.buildKey;
    expect(typeof fn === "function").toBe(true);
    expect(option).toEqual({ maxAge: 5 * 60 * 1000 });
  });
  test("invalid object test", () => {
    expect(() => parser(1)).toThrow(new Error("input is not object"));
    expect(() => parser(null)).toThrow(new Error("input is not object"));
    expect(() => parser(undefined)).toThrow(new Error("input is not object"));
    expect(() => parser([])).toThrow(new Error("input is not Record"));
    expect(() => parser({ error: 1 })).toThrow(new Error(`error is not function`));
  });
});

describe("createRoot test", () => {
  const cacheStore = createStore<string, [unknown, number]>();
  const validated = parser(config);
  const root = createCacheManager(validated, { provider: cacheStore });
  beforeEach(() => {
    root.watch();
    cacheStore.clear();
  });
  afterEach(() => {
    root.stop();
  });

  test("return same object test", async () => {
    expect(config.buildKey(1, "1") === config.buildKey(1, "1")).toEqual(false);

    const result = root.buildKey(1, "1");
    expect(result === root.buildKey(1, "1")).toEqual(true);
    expect(result === root.buildKey(2, "1")).toEqual(false);
  });
  test("cache destruction test", () => {
    let now = Date.now();
    let result = root.noCache();
    Date.now = jest.fn(() => now + 10);
    expect(result === root.noCache()).toEqual(false);

    now = Date.now();
    result = root.buildKey(1, "1");

    Date.now = jest.fn(() => now + 5 * 60 * 1000 + 100);
    expect(result === root.buildKey(1, "1")).toEqual(false);
  });

  test("cache does not disappear test", () => {
    const now = Date.now();
    const result = root.noClear();
    Date.now = jest.fn(() => now * 2);
    expect(result === root.noClear()).toEqual(true);
  });
});
