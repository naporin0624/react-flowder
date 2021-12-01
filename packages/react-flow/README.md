# `react-flow`

A library that connects rxjs to React.

Observables registered with the same key are subscribed only once in total.

[![Image from Gyazo](https://i.gyazo.com/0b5f38a4c3e943eff75ebdfc8a6ba16e.gif)](https://gyazo.com/0b5f38a4c3e943eff75ebdfc8a6ba16e)

## Usage

```jsx
import ReactDOM from "react-dom";
import { Subject, scan } from "rxjs";
import { Provider, useFlow } from "@naporin0624/react-flow";

const root = new Subject<number>();
const counter$ = root.pipe(
  scan<number, number>((acc, value) => acc + value, 0)
);
const increment = () => root.next(1);
const decrement = () => root.next(-1);

const Counter = () => {
  const counter = useFlow("counter", counter$) ?? 0;

  return (
    <div>
      <p>counter: {counter}</p>
      <div>
        <button onClick={increment}>+</button>
        <button onClick={decrement}>-</button>
      </div>
    </div>
  );
};

// The counter subscribe is called only once.
const App = () => {
  return (
    <Provider>
      <div>
        <p>counter1</p>
        <Counter />
      </div>
      <div>
        <p>counter2</p>
        <Counter />
      </div>
    </Provider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
```

## LICENSE

MIT
