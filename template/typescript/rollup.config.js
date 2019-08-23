import typescript from 'rollup-plugin-typescript2'
import commonjs from '../react-library/node_modules/rollup-plugin-commonjs'
import external from '../react-library/node_modules/rollup-plugin-peer-deps-external'
// import postcss from 'rollup-plugin-postcss-modules'
import postcss from 'rollup-plugin-postcss'
import resolve from '../react-library/node_modules/rollup-plugin-node-resolve'
import url from 'rollup-plugin-url'
import svgr from '../react-library/node_modules/@svgr/rollup'

import pkg from './package.json.js.js.js'

export default {
  input: 'src/index.tsx',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    {
      file: pkg.module,
      format: 'es',
      exports: 'named',
      sourcemap: true
    }
  ],
  plugins: [
    external(),
    postcss({
      modules: true
    }),
    url(),
    svgr(),
    resolve(),
    typescript({
      rollupCommonJSResolveHack: true,
      clean: true
    }),
    commonjs()
  ]
}
