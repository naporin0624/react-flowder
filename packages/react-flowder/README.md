# `react-flowder`

A library that connects rxjs to React and uses suspense to load data on the first subscribe.

[![Image from Gyazo](https://i.gyazo.com/cd01bc2a86813a612e0633d3cbcb39f4.gif)](https://gyazo.com/cd01bc2a86813a612e0633d3cbcb39f4)

## Usage

```jsx
import { render } from "react-dom";
import { Provider, flowder, useFlowder } from "@naporin0624/react-flowder";
import { EMPTY, interval, throwIfEmpty, map } from "rxjs";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

const timer = interval(100);
const flowders = {
  timer: flowder(() => timer),
  timerWithArgs: flowder((offset: number) => timer.pipe(map(t => t + offset))),
  error: flowder(() => EMPTY.pipe(throwIfEmpty(() => new Error("error!!"))))
};

const Timer = () => {
  const time = useFlowder(flowders.timer());
  return <div>count: {time}</div>;
};
const OffsetTimer = () => {
  const [offset, setOffset] = useState(0);
  const time = useFlowder(flowders.timerWithArgs(offset));

  return (
    <div>
      <p>count: {time}</p>
      <input type="number" value={offset} onChange={e => setOffset(parseInt(e.target.value, 10))}>
    </div>
  )
}

const ErrorComponent = () => {
  const data = useFlowder(flowders.error());

  return <p>{data}</p>;
};

const App = () => {
  const time = useFlowder(flowders.timer);
  return (
    <div>
      <div style={{ display: "flex", gap: 12 }}>
        <Timer />
        <OffsetTimer />
        {time % 2 === 0 && <Timer />}
      </div>
      <ErrorBoundary
        FallbackComponent={({ error, resetErrorBoundary }) => (
          <div>
            <p>{error.message}</p>
            <button onClick={resetErrorBoundary}>reset</button>
          </div>
        )}
      >
        <ErrorComponent />
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

