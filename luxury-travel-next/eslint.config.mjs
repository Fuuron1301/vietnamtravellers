import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  ...nextVitals,
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'next-env.d.ts']
  },
  {
    rules: {
      'react-hooks/immutability': 'off',
      'react-hooks/incompatible-library': 'off'
    }
  }
];

export default eslintConfig;
