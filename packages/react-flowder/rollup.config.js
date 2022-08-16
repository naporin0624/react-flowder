import config from "../../rollup.config";
import typescript from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";

const createESMConfig = (dir) => {
  return {
    input: `./src/${dir}/index.ts`,
    output: [{ file: `lib/${dir}/index-esm.js`, format: "es" }],
    external: ["react-flowder"],
    plugins: [
      typescript({
        tsconfigOverride: {
          exclude: ["**/__tests__", "**/*.test.ts"],
        },
      }),
    ],
  };
};
const createCommonConfig = (dir) => {
  return {
    input: `./src/${dir}/index.ts`,
    external: ["react-flowder"],
    output: [{ file: `lib/${dir}/index-cjs.js`, format: "cjs", exports: "named" }],
    plugins: [
      typescript({
        tsconfigOverride: {
          exclude: ["**/__tests__", "**/*.test.ts"],
        },
      }),
    ],
  };
};

const createDeclarationConfig = (dir) => {
  return {
    input: `./src/${dir}/index.ts`,
    output: [{ file: `lib/${dir}/index.d.ts`, format: "es" }],
    plugins: [dts()],
  };
};

export default [
  ...config,
  ...[createESMConfig("utils"), createDeclarationConfig("utils"), createCommonConfig("utils")],
  ...[createESMConfig("apollo"), createDeclarationConfig("apollo"), createCommonConfig("apollo")],
];
