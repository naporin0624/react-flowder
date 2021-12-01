import base from "../../rollup.config";
import typescript from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";

const config = [
  ...base,
  {
    input: "./src/react/index.ts",
    output: [{ file: "lib/react/index-esm.js", format: "es" }],
    plugins: [
      typescript({
        tsconfigOverride: {
          exclude: ["**/__tests__", "**/*.test.ts"],
        },
      }),
    ],
  },
  {
    input: "./src/react/index.ts",
    output: [{ file: "lib/react/index-cjs.js", format: "cjs", exports: "named" }],
    plugins: [
      typescript({
        tsconfigOverride: {
          exclude: ["**/__tests__", "**/*.test.ts"],
        },
      }),
    ],
  },
  {
    input: "./src/react/index.ts",
    output: [{ file: "lib/react/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
];

export default config;
