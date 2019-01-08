#!/usr/bin/env node

import * as info from 'mora-scripts/libs/sys/info'
import * as error from 'mora-scripts/libs/sys/error'
import * as cli from 'mora-scripts/libs/tty/cli'
import * as xlog from 'mora-scripts/libs/sys/xlog'
import * as _inject from 'mora-scripts/libs/fs/inject'
import * as findup from 'mora-scripts/libs/fs/findup'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as os from 'os'
import * as assert from 'assert'

let rootPath = path.dirname(findup.pkg(__dirname))
let DOT_TEMPLATE_CORE_ROOT = path.join(rootPath, 'packages', 'dot-template-core')
let DOT_TEMPLATE_VSCODE_ROOT = path.join(rootPath, 'packages', 'dot-template-vscode')

interface IConfig {
  name: string
  data: {[key: string]: {optional?: boolean, type: string, description: string}}
  commands: {[key: string]: {title: string, key?: string, mac?: string, desc: string}}
  options: {[key: string]: {default?: any, type: string, description: string}}
}

cli({
  usage: 'dtpl [options] <command>'
})
.commands({
  inject: {
    desc: xlog.format('根据 %cdot-template-core/src/config/config.json%c 文件的配置，给项目其它地方注入合适的值', 'yellow', 'reset'),
    cmd: function() {

      let readmePath = path.join(rootPath, 'README.md')
      let articlePath = path.join(rootPath, 'ARTICLE_ABOUT_IT.md')
      let vscodePackagePath = path.resolve(DOT_TEMPLATE_VSCODE_ROOT, 'package.json')
      let vscodeEntryPath = path.resolve(DOT_TEMPLATE_VSCODE_ROOT, 'src', 'vscode.ts')

      let coreInterfacePath = path.join(DOT_TEMPLATE_CORE_ROOT, 'src', 'common', 'interface.ts')
      let coreDataPath = path.join(DOT_TEMPLATE_CORE_ROOT, 'src', 'common', 'data.ts')
      let config: IConfig = require(DOT_TEMPLATE_CORE_ROOT + '/src/config/config.json')
      injectReadme(config, readmePath, articlePath)
      injectInterfaceAndData(config, coreInterfacePath, coreDataPath)
      injectPackageAndVscodeEntry(config, vscodePackagePath, vscodeEntryPath)

      // 复制 markdown 文件到 dot-template-vscode 中
      fs.copyFileSync(path.join(rootPath, 'README.md'), path.join(DOT_TEMPLATE_VSCODE_ROOT, 'README.md'))
      fs.copyFileSync(path.join(rootPath, 'CHANGELOG.md'), path.join(DOT_TEMPLATE_VSCODE_ROOT, 'CHANGELOG.md'))
      fs.copyFileSync(path.join(rootPath, 'ARTICLE_ABOUT_IT.md'), path.join(DOT_TEMPLATE_VSCODE_ROOT, 'ARTICLE_ABOUT_IT.md'))
    }
  }
})
.parse(function() {
  return this.help()
})

function injectPackageAndVscodeEntry({name, options, commands: cs}: IConfig, packagePath: string, vscodeEntryPath: string) {
  // configuration commands keybindings

  let registerCommands: string[] = []

  let configuration = {
    title: name,
    type: 'object',
    properties: Object.keys(options).reduce((prev: {[key: string]: any}, key) => {
      prev[name + '.' + key] = options[key]
      return prev
    }, {})
  }

  let activationEvents: string[] = []
  let keybindings: Array<{command: string, key?: string, mac?: string}> = []
  let commands = Object.keys(cs).map(key => {
    let command = name + '.' + key
    let c = cs[key]
    if (c.key || c.mac) keybindings.push({command, key: c.key, mac: c.mac})

    activationEvents.push(`onCommand:${command}`)
    registerCommands.push(`vscode.commands.registerCommand('${command}', app.${key})`)
    return {command, title: cs[key].title}
  }, {})

  let oldPkg = require(packagePath)
  let newPkg = JSON.parse(JSON.stringify(oldPkg))

  newPkg.activationEvents = (newPkg.activationEvents || []).filter((e: string) => !e.startsWith('onCommand:'))
  newPkg.activationEvents.push(...activationEvents)
  newPkg.contributes = newPkg.contributes || {}
  newPkg.contributes.configuration = configuration
  newPkg.contributes.keybindings = keybindings
  newPkg.contributes.commands = commands

  let relative = path.relative(rootPath, packagePath)

  try {
    assert.deepEqual(oldPkg, newPkg)
    info(`文件 ${relative} 没有变化`)
  } catch(e) {
    fs.writeFileSync(packagePath, JSON.stringify(newPkg, null, 2))
    info(`注入文件 ${relative} 成功`)
  }

  inject(vscodeEntryPath, {commands: registerCommands.join(',\n')})
}

