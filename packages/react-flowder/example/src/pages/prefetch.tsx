import React, { memo, VFC } from "react";
import Sandpack from "../components/Sandpack";

const dependencies = {
  react: "*",
  "react-dom": "*",
  rxjs: "*",
  "@naporin0624/react-flowder": "*",
}

const PrefetchPage: VFC = () => {
  return (
    <section>
      <h1>Usage to pre-fetch the datasource.</h1>
      <p>
        usePrefetch is a custom hook that takes a datasource as an argument.
      </p>
      <p>
        If you do useReadData after doing prefetch, you can get the data without
        Suspend.
      </p>
      <Sandpack
        template="react-ts"
        customSetup={{
          dependencies,
          files: {
            "/App.tsx": SAMPLE_CODE,
            "/resource.ts": RESOURCE_FILE,
            "/datasource.ts": DATASOURCE_FILE,
          },
        }}
        theme="sandpack-dark"
        options={{ editorHeight: 650 }}
      />
    </section>
  );
};

export default memo(PrefetchPage);

const RESOURCE_FILE = `import { map, interval } from "rxjs";

export const timer = () => interval(1500).pipe(map(x => x + 1));

type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};
export async function todo(id: number) {
  const promise = fetch(\`https://jsonplaceholder.typicode.com/todos/$\{id\}\`);
  const [response] = await Promise.all([
    promise,
    new Promise((resolve) => setTimeout(resolve, 500)),
  ]);

  if (response.ok) {
    return response.json();
  } else {
    throw new Error('error');
  }
} 
`;
const DATASOURCE_FILE = `import { datasource, fromAsyncFunction } from "@naporin0624/react-flowder";
import * as resource from "./resource";

export const timer = datasource(resource.timer);
export const todos = fromAsyncFunction(resource.todo);
`;
const SAMPLE_CODE = `import React, { Suspense, useState } from "react";
import { useReadData, Provider, usePrefetch } from "@naporin0624/react-flowder";
import { todos, timer } from "./datasource";

const TodoView: VFC<Props> = ({ id }: { id: number }) => {
  const todo = useReadData(todos(id));

  return (
    <p style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(todo, null, 2)}</p>
  );
};

const PrefetchTodo = () => {
  const time = useReadData(timer());
  const [fetchedId, setFetchedId] = useState(1);
  const [loading, setLoading] = useState(false);
  const prefetchTodo = usePrefetch(todos);
  const fetch = async () => {
    if (loading) {
      return console.log('fetching now');
    }

    setLoading(true);
    try {
      const id = time + 1;
      const prefetch = Array(5).fill(0).map((_, idx) => prefetchTodo(idx + id))
      await Promise.all(prefetch);
      setFetchedId(id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p>time: {time}</p>
      <button onClick={fetch}>{loading ? 'loading' : 'click'}</button>
      <div>{!loading && <TodoView id={fetchedId} />}</div>
    </div>
  )
}

const Todo = () => {
  const time = useReadData(timer());

  return (
    <TodoView id={time} />
  )
}

const App = () => (
  <Provider>
    <Suspense fallback={<p>loading</p>}>
      <PrefetchTodo />
      <Suspense fallback={'todo view loading...'}>
        <Todo />
      </Suspense>
    </Suspense>
  </Provider>
);

export default App;
`;
