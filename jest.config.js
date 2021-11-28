module.exports = {
  roots: ["<rootDir>/__tests__", "<rootDir>/src"],
  testMatch: [
    "**/__tests__/**/*.+(ts|js|tsx|jsx)",
    "**/?(*.)+(spec|test).+(ts|js|tsx|jsx)",
  ],
  transform: {
    "^.+\\.(ts)$": "ts-jest",
  },
  moduleNameMapper: {
    "^~/(.+)": "<rootDir>/src/$1",
  },
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.json",
    },
  },
  moduleDirectories: ["node_modules"],
};
