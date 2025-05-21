import reactEslint from '@eslint-react/eslint-plugin';
import { includeIgnoreFile } from '@eslint/compat';
import jsEslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tsEslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

export default tsEslint.config(
  includeIgnoreFile(gitignorePath),
  /** Global eslint rules */
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: { ecmaVersion: 'latest' },
    extends: [
      jsEslint.configs.recommended,
      tsEslint.configs.recommended,
      {
        rules: {
          '@typescript-eslint/no-empty-object-type': 'off',
        },
      },
      eslintConfigPrettier,
    ],
  },
  /** Client app eslint rules */
  {
    files: ['apps/client/**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    languageOptions: {
      parser: tsEslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    extends: [
      jsEslint.configs.recommended,
      tsEslint.configs.recommended,
      reactEslint.configs['recommended-typescript'],
      {
        rules: {
          '@eslint-react/hooks-extra/no-direct-set-state-in-use-effect': 'off',
        },
      },
    ],
  },
);
