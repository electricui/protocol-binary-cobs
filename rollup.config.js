import autoExternal from 'rollup-plugin-auto-external'
import copy from 'rollup-plugin-copy'
import license from 'rollup-plugin-license'
import path from 'path'
import typescript from 'rollup-plugin-typescript2'

export default async () => {
  return {
    input: 'index.ts',
    output: [
      { format: 'cjs', file: path.resolve(__dirname, 'lib', `index.js`) },
    ],
    plugins: [
      autoExternal({
        builtins: true,
        dependencies: true,
        packagePath: path.resolve(__dirname, 'package.json'),
        peerDependencies: true,
      }),
      typescript({
        objectHashIgnoreUnknownHack: true, // Using the copy plugin (which uses async functions), we need to invalidate the cache on every build
        clean: true,
      }),
      license({
        sourcemap: true,
        banner: {
          commentStyle: 'ignored',
          content: {
            file: path.join(__dirname, '..', '..', 'LICENCE_TEMPLATE'),
          },
        },
      }),
      copy({
        targets: [
          {
            src: path.join(__dirname, '..', '..', 'LICENCE_TEMPLATE'),
            dest: '.',
            rename: () => 'LICENCE',
          },
        ],
      }),
    ],
  }
}
