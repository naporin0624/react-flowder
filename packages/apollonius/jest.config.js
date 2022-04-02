const config = require("../../jest.config.js");

module.exports = {
  ...config,
  name: "react-flowder",
  displayName: "react-flowder",
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "jsdom",
  globals: {
    ...config.globals,
    useESM: true,
  },
};
