const config = require("../../jest.config.js");

module.exports = {
  ...config,
  name: "cache-manager",
  displayName: "cache-manager",
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "jsdom",
  globals: {
    ...config.globals,
    useESM: true,
  },
};
