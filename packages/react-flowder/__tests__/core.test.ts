import { interval, isObservable } from "rxjs";
import { flowder } from "../src/core";

const timer = interval();
const key1 = flowder(timer);
const key2 = flowder(timer);

describe("flowder test", () => {
  test("unique key test", () => {
    expect(key1.toString() === key2.toString()).toBe(false);
  });
  test("source property test", () => {
    expect(isObservable(key1.source)).toBe(true);
    expect(isObservable(key2.source)).toBe(true);
  });
});
