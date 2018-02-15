import * as vscode from 'vscode'

import {App} from './App'
import {IData, IBasicData, data, dataExplain} from 'dot-template-core'
import * as DotProp from 'mora-scripts/libs/lang/DotProp'


export class AppRelied {
  get app(): App | undefined {
    let ext = vscode.extensions.getExtension('qiu8310.dot-template-vscode')
    if (ext && ext.isActive) {
      return ext.exports
    }
    return
  }

  /**
   * 支持在 .dtpl 模板文件的最上面加个 sample 字段，使的可以找到它所对应的数据，尤其是自定义数据
   *
   * 如，在文件最上面加上一行：
   *
   * /// sample: src/to/example.ts
   */
  private getSampleFile(doc: vscode.TextDocument) {
    // 加上了自动匹配同名的 dtpl 模板，所以此需求就不急了
    return doc.fileName
  }

  data(doc: vscode.TextDocument): IData {
    let fileName = this.getSampleFile(doc)

    let {app} = this
    if (app && app.dtpl) {
      let source = app.dtpl.createSource(fileName)
      let tpl = source.match(false)
      if (tpl) {
        return tpl.data
      } else {
        return data(app.dtpl.rootPath, fileName)
      }
    }
    return data(vscode.workspace.rootPath || process.cwd(), fileName)
  }

  doc(key: string, isKeyTop: boolean, data: any): string {
    if (isKeyTop && dataExplain.hasOwnProperty(key)) {
      return dataExplain[key as keyof IBasicData].desc
    }
    return ''
  }

  detail(key: string, isKeyTop: boolean, data: any): string {
    let type = ''
    if (isKeyTop && dataExplain.hasOwnProperty(key)) {
      type = `type: ${dataExplain[key as keyof IBasicData].type}\n`
    }
    let example = data.hasOwnProperty(key) ? data[key] : ''
    example = example ? '示例值: ' + JSON.stringify(example) : ''

    return type + example
  }

  markdown(word: string, data: any): vscode.MarkdownString {
    let str = ''
    if (word.indexOf('.') < 0 && dataExplain.hasOwnProperty(word)) {
      let d = dataExplain[word as keyof IBasicData]
      str += `**${d.desc}**\n\n`
      str += `type: ${d.type}\n\n`
    }
    let example = DotProp.get(data, word)
    if (example) {
      str += '```\nExample: ' + JSON.stringify(example) + ' \n```'
    }
    return new vscode.MarkdownString(str)
  }

}
