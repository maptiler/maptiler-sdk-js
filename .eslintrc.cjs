module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  //"@typescript-eslint/ban-ts-comment": "warn"
  rules: {
    "@typescript-eslint/ban-ts-comment": "warn",
  }
};