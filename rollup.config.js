import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  // Node.js build (default)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    external: ['fs', 'path', '@mliebelt/pgn-parser'],
    plugins: [typescript()],
  },
  // Browser build
  {
    input: 'src/browser.ts',
    output: {
      file: 'dist/browser.js',
      format: 'umd',
      name: 'PgnMusic',
      sourcemap: true,
      globals: {
        '@mliebelt/pgn-parser': 'pgnParser',
      },
    },
    external: ['fs', 'path'], // Only exclude Node built-ins from browser build
    plugins: [
      nodeResolve({ browser: true, preferBuiltins: false }),
      commonjs(),
      typescript(),
    ],
  },
];
