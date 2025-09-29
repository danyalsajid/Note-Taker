import globals from "globals";
import { defineConfig } from "eslint/config";
import solid from "eslint-plugin-solid";

export default defineConfig([
	{
		files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
		languageOptions: {
			globals: globals.browser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
				ecmaFeatures: { jsx: true },
			},
		},
		plugins: {
			solid,
		},
		rules: {
			// Tabs instead of spaces
			indent: ["error", "tab", { SwitchCase: 1 }],

			// Require semicolons
			semi: ["error", "always"],

			// Enforce spacing inside braces
			"object-curly-spacing": ["error", "always"],

			// Add space after keywords
			"keyword-spacing": ["error", { before: true, after: true }],

			// Consistent quotes
			quotes: ["error", "double"],

			// Solid recommended rules (copied in manually)
			...solid.configs["recommended"].rules,
		},
	},
]);
