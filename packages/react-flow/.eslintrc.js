const config = require("../../.eslintrc.js");

module.exports = {
  ...config,
  parserOptions: {
    ...config.parserOptions,
    jsx: true,
  },
  plugins: [...config.plugins, "react-hooks"],
  extends: [...config.extends, "plugin:react/recommended"],
  root: false,
  env: {
    node: false,
    jest: true,
    browser: true,
  },
  rules: {
    ...config.rules,
    "react/prop-types": "off",
    "react/display-name": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
