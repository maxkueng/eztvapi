import * as path from 'path';
import * as fs from 'fs';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

const external = Object.keys(pkg.dependencies || {});

const license = fs.readFileSync(path.resolve('LICENSE'), 'utf-8');

const bannerLines = [];
bannerLines.push('/*!');
bannerLines.push(` * ${pkg.name} v${pkg.version}`);
bannerLines.push(' *');
license.split(/\r?\n/).forEach((line) => {
  bannerLines.push(` * ${line}`);
});
bannerLines.push(' */');

const banner = bannerLines.join('\n');

export default {
  input: 'src/index.js',
  external,
  plugins: [
    babel({
      babelrc: false,
      plugins: [
        'syntax-flow',
        'transform-flow-comments',
        'transform-async-to-generator',
        [
          'transform-object-rest-spread',
          { useBuiltIns: true },
        ],
      ],
    }),
  ],
  output: [
    {
      file: 'build/index.js',
      format: 'cjs',
      sourcemap: true,
      banner,
    },
    {
      file: 'build/index.es.js',
      format: 'es',
      sourcemap: true,
      banner,
    },
  ],
};
