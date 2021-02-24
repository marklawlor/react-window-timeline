module.exports = {
  extends: [
    'react-app',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  parserOptions: {
    project: './tsconfig.json', // Used by typescript
    tsconfigRootDir: __dirname, // Used by typescript
  },
};
