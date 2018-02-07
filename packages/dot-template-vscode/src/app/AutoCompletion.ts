import {CompletionItemProvider, TextDocument, Position, CompletionItem, Range, CompletionItemKind} from 'vscode'
import {AppRelied} from './AppRelied'
import * as DotProp from 'mora-scripts/libs/lang/DotProp'

const variableRegexp = /\$\{?([\w\.]*)$/

export class AutoCompletion extends AppRelied implements CompletionItemProvider {

  provideCompletionItems(document: TextDocument, position: Position): CompletionItem[] {
    const start: Position = new Position(position.line, 0)
    const range: Range = new Range(start, position)
    const text: string = document.getText(range)
    const matches = text.match(variableRegexp)
    if (!matches) return []

    let data = this.data(document)
    let isKeyTop = true

    let rawWords = matches[1]
    let prefix: string | undefined
    if (matches[0].indexOf('{') >= 0 && rawWords.indexOf('.') > 0) {
      isKeyTop = false
      let parts = rawWords.split('.')
      prefix = parts.pop()
      data = DotProp.get(data, parts.join('.'))
      if (typeof data !== 'object') return []
    }

    return Object.keys(data || {})
      .filter(k => !prefix || k.startsWith(prefix))
      .map(k => {
        let c = new CompletionItem(k, CompletionItemKind.Variable)

        c.documentation = this.doc(k, isKeyTop, data)
        c.detail = this.detail(k, isKeyTop, data)
        return c
      })
  }
}
