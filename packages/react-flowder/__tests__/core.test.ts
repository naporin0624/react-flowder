import { EMPTY, interval, map } from "rxjs";
import { flowder, getSource } from "../src/core";

const timer = interval();
const timerFlowder = flowder(() => timer);
const emptyFlowder = flowder(() => EMPTY);
const flowderWithArgs = flowder((a: number) => timer.pipe(map((t) => t + a)));

describe("flowder test", () => {
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
});
