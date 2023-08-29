import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'es',
    }
  ],
  plugins: [typescript()],
  external: [
    'react',
    'react-dom',
    '@headlessui/react',
    '@worldcoin/idkit',
  ],
};
