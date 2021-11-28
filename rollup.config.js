import typescript from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";

const config = [
  {
    input: "./src/index.ts",
    output: [{ file: "lib/index-esm.js", format: "es" }],
    plugins: [
      typescript({
        tsconfigOverride: {
          exclude: ["**/__tests__", "**/*.test.ts"],
        },
      }),
    ],
  },
  {
    input: "./src/index.ts",
    output: [{ file: "lib/index-cjs.js", format: "cjs", exports: "named" }],
    plugins: [
      typescript({
        tsconfigOverride: {
          exclude: ["**/__tests__", "**/*.test.ts"],
        },
      }),
    ],
  },
  {
    input: "./src/index.ts",
    output: [{ file: "lib/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
];

export default config;
