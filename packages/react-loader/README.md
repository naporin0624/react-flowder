# `react-loader`

Simple data loader hooks that use Suspense.

[![Image from Gyazo](https://i.gyazo.com/4bac571679807edb0a6ef722aa1a08d8.gif)](https://gyazo.com/4bac571679807edb0a6ef722aa1a08d8)

## Usage

```jsx
import { render } from "react-dom";
import { Suspense, useEffect, useState } from "react";
import { Cache, useLoader } from "@naporin0624/react-loader";

import Nprogress from "nprogress";
import "nprogress/nprogress.css";

const timeout = (ms: number) => {
  return new Promise<number>((resolve) => setTimeout(() => resolve(ms), ms));
};

const App = () =>  {
  const [count, setCount] = useState(100);
  const data = useLoader(`timeout_${count}`, () => timeout(count));

  return (
    <div>
      <input
        type="number"
        value={count}
        onChange={(e) => setCount(parseInt(e.target.value, 10))}
        step={100}
        min={0}
      />

      <p>result: {data}</p>
    </div>
  );
}

const Fallback = () => {
  useEffect(() => {
    Nprogress.start();
    return () => {
      Nprogress.done();
    };
  }, []);
  return null;
};

render(
  <Cache>
    <Suspense fallback={<Fallback />}>
      <Cache>
        <App />
      </Cache>
    </Suspense>
  </Cache>,
  document.getElementById("root")
);
```

## LICENSE

MIT

