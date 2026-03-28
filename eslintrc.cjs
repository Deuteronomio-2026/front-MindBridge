module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'sonarjs'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:sonarjs/recommended',
  ],
  rules: {
    'sonarjs/no-duplicate-string': ['error', { threshold: 3 }],
    'sonarjs/no-identical-functions': 'error',
    'sonarjs/cognitive-complexity': ['error', 15],
  },
}