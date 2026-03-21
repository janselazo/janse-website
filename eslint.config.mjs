import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __dirname = dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** eslint-config-next ships ESLintRC configs; FlatCompat maps them to flat config (ESLint 9). */
export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];
