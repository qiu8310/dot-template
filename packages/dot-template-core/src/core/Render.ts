import * as DotProp from 'mora-scripts/libs/lang/DotProp'
import * as fs from 'fs-extra'

import {Application} from './Application'
import {IObject} from './common'

const TPL_VARABLE_REGEXP = /\$([a-zA-Z][\-\w]*)|\$\{([a-zA-Z][\-\w\.]*)\}/g

export enum Engine { dtpl = 1, ejs, njk }

export class Render {
  constructor(private app: Application) {}

  judgeEngineByFileExtension(file: string): Engine | null {
    let es = this.app.editor.configuration.templateExtensions
    if (file.endsWith(es.dtpl)) return Engine.dtpl
    else if (file.endsWith(es.ejs)) return Engine.ejs
    else if (file.endsWith(es.njk)) return Engine.njk
    return null
  }

  removeFileEngineExtension(file: string): string {
    let len = 0
    let es = this.app.editor.configuration.templateExtensions
    if (file.endsWith(es.ejs)) {
      len = es.ejs.length
    } else if (file.endsWith(es.dtpl)) {
      len = es.dtpl.length
    } else if (file.endsWith(es.njk)) {
      len = es.njk.length
    }
    return file.substr(0, file.length - len)
  }

  renderFile(file: string, data: IObject): string {
    let engine = this.judgeEngineByFileExtension(file)
    let content = fs.readFileSync(file).toString()
    if (engine == null) return content
    return this.renderContent(content, data, engine)
  }

  renderContent(content: string, data: IObject, engine: Engine | null): string {
    if (engine === Engine.dtpl) return this.renderDtplContent(content, data)
    else if (engine === Engine.ejs) return this.renderEjsContent(content, data)
    else if (engine === Engine.njk) return this.renderNjkContent(content, data)
    else return content
  }

  renderDtplContent(content: string, data: IObject): string {
    return content.replace(TPL_VARABLE_REGEXP, (raw, key1, key2) => {
      let key = key1 || key2
      if (key in data) return data[key]
      if (key.indexOf('.') > 0 && DotProp.has(data, key)) return DotProp.get(data, key)
      return raw
    })
  }

  renderEjsContent(content: string, data: IObject): string {
    return require('ejs').compile(content, {})(data)
  }

  renderNjkContent(content: string, data: IObject): string {
    return require('nunjucks').renderString(content, data)
  }
}
