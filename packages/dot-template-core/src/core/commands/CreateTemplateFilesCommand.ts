import {Command, ICommandInitOptions} from './Command'
import {Application} from '../Application'
import {series} from '../common'
import * as fs from 'fs-extra'

/**
 * 创建文件并注入模板的命令
 *
 * **注意：**
 *
 * - 文件之前是不存在的
 * - 可以指定多个文件
 *
 */
export class CreateTemplateFilesCommand extends Command {
  files: string[]

  /**
   * 对应文件的创建前的信和，在撤消命令时，要判断内容是否改过了，改过了要弹出确认框
   */
  private infos: Array<{opened: boolean, exists: boolean, newContent: string, content: string}> = []

  /**
   * @param {string[]} files 所有要创建的文件绝对路径，一定要确保文件不存在
   * @param {boolean} [open] 是否要打开这些创建好的文件
   * @param {boolean} [noInitError] 初始化时不要报错，主要 emitNewFile 时可能是因为用户修改了文件夹的名称
   * @memberof CreateFilesCommand
   */
  constructor(files: string[], private open: boolean, noInitError: boolean, app: Application, options: ICommandInitOptions) {
    super('CreateTemplateFilesCommand', app, options)

    this.files = this.filter(files, false)

    if (!this.files.length) {
      this.invalid = true
      if (!noInitError) this.app.error('无任何可创建的有效文件：文件路径需要在项目内，并且文件需要不存在，或文件内容为空')
    }
  }

  async execute(): Promise<boolean> {
    const {app} = this
    let {render, editor} = app
    let result = await series(this.files, async (file) => {
      this.debug('开始处理文件 %f', file)
      let src = this.app.createSource(file)
      let tpl = src.match(false)

      let opened = false
      let content: string = ''
      let newContent = tpl ? render.renderFile(tpl.filePath, tpl.data) : ''

      if (tpl) {
        this.debug(`渲染文件 %f`, tpl.filePath)
        await this.inject(tpl)
      }

      let exists = fs.existsSync(file)

      if (exists) {
        content = editor.getFileContent(file)
        opened = editor.isOpened(file)
      } else {
        await this.createFileAsync(file, '')
      }

      this.infos.push({content, exists, opened, newContent})

      await this.setFileContentAsync(file, newContent, content)

      if (this.open && !opened) await editor.openFileAsync(file) // 文件打开失败不算错误
      this.debug('处理文件 %f 成功', file)
      return true
    })

    return result.every(r => r)
  }

  async rollback(): Promise<boolean> {
    const {app} = this
    let {editor} = app

    let updates: string[] = []
    this.files.forEach((file, i) => {
      let info = this.infos[i]
      if (info.exists && fs.existsSync(file)) { // 过去和现在都存在
        if (editor.getFileContent(file) !== info.newContent) {
          updates.push(editor.getRelativeFilePath(file))
        }
      }
    })
    if (updates.length && false === await editor.confirm(`文件 ${updates.join(', ')} 更新过了，确认要取消创建这些文件吗？`)) {
      return false
    }

    let result = await series(this.files, async (file, i) => {
      this.debug('开始回滚文件 %f' + file)
      let info = this.infos[i]

      if (fs.existsSync(file)) {
        let currentContent = editor.getFileContent(file)
        if (info.exists) {
          await this.setFileContentAsync(file, info.content, currentContent)
        } else {
          await this.unlinkFileAsync(file, currentContent)
        }
      } else {
        if (info.exists) {
          await this.createFileAsync(file, info.content)
        }
      }

      if (info.exists && info.opened && !editor.isOpened(file)) await editor.openFileAsync(file)
      this.debug('回滚文件 %f 成功', file)
      return true
    })

    return result.every(r => r)
  }
}
