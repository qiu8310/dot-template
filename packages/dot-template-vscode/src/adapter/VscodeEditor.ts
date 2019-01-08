import * as vscode from 'vscode'
import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs-extra'

import {Editor, IConfiguration} from 'dot-template-core'

const jsLanguageIds = ['typescriptreact', 'javascriptreact', 'typescript', 'javascript']
const ID = 'dot-template-vscode'

export class VscodeEditor extends Editor {
  // @ts-ignore
  public configuration: IConfiguration

  // private fileSystemWatcher: vscode.FileSystemWatcher // 和 App 中重复了
  private configListener: vscode.Disposable

  constructor() {
    // 获取一个包含 .dtpl 的文件夹，把它当作 rootPath
    let c = vscode.workspace.getConfiguration(ID)
    let dtplFolderName = c.get('dtplFolderName', '.dtpl')
    let folders = (vscode.workspace.workspaceFolders || []).map(f => f.uri.fsPath)
    let rootPath = folders
      ? (folders.find(dir => fs.existsSync(path.join(dir, dtplFolderName))) || folders[0])
      : process.cwd()
    super(rootPath)
    this.setConfiguration(c)
    this.configListener = vscode.workspace.onDidChangeConfiguration(() => this.setConfiguration())
    // this.fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*', false, true, true)
    // this.fileSystemWatcher.onDidCreate(uri => this.app.emitNewFile(uri.fsPath))
  }

  private setConfiguration(c?: vscode.WorkspaceConfiguration) {
    c = c || vscode.workspace.getConfiguration(ID)
    let eol = vscode.workspace.getConfiguration('files', null as any).get('eol', os.EOL)
    if (!['\r', '\n', '\r\n'].includes(eol)) eol = os.EOL

    this.EOL = eol
    this.configuration = {
      debug: c.get('debug', false),
      noExampleWhenCreateDtplFolder: c.get('noExampleWhenCreateDtplFolder', false),
      watchFilesGlobPattern: c.get('watchFilesGlobPattern', '**/*'),
      commandInvalidTimeout: c.get('commandInvalidTimeout', 60000),
      dtplFolderName: c.get('dtplFolderName', '.dtpl'),
      minimatchOptions: c.get('minimatchOptions') || {matchBase: true, nocomment: true, dot: true},
      templateExtensions: {
        ejs: c.get('ejsExtension', '.ejs'),
        dtpl: c.get('dtplExtension', '.dtpl'),
        njk: c.get('njkExtension', '.njk')
      }
    }

    this.debug('配置信息更新 ' + JSON.stringify(this.configuration))
  }

  dispose() {
    // this.fileSystemWatcher.dispose()
    this.configListener.dispose()
  }

  async confirm(message: string): Promise<boolean> {
    let picks = ['确认', '取消']
    let chose = await vscode.window.showQuickPick(picks, {placeHolder: message})
    return chose === picks[0]
  }

  getRelativeFilePath(file: string) {
    return path.relative(this.rootPath, file)
  }

  /**
   * 文件是否是 js 文件
   *
   * 如果在 vscode 中可以通过判断 languageId 来准确得到
   *
   * @param {string} file
   */
  isJsFileOrTsFile(file: string): boolean {
    let editor = getFileEditor(file)
    if (editor) return jsLanguageIds.includes(editor.document.languageId)
    return /\.[jt]sx?$/i.test(file)
  }

  /**
   * 打开文件
   */
  async openFileAsync(file: string): Promise<boolean> {
    let editor = getFileEditor(file)
    if (!editor) {
      editor = await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(file))
    } else if (editor !== vscode.window.activeTextEditor) {
      editor = await vscode.window.showTextDocument(editor.document)
    }

    // vscode 有两种打开，一种是临时打开，在打开下一个临时文件时会覆盖上一个
    // 此时当然不是临时打开，需要一直打开着
    await vscode.commands.executeCommand(`workbench.action.keepEditor`)
    return this.isOpened(file)
  }

  /**
   * 关闭文件
   */
  async closeFileAsync(file: string): Promise<boolean> {
    let editor = getFileEditor(file)
    if (!editor) return true
    if (editor.document.isDirty && false === (await editor.document.save())) {
      return false
    }

    await vscode.commands.executeCommand(`workbench.action.closeActiveEditor`)
    return !this.isOpened(file)
  }

  /**
   * 设置文件内容
   *
   * @param {string} file
   * @param {string} content
   */
  async setFileContentAsync(file: string, content: string): Promise<boolean> {
    let editor = getFileEditor(file)
    if (editor) {
      return await setEditorContentAsync(editor, content)
    } else {
      fs.writeFileSync(file, content)
      return true
    }
  }

  /**
   * 同步获取文件的内容
   *
   * @param {string} file
   * @returns
   * @memberof Editor
   */
  getFileContent(file: string) {
    let editor = getFileEditor(file)
    if (editor) {
      return editor.document.getText()
    }
    return fs.readFileSync(file).toString()
  }

  /**
   * 判断文件是否打开了
   */
  isOpened(file: string): boolean {
    return vscode.window.visibleTextEditors.some(editor => editor.document.fileName === file)
  }

  debug(message: string) {
    if (this.configuration.debug) {
      console.log('[dtpl] ' + message)
      let debugFile = path.join(this.rootPath, 'dtpl.debug.log')
      fs.ensureFileSync(debugFile)
      fs.writeFile(debugFile, message + this.EOL, {flag: 'a'})
    }
  }
  warning(message: string) {
    vscode.window.showWarningMessage(`[dtpl] ${message}`)
  }
  info(message: string) {
    vscode.window.showInformationMessage(`[dtpl] ${message}`)
  }
  error(message: string, e?: Error | any) {
    let hasError = !!e
    message = message.split(/\r?\n/)[0] // 取第一行
    vscode.window.showErrorMessage(`[dtpl] ${message} ${hasError ? '(详情请查看根目录下 dtpl.error.log 文件)' : ''}`)
    if (hasError) {
      console.error(e)
      let errorFile = path.join(this.rootPath, 'dtpl.error.log')
      fs.ensureFileSync(errorFile)
      fs.writeFile(errorFile, e.stack || JSON.stringify(e))
    }
  }
}


function getFileEditor(file: string) {
  return vscode.window.visibleTextEditors.find(editor => editor.document.fileName === file)
}

async function setEditorContentAsync(editor: vscode.TextEditor, content: string): Promise<boolean> {
  // insertSnippet 时会替换 $xxx 为空（如果没有匹配到 vscode 的变量的化）
  // await editor.insertSnippet(new vscode.SnippetString(content), posOrRange)

  // 不要保存，保存了会触发 webpack 更新代码，这样不好
  // await editor.document.save()
  return editor.edit(builder => {
    let start = new vscode.Position(0, 0)
    let lastLine = editor.document.lineAt(editor.document.lineCount - 1)

    builder.replace(new vscode.Range(start, lastLine.range.end), content)
  })
}
