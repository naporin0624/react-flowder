const config = require("../../jest.config.js");

module.exports = {
  ...config,
  name: "simple-store",
  displayName: "simple-store",
  preset: "ts-jest/presets/default-esm",
  globals: {
    ...config.globals,
    useESM: true,
  },
};
