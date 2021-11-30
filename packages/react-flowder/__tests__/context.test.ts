import stringify from "fast-json-stable-stringify";
import { isObservable } from "rxjs";
import { createFlowderRoot } from "../src/context";
import { inject } from "./index.test";

describe("keyBuilder test", () => {
  test("keyBuilder key test", () => {
    const { keyBuilder } = createFlowderRoot(inject);
    expect(Object.keys(keyBuilder)).toEqual(expect.arrayContaining(["counter", "getUser", "throwFn"]));
  });

  test("keyBuilder toString test", () => {
    const { keyBuilder } = createFlowderRoot(inject);
    expect(keyBuilder.counter().toString()).toEqual(`counter__[]`);
    const input = ["test"];
    expect(keyBuilder.getUser(input[0]).toString()).toEqual(`getUser__${stringify(input)}`);
    expect(keyBuilder.throwFn().toString()).toEqual(`throwFn__[]`);
  });

  test("keyBuilder config test", () => {
    const { keyBuilder } = createFlowderRoot(inject);
    expect(keyBuilder.counter().config).toEqual({ key: "counter", args: [] });
    expect(keyBuilder.getUser("test").config).toEqual({ key: "getUser", args: ["test"] });
    expect(keyBuilder.throwFn().config).toEqual({ key: "throwFn", args: [] });
  });
});

describe("from test", () => {
  test("test", () => {
    const { keyBuilder, from } = createFlowderRoot(inject);
    const $ = from(keyBuilder.counter());
    expect(isObservable($)).toEqual(true);
  });

  test("invalid key", () => {
    const { keyBuilder, from } = createFlowderRoot(inject);
    const key = new Proxy(keyBuilder.counter(), {
      get(target, prop) {
        if (prop === "config") {
          return { key: "value", args: [] };
        }
        return (target as any)[prop];
      },
    });
    expect(() => from(key)).toThrow("value is not function");
  });

  test("not injection", () => {
    const { keyBuilder, from } = createFlowderRoot(inject);
    const key = new Proxy(keyBuilder.counter(), {
      get(target, prop) {
        if (prop === "config") {
          return { key: "reject", args: [] };
        }
        return (target as any)[prop];
      },
    });
    expect(() => from(key)).toThrow("reject is not inject");
  });

  test("not observable", () => {
    const { keyBuilder, from } = createFlowderRoot(inject);
    const key = new Proxy(keyBuilder.counter(), {
      get(target, prop) {
        if (prop === "config") {
          return { key: "fn", args: [] };
        }
        return (target as any)[prop];
      },
    });
    expect(() => from(key)).toThrow("fn is not Observable");
  });
});