function injectInterfaceAndData({data}: IConfig, interfacePath: string, dataPath: string) {
  let dataExplain: string[] = []
  let basicData = Object.keys(data).reduce((lines: string[], key) => {
    let d = data[key]
    lines.push('/**')
    lines.push(' * ' + d.description)
    lines.push(' * @type {' + d.type + '}')
    lines.push(' */')
    lines.push(`${key}${d.optional ? '?' : ''}: ${d.type}`)
    dataExplain.push(`${key}: {desc: '${d.description}', type: '${d.type}'}`)
    return lines
  }, []).join(os.EOL)

  inject(interfacePath, {basicData})
  inject(dataPath, {dataExplain: dataExplain.join(',' + os.EOL)})
}

function injectReadme({options, data, commands: cs, name}: IConfig, readmePath: string, articlePath: string) {
  // 项目配置：
  let configure = Object.keys(options).map(key => {
    let defaultValue = !options[key].default ? '' : os.EOL + `     默认值： ${code(options[key].default, true)}`
    return `* ${code(name + '.' + key)}: ${options[key].description}` + defaultValue
  }).join(os.EOL)

  // 支持命令
  let commands = Object.keys(cs).map(key => {
    let command = cs[key]
    let lines = [`* ${code(key)}: ${command.title}`]
    if (command.key) {
      if (!command.mac) {
        lines.push(`快捷键： ${code(command.key)}`)
      } else {
        lines.push(
          `    - win 快捷键： ${code(command.key)}`,
          `    - mac 快捷键： ${code(command.mac)}`
        )
      }
      lines.push('\n  ' + command.desc.replace(/\n/mg, '\n  ') + '\n')
    }
    return lines.join(os.EOL)
  }).join(os.EOL)

  // 环境变量
  let head = [['**Variable**', '**Type**', '**Nullable**', '**Description**']]
  let environment = table(head.concat(Object.keys(data).map(key => {
    let d = data[key]
    return [code(key), code(d.type), d.optional ? 'Yes' : '', d.description]
  })))

  inject(readmePath, {configure, commands, environment})
  inject(articlePath, {configure, commands, environment})
}

function inject(file: string, data: {[key: string]: any}) {
  let relative = path.relative(rootPath, file)
  let count = _inject(file, data)
  if (count === Object.keys(data).length) info(`注入文件 ${relative} 成功`)
  else error(`注入文件 ${relative} 失败`)
}

function code(content: string, stringify: boolean = false) {
  return '`' + (stringify ? JSON.stringify(content) : content) + '`'
}

function table(rows: Array<string[]>) {
  let sampleRow = rows[0]
  let columnNum = sampleRow.length
  rows.splice(1, 0, sampleRow.map(r => ''))

  let rowNum = rows.length

  let columnMaxWidths = new Array(columnNum)
  for (let i = 0; i < columnNum; i++) {
    columnMaxWidths[i] = Math.max(...rows.map(r => r[i].length)) + 3
  }

  let lines = []
  for (let i = 0; i < rowNum; i++) {
    let line = ''
    let padChar = i === 1 ? '-' : ' '
    for (let j = 0; j < columnNum; j++) {
      line += xlog.align(rows[i][j], '2.' + columnMaxWidths[j], {rightPad: padChar, leftPad: padChar})
        + (j === columnNum - 1 ? '' : '|')
    }
    lines.push(line)
  }
  return lines.join(os.EOL)
}
