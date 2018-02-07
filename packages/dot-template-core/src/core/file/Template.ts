import {ICopySource, ICopyFilterResult, ICopiedFiles, IUserTemplate, IData, IRelated, IInject, toArray} from '../common'
import {Source} from './Source'
import {Application} from '../Application'

export class Template {
  app: Application
  constructor(public source: Source, public filePath: string, public data: IData, public custom: IUserTemplate) {
    this.app = source.app
  }

  filter(copySource: ICopySource): boolean | ICopyFilterResult {
    if (typeof this.custom.filter === 'function') {
      let result = this.app.runUserFunction('template.filter', this.custom.filter, [copySource], this.custom)
      if (result == null) return true
      return result
    }
    return true
  }

  afterFilter(fromDir: string, toDir: string, result: ICopiedFiles): void {
    let {custom} = this
    let {afterFilter} = custom
    if (typeof afterFilter === 'function') {
      this.app.runUserFunction('template.afterFilter', afterFilter, [fromDir, toDir, result, this], custom)
    }
  }

  getRelatedSources(): IRelated[] {
    let {related} = this.custom
    if (typeof related === 'function') {
      return toArray(this.app.runUserFunction('template.related', related, [this.data, this.source.fileContent]))
    }
    return []
  }

  getInjects(): IInject[] {
    let {inject} = this.custom
    if (typeof inject === 'function') {
      return toArray(this.app.runUserFunction('template.inject', inject, [this.data, this.source.fileContent]))
    }
    return []
  }
}
