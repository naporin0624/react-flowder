# `simple-store`

Simple state management using Set objects.

[![Image from Gyazo](https://i.gyazo.com/8601ece7cc54d0439551cd306e586a0f.gif)](https://gyazo.com/8601ece7cc54d0439551cd306e586a0f)

## Usage

```typescript
import { createStore } from "@naporin0624/simple-store";

const store = createStore<string, number>();
const counter = document.createElement("p");
counter.innerText = `count: ${0}`;

store.subscribe(() => {
  const count = store.get("count") ?? 0;
  counter.innerText = `count: ${count}`;
});

const increment = document.createElement("button");
increment.onclick = () => {
  const count = store.get("count") ?? 0;
  store.set("count", count + 1);
};
increment.innerText = "increment";

const decrement = document.createElement("button");
decrement.onclick = () => {
  const count = store.get("count") ?? 0;
  store.set("count", count - 1);
};
decrement.innerText = "decrement";

const app = document.getElementById("app");
if (!app) throw new Error();

app.innerHTML = `
  <h1>Hello Simple Store</h1>
`;
app.appendChild(counter);
app.appendChild(increment);
app.appendChild(decrement);
```
