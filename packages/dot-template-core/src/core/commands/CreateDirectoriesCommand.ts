import * as fs from 'fs-extra'
import * as path from 'path'

import {Command, ICommandInitOptions} from './Command'
import {Application} from '../Application'
import {Template} from '../file/'
import {series} from '../common'

export class CreateDirectoriesCommand extends Command {
  private folders: string[]
  private exists: boolean[] = []

  constructor(folders: string[], noInitError: boolean, app: Application, options: ICommandInitOptions) {
    super('CreateDirectoriesCommand', app, options)
    folders = this.filter(folders, true)

    // let templates: Template[] = []
    // .forEach(f => {
    //   let template = this.app.createSource(f).match(true)
    //   if (template) templates.push(template)
    // })

    this.folders = folders
    if (!folders.length) {
      this.invalid = true
      if (!noInitError) this.app.error('无任何可创建的有效文件夹：文件路径需要在项目内，并且文件夹需要不存在，或文件夹内无任何文件')
    }
  }

  async execute(): Promise<boolean> {
    let {app} = this
    let {render, editor} = app
    await series(this.folders, async (toDir) => {
      let exists = fs.existsSync(toDir)
      if (!exists) fs.mkdirpSync(toDir)

      let tpl = this.app.createSource(toDir).match(true) as Template
      if (!tpl) {
        this.debug('目录 %f 没有匹配的模板', toDir)
        return
      }

      let fromDir = tpl.filePath

      let copiedFiles: string[] = []

      this.debug('开始复制目录 %f => %f', fromDir, toDir)

      this.exists.push(exists)

      await walk(fromDir, async (rawName: string, fromPath: string, stats: fs.Stats) => {

        let relativePath = path.relative(fromDir, fromPath)

        let sourceData = tpl.data
        relativePath = render.removeFileEngineExtension(render.renderDtplContent(relativePath, sourceData))

        let toPath = path.join(toDir, relativePath)
        let name = path.basename(toPath)

        let rawContent = ''
        let content = ''

        rawContent = editor.getFileContent(fromPath)
        let renderData = app.createSource(toPath).basicData
        renderData.ref = sourceData
        content = render.renderContent(rawContent, renderData, render.judgeEngineByFileExtension(fromPath))

        let filterResult = tpl.filter({fromDir, toDir, fromPath, toPath, rawContent, rawName, name, relativePath, stats, content})

        if (filterResult === false || filterResult == null) return false
        if (typeof filterResult === 'object') {
          if (filterResult.content != null) content = filterResult.content
          if (filterResult.filePath) {
            toPath = path.resolve(editor.rootPath, filterResult.filePath)
          } else if (filterResult.name && name !== filterResult.name) {
            toPath = path.join(path.dirname(toPath), filterResult.name)
          }
        }

        if (fromPath === toPath || toPath.indexOf(fromDir) === 0) {
          this.app.error(this.app.format('新生成的文件 %f 不能在源文件夹内 %f，已忽略', toPath, fromDir))
          return false
        }

        // 备份已经存在的文件
        if (!tpl.custom.overwrite && fs.existsSync(toPath)) {
          let backupDir = path.resolve(toPath, '..', '.backup')
          fs.mkdirpSync(backupDir)
          fs.renameSync(toPath, path.join(backupDir, path.basename(toPath)))
        }
        await this.createFileAsync(toPath, content)
        copiedFiles.push(toPath)
        this.debug('复制文件 %f => %f', fromPath, toPath)

        return true
      })
      tpl.afterFilter(fromDir, toDir, copiedFiles)

      await this.inject(tpl)

      this.debug('目录复制完成')
    })

    return true
  }

  async rollback(): Promise<boolean> {
    await series(this.folders, async (toDir, index) => {
      this.debug('删除目录 %f 的文件', toDir)
      await this.remove(toDir, !this.exists[index])
    })
    return true
  }

  async remove(dir: string, removeCurrent: boolean = false) {
    let names = fs.readdirSync(dir)
    await series(names, async (name) => {
      let f = path.join(dir, name)
      let stats = fs.statSync(f)
      if (stats.isDirectory()) {
        await this.remove(f, true)
      } else {
        await this.unlinkFileAsync(f, this.app.editor.getFileContent(f))
      }
    })
    if (removeCurrent) fs.removeSync(dir)
  }
}


async function walk(dir: string, fn: (name: string, filePath: string, stats: fs.Stats) => Promise<boolean>) {
  let names = fs.readdirSync(dir)
  let filePath: string
  let stats: fs.Stats

  for (let name of names) {
    filePath = path.join(dir, name)
    stats = fs.statSync(filePath)

    if (stats.isFile()) {
      await fn(name, filePath, stats)
    } else if (stats.isDirectory()) {
      await walk(filePath, fn)
    }
  }
}
