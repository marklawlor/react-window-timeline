const path = require('path');

module.exports = {
  stories: ['../src/stories/**/*.stories.@(ts|tsx|js|jsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  // https://storybook.js.org/docs/react/configure/typescript#mainjs-configuration
  typescript: {
    check: true, // type-check stories during Storybook build
    reactDocgenTypescriptOptions: {
      compilerOptions: {
        rootDir: './',
      },
    },
  },
};
