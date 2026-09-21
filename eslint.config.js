// ESLint flat config.
// Beyond the Expo baseline this file mechanically enforces two Stage-1 architecture rules from
// docs/REAL_ESTATE_ASSOCIATE_PHASE1_CLAUDE_MASTER.md so they cannot regress silently:
//   1. Screens/features/components never import seed fixtures or mock repositories.
//   2. Feature/UI code never contains raw hex colours (tokens live in src/design-system).
const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

const SEED_AND_MOCK_PATTERNS = [
  {
    group: ['@/seed', '@/seed/*', '**/seed', '**/seed/*'],
    message:
      'Seed fixtures may only be read by src/repositories/mock. Use a feature hook that calls a repository contract.',
  },
  {
    group: [
      '@/repositories/mock',
      '@/repositories/mock/*',
      '**/repositories/mock',
      '**/repositories/mock/*',
    ],
    message:
      'Import repositories from "@/repositories" (the composition root), never the mock implementations.',
  },
];

module.exports = defineConfig([
  globalIgnores(['node_modules/', '.expo/', 'dist/', 'coverage/', 'expo-env.d.ts']),
  expoConfig,
  prettierConfig,
  {
    // The Expo config registers the TypeScript plugin for .ts/.tsx only, so scope these the same way.
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    },
  },
  {
    // Rule 1 — presentation layers must not reach past the repository contracts.
    files: [
      'app/**/*.{ts,tsx}',
      'src/features/**/*.{ts,tsx}',
      'src/components/**/*.{ts,tsx}',
      'src/hooks/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': ['error', { patterns: SEED_AND_MOCK_PATTERNS }],
    },
  },
  {
    // Rule 2 — no raw hex colours outside the design-system token files.
    files: ['app/**/*.{ts,tsx}', 'src/features/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
          message: 'Use a token from "@/design-system" instead of a raw hex colour.',
        },
      ],
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', '__tests__/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },
]);
