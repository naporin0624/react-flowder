import React, { memo, VFC } from "react";
import Sandpack from "../components/Sandpack";

const dependencies = {
  react: "*",
  "react-dom": "*",
  rxjs: "*",
  "@naporin0624/react-flowder": "*",
  "react-error-boundary": "*",
}

const ErrorPage: VFC = () => {
  return (
    <section>
      <h1>Usage in which datasource outputs an error.</h1>
      <p>
        A sample that creates an observable that merges subject and interval,
        and raises an error when the button is pressed.
      </p>
      <Sandpack
        template="react-ts"
        customSetup={{ dependencies, files: { "/App.tsx": SAMPLE_CODE } }}
        theme="sandpack-dark"
        options={{ editorHeight: 650 }}
      />
    </section>
  );
};

export default memo(ErrorPage);

const SAMPLE_CODE = `import React, { Suspense } from "react";
import { render } from "react-dom";
import { interval, Subject, merge, concatMap, timestamp, map, of, throwError } from "rxjs";
import { datasource, useReadData, Provider, useReset } from "@naporin0624/react-flowder";
import { ErrorBoundary } from "react-error-boundary";

const any = new Subject<unknown>();
const resource = merge(
  any,
  interval(1000).pipe(
    timestamp(),
    map(({ timestamp }) => timestamp),
  ),
).pipe(
  concatMap((value) => {
    if (value instanceof Error) return throwError(() => value);
    return of(value);
  }),
);

const timer = datasource(() => resource);

const Timer = () => {
	const time = useReadData(timer());

  return (
    <div>
      <p>time: {time}</p>
    </div>
  )
};

const ErrorFallback: VFC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const reset = useReset(timer);
  const onClick = () => {
    resetErrorBoundary();
    reset();
  };

  return (
    <div>
      <p>{error.message}</p>
      <button onClick={onClick}>reset</button>
    </div>
  );
};

const App = () => {
  const error = () => {
    any.next(new Error("error dayooo"));
  }

	return (
    <Provider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<p>loading</p>}>
          <Timer />
          <button onClick={error}>error</button>
        </Suspense>
      </ErrorBoundary>
    </Provider>
  )
};

export default App;
`;
