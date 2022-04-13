import React, { memo, VFC } from "react";
import Sandpack from "../components/Sandpack";

const dependencies = {
  react: "*",
  "react-dom": "*",
  rxjs: "*",
  "@naporin0624/react-flowder": "*",
}

const IndexPage: VFC = () => {
  return (
    <section>
      <h1>Simple Usage</h1>
      <Sandpack
        template="react-ts"
        customSetup={{
          dependencies,
          files: { "/App.tsx": SAMPLE_CODE }
        }}
        theme="sandpack-dark"
        options={{ editorHeight: 650 }}
      />
    </section>
  );
};

export default memo(IndexPage);

const SAMPLE_CODE = `import React, { Suspense } from "react";
import { interval } from "rxjs";
import { datasource, useReadData, Provider } from "@naporin0624/react-flowder";

const timer = datasource(() => interval(1000));

const Timer = () => {
  const time = useReadData(timer());

  return (
    <div>
      <p>time: {time}</p>
    </div>
  )
}

const App = () => (
  <Provider>
    <Suspense fallback={<p>loading</p>}>
      <Timer />
    </Suspense>
  </Provider>
);

export default App;
`;
