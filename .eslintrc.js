module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'next/core-web-vitals',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'react-hooks', 'import', 'prettier'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    'no-undef': 'off',
    'no-duplicate-imports': 'off',
    'import/no-anonymous-default-export': 'off',
    'prettier/prettier': 'warn',
    // TypeScript specific rules
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',

    // React specific rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/no-unescaped-entities': 'off',

    // Import organization
    'import/order': 'warn',

    // General code quality rules
    'no-console': 'off',
    'prefer-const': 'warn',
    'no-unused-expressions': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['scripts/**/*.js', 'pages/_document.js', 'update-imports.js'],
      parserOptions: {
        project: null, // disable TS project parsing for these files
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
};
