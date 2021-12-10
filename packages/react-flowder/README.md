# `react-flowder`

A library that connects rxjs to React and uses suspense to load data on the first subscribe.

[![Image from Gyazo](https://i.gyazo.com/505d0082dcff533299cb631f616f1cd5.gif)](https://gyazo.com/505d0082dcff533299cb631f616f1cd5)

## Usage

```jsx
import { render } from "react-dom";
import { Provider, flowder, useFlowder } from "@naporin0624/react-flowder";
import {
  concatMap,
  interval,
  map,
  merge,
  of,
  Subject,
  throwError,
  timestamp
} from "rxjs";
import { Suspense, useState, VFC } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

const timer = interval(100);
const any = new Subject<unknown>();
const error = merge(
  any,
  timer.pipe(
    timestamp(),
    map(({ timestamp }) => timestamp)
  )
).pipe(
  concatMap((value) => {
    if (value instanceof Error) return throwError(() => value);
    return of(value);
  })
);

const flowders = {
  timer: flowder(() => timer),
  timerWithArgs: flowder((offset: number) =>
    timer.pipe(map((t) => t + offset))
  ),
  error: flowder(() => error)
};

const Timer = () => {
  const time = useFlowder(flowders.timer());
  return <div>count: {time}</div>;
};
const OffsetTimer = () => {
  const [offset, setOffset] = useState(0);
  const time = useFlowder(flowders.timerWithArgs(offset));

  return (
    <div style={{ display: "flex", gap: 12 }}>
      <p>count: {time}</p>
      <input
        type="number"
        value={offset}
        onChange={(e) => setOffset(parseInt(e.target.value, 10))}
      />
    </div>
  );
};

const ErrorComponent = () => {
  const data = useFlowder(flowders.error());

  return (
    <div style={{ display: "flex", gap: 12 }}>
      <p>timestamp: {JSON.stringify(data, null, 2)}</p>
    </div>
  );
};

const ErrorFallback: VFC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const onClick = () => {
    any.next(Date.now());
    resetErrorBoundary();
  };

  return (
    <div>
      <p>{error.message}</p>
      <button onClick={onClick}>RESET</button>
    </div>
  );
};

const App = () => {
  const time = useFlowder(flowders.timer());

  return (
    <div>
      <div style={{ display: "flex", gap: 12 }}>
        <Timer />
        <Timer />
        <p>{time}</p>
      </div>
      <hr />
      <Suspense fallback={"offset timer"}>
        <OffsetTimer />
      </Suspense>
      <hr />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ErrorComponent />
        <button onClick={() => any.next(new Error("error dayooo"))}>
          ERROR
        </button>
      </ErrorBoundary>
    </div>
  );
};

const rootElement = document.getElementById("root");
render(
  <Suspense fallback={null}>
    <Provider>
      <App />
    </Provider>
  </Suspense>,
  rootElement
);
```

## LICENSE

MIT

