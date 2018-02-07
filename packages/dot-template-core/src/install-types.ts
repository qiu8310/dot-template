import * as cli from 'mora-scripts/libs/tty/cli'
import * as info from 'mora-scripts/libs/sys/info'
import * as fs from 'fs-extra'
import * as path from 'path'
import {EOL} from 'os'

const typeDirs = ['common', 'core']
const fromDir = path.resolve(__dirname, '../out')
const indexContent = `export * from './common/interface'${EOL}`

cli({
  usage: 'install-dot-template-types <toDir>'
}).parse(function(res) {
  let toDir = res._[0]
  if (!toDir) return this.error('请指定安装目录')
  toDir = path.resolve(toDir)

  const types = typeDirs.map(d => path.join(fromDir, d)).reduce((all, dir) => addTypingFile(all, dir), [] as string[])

  types.forEach(f => copy(f, path.join(toDir, path.relative(fromDir, f))))

  const indexFile = path.join(toDir, 'index.d.ts')
  if (!fs.existsSync(indexFile)) fs.writeFileSync(indexFile, indexContent)
})

function addTypingFile(result: string[], filepath: string) {
  let stats = fs.statSync(filepath)
  if (stats.isFile() && filepath.endsWith('.d.ts')) result.push(filepath)
  else if (stats.isDirectory()) fs.readdirSync(filepath).forEach(f => addTypingFile(result, path.join(filepath, f)))
  return result
}

function copy(from: string, to: string) {
  fs.ensureDirSync(path.dirname(to))

  const exists = fs.existsSync(to)
  const equals = exists && fs.readFileSync(to).equals(fs.readFileSync(from))

  if (!exists || !equals) {
    info((!exists ? '添加 ' : '更新 ') + to)
    fs.copyFileSync(from, to)
  }
}
