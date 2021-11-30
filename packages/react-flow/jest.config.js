const config = require("../../jest.config.js");

module.exports = {
  ...config,
  name: "react-flow",
  displayName: "react-flow",
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "jsdom",
  globals: {
    ...config.globals,
    useESM: true,
  },
};
