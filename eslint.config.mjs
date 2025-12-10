import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettier,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      'prettier/prettier': 'error',
      'no-console': 'warn',

      // === CODE SIZE LIMITS ===
      'max-lines': [
        'error',
        { max: 250, skipBlankLines: true, skipComments: true },
      ],
      'max-lines-per-function': [
        'warn',
        { max: 100, skipBlankLines: true, skipComments: true, IIFEs: true },
      ],
      'max-params': ['warn', 4],
      'max-depth': ['warn', { max: 5 }],
      complexity: ['warn', { max: 15 }],
      'max-nested-callbacks': ['warn', 3],
    },
  },
  // Relaxed rules for test files and scripts
  {
    files: ['__tests__/**/*.ts', 'scripts/**/*.ts', 'prisma/seed.ts'],
    rules: {
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      'no-console': 'off',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Generated files
    'lib/generated/**',
  ]),
]);

export default eslintConfig;
