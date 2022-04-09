import { EMPTY, interval, map, Observable } from "rxjs";

import { datasource, DatasourceKey, getSource } from "../src/core";

const timer = interval();
const timerFlowder = datasource(() => timer);
const emptyFlowder = datasource(() => EMPTY);
const flowderWithArgs = datasource((a: number) => timer.pipe(map((t) => t + a)));

const notObservableFlowder = datasource(() => 1 as unknown as Observable<never>);

describe("flowder test", () => {
  test("key test", () => {
    expect(typeof timerFlowder.toString).toEqual("function");
    expect(typeof timerFlowder.toString()).toEqual("string");
    expect(timerFlowder.toString().startsWith("datasource__")).toEqual(true);
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
    expect(() => getSource("" as DatasourceKey<unknown>)).toThrowError(new Error("This datasource has not been registered."));
  });
});
