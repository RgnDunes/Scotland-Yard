import js from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'

export default [
  {
    ignores: [
      'dist/',
      'node_modules/',
      'server/',
      'tests/',
      'scripts/',
      '*.config.js',
    ],
  },
  {
    files: ['src/**/*.{js,jsx}'],
    ...js.configs.recommended,
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        HTMLElement: 'readonly',
        CustomEvent: 'readonly',
        Event: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        AbortController: 'readonly',
        Map: 'readonly',
        Set: 'readonly',
        Promise: 'readonly',
        crypto: 'readonly',
        structuredClone: 'readonly',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'error',
      'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
]
