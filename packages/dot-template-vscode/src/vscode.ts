import * as vscode from 'vscode'
import {App, AutoCompletion, HoverProvider} from './app/'

export function activate(context: vscode.ExtensionContext) {
  const dtplDocumentSelector = 'dtpl'
  const app = new App()

  context.subscriptions.push(
    app,
    vscode.languages.registerHoverProvider(dtplDocumentSelector, new HoverProvider()),
    vscode.languages.registerCompletionItemProvider(dtplDocumentSelector, new AutoCompletion(), '$', '.', '${'),

    /*# INJECT_START commands #*/
    vscode.commands.registerCommand('dot-template-vscode.createTemplateFiles', app.createTemplateFiles),
    vscode.commands.registerCommand('dot-template-vscode.createRelatedFiles', app.createRelatedFiles),
    vscode.commands.registerCommand('dot-template-vscode.undoOrRedo', app.undoOrRedo)
    /*# INJECT_END #*/
  )

  return app
}

