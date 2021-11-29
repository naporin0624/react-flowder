const config = require("../../.eslintrc.js");

module.exports = {
  ...config,
  parserOptions: {
    ...config.parserOptions,
    jsx: true,
  },
  root: false,
  env: {
    node: true,
    jest: true,
    browser: true,
  }
};
