import * as vscode from 'vscode'
import * as path from 'path'
// import * as fs from 'fs-extra'
// import {findJsRelatedFiles} from '../../common/helper'
import {Application} from 'dot-template-core'
import {VscodeEditor} from '../adapter/VscodeEditor'

export class App {
  private fileSystemWatcher?: vscode.FileSystemWatcher
  public dtpl?: Application

  get activeEditor(): vscode.TextEditor | undefined {
    return vscode.window.activeTextEditor
  }

  constructor() {
    vscode.workspace.onDidChangeWorkspaceFolders(e => {
      this.dispose()
      this.init()
    })
    this.init()
  }

  init() {
    let {workspaceFolders} = vscode.workspace
    if (this.dtpl || !workspaceFolders || !workspaceFolders.length) return

    let dtpl = this.dtpl = new Application(new VscodeEditor())

    this.fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*', false, true, true)
    this.fileSystemWatcher.onDidCreate(uri => dtpl.emitNewFile(uri.fsPath))

    let r = (file: string) => path.relative(dtpl.rootPath, file)

    let sid: NodeJS.Timer
    let showMessage = (msg: string) => {
      clearTimeout(sid)
      let res = vscode.window.setStatusBarMessage(msg, 3000)
      sid = setTimeout(() => res.dispose(), 3000)
    }
    dtpl.onCreatedFile(file => showMessage(`文件 ${r(file)} 创建成功`))
    dtpl.onUpdatedFile(file => showMessage(`文件 ${r(file)} 更新成功`))
    dtpl.onDeletedFile(file => showMessage(`文件 ${r(file)} 删除成功`))
  }

  undoOrRedo = async () => {
    if (this.dtpl) await this.dtpl.undoOrRedo()
  }

  createTemplateFiles = async () => {
    const {dtpl, activeEditor} = this
    if (!dtpl) return
    if (!activeEditor) {
      // 没有打开任何窗口就提示用户创建文件
      const input = await vscode.window.showInputBox({placeHolder: '请输入要创建的文件名（相对于根目录，多个文件用";"分隔）'})
      if (input) await dtpl.createTemplateFiles(input.trim().split(/\s*;\s*/).map(f => path.resolve(dtpl.rootPath, f)), true)
    } else {
      let currentfile = activeEditor.document.fileName
      let content = activeEditor.document.getText()

      if (content.trim()) {
        // 开个小灶
        // js 文件可以自动检查引用了哪些不存在的文件，然后创建它们
        // if (dtpl.editor.isJsFileOrTsFile(currentfile)) {
        //   let notExistFiiles = findJsRelatedFiles(currentfile, content).filter(f => !fs.existsSync(f))
        //   if (notExistFiiles.length && await dtpl.createTemplateFiles(notExistFiiles, true)) {
        //     return // 创建成功就不往下执行了
        //   }
        // }

        // 尝试创建关联文件
        if (await dtpl.createRelatedFiles(currentfile)) return

        // 创建新文件
        const input = await vscode.window.showInputBox({placeHolder: '请输入要创建的文件名（相对当前文件的路径，多个文件用";"分隔）'})
        if (input) await dtpl.createTemplateFiles(input.trim().split(/\s*;\s*/).map(f => path.resolve(currentfile, '..', f)), true)

      } else {
        // 当前打开的文件如果没有内容，则注入模板（如果有的话）
        await dtpl.createTemplateFiles([currentfile], false)
      }
    }
  }

  createRelatedFiles = async () => {
    const {activeEditor, dtpl} = this
    if (!dtpl) return
    if (!activeEditor) {
      dtpl.warning('当前没有打开的文件，无法创建关联文件')
    } else {
      await dtpl.createRelatedFiles(activeEditor.document.fileName)
    }
  }

  // TODO: 需要找到 vscode 中添加右键菜单的功能
  // createTemplateFolders = async () => {}

  dispose() {
    if (this.fileSystemWatcher) {
      this.fileSystemWatcher.dispose()
      this.fileSystemWatcher = undefined
    }
    if (this.dtpl) {
      this.dtpl.dispose()
      this.dtpl = undefined
    }
  }
}
