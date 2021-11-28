const config = require("../../jest.config.js");

module.exports = {
  ...config,
  name: "react-loader",
  displayName: "react-loader",
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "jsdom",
  globals: {
    ...config.globals,
    useESM: true,
  },
};
