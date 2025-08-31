import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      // Turn off base rule (JS)
      "no-unused-vars": "off",

      // Use TS version only
      "@typescript-eslint/no-unused-vars": [
        "off", // 👈 change to "warn" if you want warnings instead of silencing
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],

      // Other rules
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/exhaustive-deps": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-key": "warn",
      "react/no-unescaped-entities": "off",
      "jsx-a11y/anchor-is-valid": "off",
    },
  },
];

export default eslintConfig;
