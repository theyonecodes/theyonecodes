import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    files: ['src/**/*.{ts,tsx,astro}'],
    ignores: ['dist/', 'node_modules/'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
    },
  },
  {
    files: ['src/**/*.{ts,tsx,astro}'],
    rules: {
      // Prevent use of old spacing variables (--g1 through --g8)
      '@typescript-eslint/no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value="--g1"]',
          message: 'Use --g-xs instead of --g1',
        },
        {
          selector: 'Literal[value="--g2"]',
          message: 'Use --g-sm instead of --g2',
        },
        {
          selector: 'Literal[value="--g3"]',
          message: 'Use --g-md instead of --g3',
        },
        {
          selector: 'Literal[value="--g4"]',
          message: 'Use --g-lg instead of --g4',
        },
        {
          selector: 'Literal[value="--g5"]',
          message: 'Use --g-xl instead of --g5',
        },
        {
          selector: 'Literal[value="--g6"]',
          message: 'Use --g-xxl instead of --g6',
        },
        {
          selector: 'Literal[value="--g7"]',
          message: 'Use --g-xxxl instead of --g7',
        },
        {
          selector: 'Literal[value="--g8"]',
          message: 'Use --g-xxxl instead of --g8',
        },
        {
          selector: 'Literal[value="g1"]',
          message: 'Use --g-xs instead of g1',
        },
        {
          selector: 'Literal[value="g2"]',
          message: 'Use --g-sm instead of g2',
        },
        {
          selector: 'Literal[value="g3"]',
          message: 'Use --g-md instead of g3',
        },
        {
          selector: 'Literal[value="g4"]',
          message: 'Use --g-lg instead of g4',
        },
        {
          selector: 'Literal[value="g5"]',
          message: 'Use --g-xl instead of g5',
        },
        {
          selector: 'Literal[value="g6"]',
          message: 'Use --g-xxl instead of g6',
        },
        {
          selector: 'Literal[value="g7"]',
          message: 'Use --g-xxxl instead of g7',
        },
        {
          selector: 'Literal[value="g8"]',
          message: 'Use --g-xxxl instead of g8',
        },
        {
          selector: 'Literal[value="g-1"]',
          message: 'Use --g-xs instead of g-1',
        },
        {
          selector: 'Literal[value="g-2"]',
          message: 'Use --g-sm instead of g-2',
        },
        {
          selector: 'Literal[value="g-3"]',
          message: 'Use --g-md instead of g-3',
        },
        {
          selector: 'Literal[value="g-4"]',
          message: 'Use --g-lg instead of g-4',
        },
        {
          selector: 'Literal[value="g-5"]',
          message: 'Use --g-xl instead of g-5',
        },
        {
          selector: 'Literal[value="g-6"]',
          message: 'Use --g-xxl instead of g-6',
        },
        {
          selector: 'Literal[value="g-7"]',
          message: 'Use --g-xxxl instead of g-7',
        },
        {
          selector: 'Literal[value="g-8"]',
          message: 'Use --g-xxxl instead of g-8',
        },
      ],
    },
  },
);