# `react-flowder`

A library that connects rxjs to React and uses suspense to load data on the first subscribe.

[![Image from Gyazo](https://i.gyazo.com/cd01bc2a86813a612e0633d3cbcb39f4.gif)](https://gyazo.com/cd01bc2a86813a612e0633d3cbcb39f4)

## Usage

```jsx
import { render } from "react-dom";
import { Provider, flowder, useFlowder } from "@naporin0624/react-flowder";
import { EMPTY, interval, throwIfEmpty } from "rxjs";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const timer = interval(100);
const flowders = {
  timer: flowder(timer),
  error: flowder(EMPTY.pipe(throwIfEmpty(() => new Error("error!!"))))
};

const Timer = () => {
  const time = useFlowder(flowders.timer);
  return <div>count: {time}</div>;
};

const ErrorComponent = () => {
  const data = useFlowder(flowders.error);

  return <p>{data}</p>;
};

const App = () => {
  const time = useFlowder(flowders.timer);
  return (
    <div>
      <div style={{ display: "flex", gap: 12 }}>
        <Timer />
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

