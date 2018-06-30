import * as fs from 'fs-extra'
import * as path from 'path'

import {Command, ICommandInitOptions} from './Command'
import {Application} from '../Application'
import {IRelated, series, unique} from '../common'
import {Source} from '../file/'

interface IExtendedRelated extends IRelated {
  filePath: string
}

export interface IPoint {
  row: number
  col: number
}

export class CreateRelatedFilesCommand extends Command {
  private relatedSources: IExtendedRelated[]
  private infos: Array<{content: string, injected: boolean}> = []
  /**
   * 初始文件的 Source
   */
  // @ts-ignore
  private source: Source

  /**
   * 创建关联文件
   *
   * relatedFiles 所关联的文件都是不存在的
   */
  constructor(textFile: string, app: Application, options: ICommandInitOptions) {
    super('CreateRelatedFilesCommand', app, options)
    let rs: IExtendedRelated[] = []
    let {rootPath} = app
    if (fs.existsSync(textFile) && fs.statSync(textFile).isFile()) {
      let source = this.app.createSource(textFile)
      this.source = source

      let tpl = source.match(false)
      rs = (tpl ? tpl.getRelatedSources() : [])
        .map(r => {
          let p = r.relativePath
          let filePath = path.resolve(p[0] === '.' ? path.dirname(source.filePath) : rootPath, p)
          return {...r, filePath}
        })
      rs = rs.filter(r => r.filePath && r.filePath.indexOf(rootPath) === 0) // 确保关联的文件不存在并且要在项目中
    }

    rs = unique(rs, 'filePath')
    if (!rs.length) {
      this.invalid = true
      this.app.error(this.app.format('没有需要创建的 %f 的关联文件', textFile))
    }
    let notExistsRs = rs.filter(r => !fs.existsSync(r.filePath))
    this.relatedSources = notExistsRs
    if (!notExistsRs.length) {
      rs.forEach(r => {
        if (fs.existsSync(r.filePath)) {
          this.app.editor.openFileAsync(r.filePath)
        }
      })
    }
  }

  private replace(content: string, replacer: string, begin: IPoint, end: IPoint | null): string {
    // 将换行符放在最后当作一个字符
    let lines = content.split(/\r?\n/).map((line, i, all) => i === all.length - 1 ? line : line + this.app.editor.EOL)

    if (begin.row >= lines.length) {
      return content + replacer
    }

    return lines.reduce((res: string[], line, i) => {
      if (i === begin.row) {
        let prefix = line.substr(0, begin.col) + replacer
        if (!end) {
          res.push(prefix + line.substr(begin.col))
        } else if (i === end.row) {
          res.push(prefix + line.substr(end.col))
        } else {
          res.push(prefix)
        }
      } else if (i > begin.row && end && i <= end.row) {
        if (i === end.row) {
          res.push(line.substr(end.col))
        }
      } else {
        res.push(line)
      }
      return res
    }, []).join('')
  }

  async execute(): Promise<boolean> {
    const {app} = this
    let {editor, render} = app
    let sourceFilePath = this.source.filePath
    let result = await series(this.relatedSources, async (r) => {
      this.debug('开始创建文件 %f', r.filePath)

      await this.createFileAsync(r.filePath, '')
      let tpl = app.createSource(r.filePath).match(false)
      if (tpl) {
        let data = tpl.data
        data.ref = this.source.basicData
        await this.setFileContentAsync(r.filePath, render.renderFile(tpl.filePath, data), '')
      }

      // 注入引用
      let {reference, begin, end, smartInsertStyle} = r
      let injected = !!reference
      let content = ''
      if (reference) {
        content = editor.getFileContent(sourceFilePath)
        if (begin == null && end == null && smartInsertStyle && editor.isJsFileOrTsFile(sourceFilePath)) {
          // 计算出 begin 坐标
          let rtn = calculateStartInjectPoint(content, reference)
          begin = rtn.begin
          end = rtn.end
          if (!end) reference = editor.EOL + reference + editor.EOL
        }

        let s = {row: 0, col: 0, ...(begin || {})}
        let e = end ? {...s, ...end} : null
        await this.setFileContentAsync(sourceFilePath, this.replace(content, reference, s, e), content)
      }

      await editor.openFileAsync(r.filePath)
      this.infos.push({injected, content})
      return true
    })

    return result.every(r => r)
  }

  async rollback(): Promise<boolean> {
    let {editor} = this.app
    let sourceFilePath = this.source.filePath

    let result = await series(this.relatedSources, async (r, i) => {
      if (fs.existsSync(r.filePath)) {
        this.debug('开始撤销文件 %f' + r.filePath)
        await this.unlinkFileAsync(r.filePath, editor.getFileContent(r.filePath))
        this.debug('文件 %f 撤销成功', r.filePath)
      }

      // 撤消注入的引用
      if (fs.existsSync(sourceFilePath)) {
        let info = this.infos[i]
        if (info.injected && info.content) {
          await this.setFileContentAsync(sourceFilePath, info.content, editor.getFileContent(sourceFilePath))
        }
      }

      return true
    })

    return result.every(r => r)
  }
}

export function calculateStartInjectPoint(content: string, reference: string): {begin: IPoint, end?: IPoint} {
  let startLine = 0
  // 去掉文件开头的注释行
  if (/^(\s*\/\*[\s\S]*?\*\/)/.test(content)) {
    startLine = RegExp.$1.split(/\r?\n/).length
  }
  let lines = content.split(/\r?\n/)

  let begin: IPoint | undefined
  let end: IPoint | undefined

  const requireRegExp = /^\s*(\/\/)?\s*(import|(var|let|const)\s+\w+\s+=\s+require)\b/

  let lastImportLineNumber = startLine
  for (let i = startLine; i < lines.length; i++) {
    let text = lines[i]
    if (text.indexOf(reference) >= 0) {
      begin = {row: i, col: 0}
      end = {row: i, col: text.length}
    }
    if (requireRegExp.test(text)) lastImportLineNumber = i
  }

  if (begin && end) {
    return {begin, end}
  } else {
    return {begin: {row: lastImportLineNumber + 1, col: 0}}
  }
}
