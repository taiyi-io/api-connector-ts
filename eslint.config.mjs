import { defineConfig } from "eslint/config";
import eslintPluginTsdoc from "eslint-plugin-tsdoc";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import typescriptEslintParser from "@typescript-eslint/parser";

export default defineConfig([
  // ...other config
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        project: "./tsconfig.json", // Required for type-aware linting
      },
    },
    plugins: {
      tsdoc: eslintPluginTsdoc,
      "@typescript-eslint": typescriptEslintPlugin,
    },
    rules: {
      "tsdoc/syntax": "warn",
    },
    ignores: ["node_modules/**"],
  },
]);
