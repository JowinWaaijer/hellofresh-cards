import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/hellofresh-cards.js',
  output: {
    file: 'dist/hellofresh-cards.js',
    format: 'es',
  },
  plugins: [
    resolve(),
    terser(),
  ],
};
