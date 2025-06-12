// @ts-check

import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  // @ts-ignore
  eslintConfigPrettier,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/unified-signatures': 'off',
      // '@typescript-eslint/ban-ts-comment': 'warn',
      // '@typescript-eslint/no-unused-vars': 'off',
      // 'simple-import-sort/imports': 'error',
      // 'simple-import-sort/exports': 'error',

      // TODO: temp, turn these back on
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off', // when on, makes you use an `interface` instead of a `type`
    },
  },
  {
    ignores: ['benchmark/', 'coverage/', 'dist/', 'node_modules/', 'result/'],
  },
);
