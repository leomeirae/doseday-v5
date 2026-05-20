const expoFlat = require('eslint-config-expo/flat');

module.exports = [
  { ignores: ['node_modules/**', '.expo/**', '.agents/**', 'ios/**', 'android/**', 'dist/**', 'build/**', 'supabase/**'] },
  ...expoFlat,
  // eslint-plugin-react@7.x calls context.getFilename() (removed in ESLint v10)
  // when react.version is 'detect'. Pinning to '18.0.0' avoids the detection call.
  { settings: { react: { version: '18.0.0' } } },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
];
