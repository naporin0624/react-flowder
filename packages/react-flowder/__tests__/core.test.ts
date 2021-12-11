import { EMPTY, interval, map, Observable } from "rxjs";
import { flowder, getSource } from "../src/core";

const timer = interval();
const timerFlowder = flowder(() => timer);
const emptyFlowder = flowder(() => EMPTY);
const flowderWithArgs = flowder((a: number) => timer.pipe(map((t) => t + a)));

const notObservableFlowder = flowder(() => 1 as unknown as Observable<never>);

describe("flowder test", () => {
  test("key test", () => {
    expect(typeof timerFlowder.toString).toEqual("function");
    expect(typeof timerFlowder.toString()).toEqual("string");
    expect(timerFlowder.toString().startsWith("flowder__")).toEqual(true);
  });
  test("unique key test", () => {
    expect(timerFlowder()).toEqual(timerFlowder());
    expect(timerFlowder()).not.toEqual(emptyFlowder());

    expect(flowderWithArgs(1)).toEqual(flowderWithArgs(1));
    expect(flowderWithArgs(1)).not.toEqual(flowderWithArgs(2));
  });
  test("get source test", () => {
    expect(getSource(timerFlowder())).toEqual(timer);
    expect(getSource(timerFlowder())).not.toEqual(emptyFlowder());
    expect(getSource(timerFlowder())).not.toEqual(flowderWithArgs(0));
  });
  test("not observable test", () => {
    expect(() => getSource(notObservableFlowder())).toThrowError(new Error("The registered Object is not an Observable."));
  });

  test("change key test", () => {
    expect(() => getSource("")).toThrowError(new Error("This flowder has not been registered."));
  });
});
