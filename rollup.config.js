import typescript from '@rollup/plugin-typescript';

import externals from 'rollup-plugin-node-externals';
import resolve from '@rollup/plugin-node-resolve';
import del from 'rollup-plugin-delete';

const packageJson = require('./package.json');

export default {
  input: 'src/index.tsx',
  output: [
    {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    del({ targets: 'dist/*' }),
    externals(),
    resolve(),
    typescript({
      tsconfig: './tsconfig.build.json',
    }),
  ],
};
