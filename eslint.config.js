import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser, 
        ...globals.node, 
      },
      ecmaVersion: 2021, 
      sourceType: "module", 
    },
  },
  pluginJs.configs.recommended,
];