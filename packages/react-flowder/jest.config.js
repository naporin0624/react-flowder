const config = require("../../jest.config.js");

module.exports = {
  ...config,
  name: "react-flowder",
  displayName: "react-flowder",
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "jsdom",
  testEnvironmentOptions: { resources: "usable" },
  moduleNameMapper: {
    ...config.moduleNameMapper,
    "^@naporin0624/react-flowder": "<rootDir>/src/index.ts",
  },
  globals: {
    ...config.globals,
    useESM: true,
  },
};
