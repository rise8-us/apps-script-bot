module.exports = {
  "preset": "ts-jest",
  "globals": {},
  "moduleFileExtensions": [
    "ts",
    "js"
  ],
  "transform": {
    "<transform_regex>": ["ts-jest", { /* ts-jest config goes here in Jest */}],
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  "testEnvironment": "node"
}
