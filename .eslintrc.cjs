const tsConfig = require('./tsconfig.json');

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'prettier'
  ],
  root: true,
  rules: {
    "@typescript-eslint/ban-ts-comment": "warn",
    "prettier/prettier": "error",
    "@typescript-eslint/no-explicit-any": "warn",
  },
  ignorePatterns: tsConfig.exclude,
};
