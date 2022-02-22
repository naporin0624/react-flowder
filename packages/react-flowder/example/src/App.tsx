import {
  datasource,
  usePrefetch,
  useReadData,
  useReset,
} from '@naporin0624/react-flowder';
import React, { Suspense, useState, VFC } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import {
  concatMap,
  from,
  interval,
  map,
  merge,
  of,
  Subject,
  throwError,
  timestamp,
} from 'rxjs';

type Props = {};
type Todo = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
};

function fetchTodos(): Promise<Todo[]>;
function fetchTodos(id: number): Promise<Todo>;
async function fetchTodos(id?: number) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/todos/${id ?? ''}`,
  );
  if (response.ok) {
    return response.json();
  } else {
    console.log('throw ');
    throw new Error('error');
  }
}
const timer = datasource(() => interval(1000));
const todos = datasource((id: number) => from(fetchTodos(id)));
const any = new Subject<unknown>();
const error$ = merge(
  any,
  interval(1000).pipe(
    timestamp(),
    map(({ timestamp }) => timestamp),
  ),
).pipe(
  concatMap((value) => {
    console.log(value);
    if (value instanceof Error) return throwError(() => value);
    return of(value);
  }),
);
const error = datasource(() => error$);

const TodoView = ({ id }: { id: number }) => {
  const todo = useReadData(todos(id));

  return (
    <p style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(todo, null, 2)}</p>
  );
};

const ErrorComponent = () => {
  const data = useReadData(error());

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <p>timestamp: {JSON.stringify(data, null, 2)}</p>
    </div>
  );
};
const ErrorFallback: VFC<FallbackProps> = ({
  error: e,
  resetErrorBoundary,
}) => {
  const reset = useReset(error);
  const onClick = () => {
    reset();
    any.next(Date.now());
    resetErrorBoundary();
  };

  return (
    <div>
      <p>{e.message}</p>
      <button onClick={onClick}>RESET</button>
    </div>
  );
};

function App({}: Props) {
  const time = useReadData(timer());
  const [visible, setVisible] = useState(false);
  const [fetchedID, setFetchedId] = useState<number>();

  const prefetch = usePrefetch(todos);

  return (
    <div className="App">
      <p>clock: {time}</p>
      <button
        onClick={async () => {
          await prefetch(time);
          setFetchedId(time);
          setVisible((b) => !b);
        }}
      >
        {visible ? 'hide' : 'show'}
      </button>

      <section>{visible && !!fetchedID && <TodoView id={fetchedID} />}</section>

      <Suspense fallback={<p>loading...</p>}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <ErrorComponent />
          <button onClick={() => any.next(new Error('error dayooo'))}>
            ERROR
          </button>
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}

export default App;
