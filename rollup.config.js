import autoExternal from 'rollup-plugin-auto-external'
import path from 'path'
import typescript from 'rollup-plugin-typescript2'

export default async a => {
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
      typescript(),
    ],
  }
}
