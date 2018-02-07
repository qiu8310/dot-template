import * as vscode from 'vscode'
import {Hover, TextDocument, Position, CancellationToken} from 'vscode'
import {AppRelied} from './AppRelied'

export class HoverProvider extends AppRelied implements vscode.HoverProvider {
  provideHover(document: TextDocument, position: Position, token: CancellationToken) {
    let range = document.getWordRangeAtPosition(position, /\$\{[\w\.]+\}|\$\w+\b/)
    if (!range) return null

    let word = document.getText(range).substr(1) // 去掉 $ 符号
    let data = this.data(document)

    let len = word.length
    if (word[0] === '{' && word[len - 1] === '}') word = word.substr(1, len - 2)

    return new Hover(this.markdown(word, data))
  }
}
