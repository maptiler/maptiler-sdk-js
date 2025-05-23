import tseslint from "typescript-eslint";
import baseConfig from "../eslint.config.mjs";

export default tseslint.config(baseConfig, {
  rules: {
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
  },
});
