// @ts-nocheck

import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default tseslint.config(
  // https://typescript-eslint.io/getting-started/typed-linting/
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  tseslint.configs.recommendedTypeChecked,
  {
    // forked from https://www.npmjs.com/package/eslint-plugin-restrict-imports
    plugins: {
      import: {
        rules: {
          "default-imports-only": {
            meta: {
              type: "suggestion",
              docs: {},
              schema: [
                {
                  bannedImport: {
                    locations: ["filePaths"],
                    message: "string",
                    fixedLocation: "string",
                  },
                },
              ],
            },
            create: function (context) {
              const filePath = context.getFilename();
              const options = context.options[0] || {
                "^/(.*)": {
                  locations: ["(.*)"],
                },
              };

              return {
                ImportDeclaration: (node) => {
                  Object.entries(options).forEach(([bannedImport, config]) => {
                    const importLocationRegex = new RegExp(bannedImport);

                    if (config.ignoreTypeImports && node.importKind === "type") return;

                    if (importLocationRegex.test(node.source.value)) {
                      config.locations.forEach((fp) => {
                        const bannedLocationRegex = new RegExp(fp);

                        if (bannedLocationRegex.test(filePath)) {
                          node.specifiers.forEach((specifier) => {
                            if (specifier.type !== "ImportDefaultSpecifier") {
                              context.report({
                                // @ts-expect-error `message` seems to work with this...
                                message: config.message ?? `Importing from '${bannedImport}' is banned in '${fp}'`,
                                node,
                              });
                            }
                          });
                        }
                      });
                    }
                  });
                },
              };
            },
          },
        },
      },
    },
    rules: {
      "import/default-imports-only": [
        "error",
        {
          "maplibre-gl$": {
            locations: ["^(?!.*\.d\.ts$).*\.((ts|js))$"],
            message: `Maplibre-gl uses CJS modules, only default imports are supported, named imports may fail on some setups.`,
            ignoreTypeImports: true,
          },
        },
      ],
    },
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // https://github.com/prettier/eslint-plugin-prettier
  eslintPluginPrettierRecommended,
  //
  {
    rules: {
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-indexed-object-style": "warn",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-base-to-string": "warn",
      "@typescript-eslint/no-confusing-void-expression": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-function": "warn", // this is to satisfy maplibre-gl custom layer interface
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-misused-promises": "warn",
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "off",
      "@typescript-eslint/no-unnecessary-condition": "warn",
      "@typescript-eslint/no-unnecessary-type-arguments": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/no-unnecessary-type-parameters": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-enum-comparison": "off",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/non-nullable-type-assertion-style": "warn",
      "@typescript-eslint/prefer-for-of": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/prefer-optional-chain": "off",
      "@typescript-eslint/prefer-return-this-type": "off",
      "@typescript-eslint/prefer-string-starts-ends-with": "warn",
      "@typescript-eslint/restrict-plus-operands": "warn",
      "@typescript-eslint/restrict-template-expressions": "warn",
      "@typescript-eslint/related-getter-setter-pairs": "off",
      "@typescript-eslint/unbound-method": "warn",
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "warn",
    },
  },
  //
);
