# `react-flowder`

A library that connects rxjs to React and uses suspense to load data on the first subscribe.

![505d0082dcff533299cb631f616f1cd5](https://user-images.githubusercontent.com/32933709/145654002-6ae8b5ee-ebce-45ab-9af7-3894e4450f10.gif)

## Usage

- [example-page](https://packages-sigma.vercel.app/)
- [blog](https://naporitan.hatenablog.com/entry/2022/03/23/194002)

```jsx
import React, { Suspense } from "react";
import { render } from "react-dom";
import { interval } from "rxjs";
import { datasource, useReadData, Provider } from "@naporin0624/react-flowder";

const timer = datasource(() => interval(1000));

const Timer = () => {
  const time = useReadData(timer());

  return (
    <div>
      <p>time: {time}</p>
    </div>
  );
};

const App = () => (
  <Provider>
    <Suspense fallback={<p>loading</p>}>
      <Timer />
    </Suspense>
  </Provider>
);

export default App;
```

## LICENSE

MIT
