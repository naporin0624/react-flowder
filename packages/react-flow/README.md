# `react-flow`

A library that connects rxjs to React.

Observables registered with the same key are subscribed only once in total.

## Usage

```jsx
import ReactDOM from "react-dom";
import React from "react";
import { Subject } from "rxjs";
import { Provider, useFlow } from "@naporin0624/react-flow";
const root = new Subject();
const counter = root.pipe(scan((acc, value) => acc + value, 0));
const increment = () => root.next(1);
const decrement = () => root.next(-1);

const Counter = () => {
	const counter = useFlow("counter", counter$);
	
	return (
		<div>
			<p>counter: {counter}</p>
			<div>
				<button onClick={increment}>+</button>
				<button onClick={decrement}>-</button>
			</div>
		</div>
	)
}

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
	)
}
```

## LICENSE

MIT