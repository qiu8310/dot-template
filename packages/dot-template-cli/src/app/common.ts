import * as os from 'os'
import * as path from 'path'
import * as events from 'events'
import * as findup from 'mora-scripts/libs/fs/findup'
import { StringDecoder, NodeStringDecoder } from 'string_decoder'
import * as error from 'mora-scripts/libs/sys/error'
import {Application} from 'dot-template-core'

export {Application} from 'dot-template-core'
export {CliEditor} from '../adapter/CliEditor'

export const config = {
  socketFile: getSocketFile(path.join(os.tmpdir(), 'dtpl.socket'))
}

export function getSocketFile(file: string) {
  if (process.platform === 'win32') {
    file = file.replace(/^\//, '')
    file = file.replace(/\//g, '-')
    file = '\\\\.\\pipe\\' + file
  }
  return file
}

export type IParserMessageType = 'createTemplateFiles' | 'createRelatedFiles' | 'createDirectories' | 'undoOrRedo'
export interface IParserMessage {
  type: IParserMessageType
  data: any
}

export function getRootPath(rootPath?: string | null): string {
  if (typeof rootPath === 'string' && rootPath) return path.resolve(rootPath)
  try {
    return path.dirname(findup.pkg())
  } catch(e) {
    return path.resolve(process.cwd())
  }
}

export class Parser extends events.EventEmitter {
  private decoder: NodeStringDecoder
  private data: string = ''

  constructor() {
    super()
    this.decoder = new StringDecoder('utf8')
  }

  encode(message: IParserMessage) {
    return JSON.stringify(message) + '\n';
  }

  feed(buf: Buffer) {
    let { data } = this;
    data += this.decoder.write(buf);
    let i, start = 0;
    while ((i = data.indexOf('\n', start)) >= 0) {
      const json = data.slice(start, i);
      const message = JSON.parse(json);
      this.emit('message', message);
      start = i + 1;
    }
    this.data = data.slice(start);
  }
}

export class DtplAgent {
  // @ts-ignore
  dtpl: Application
  constructor() {}
  private async wrap(fn: () => Promise<boolean>) {
    try {
      return await fn()
    } catch (e) {
      error(e)
      return false
    }
  }

  async createTemplateFiles(files: string[]) {
    await this.wrap(() => this.dtpl.createTemplateFiles(files, false))
  }
  async createRelatedFiles(file: string) {
    await this.wrap(() => this.dtpl.createRelatedFiles(file))
  }
  async createDirectories(folders: string[]) {
    await this.wrap(() => this.dtpl.createDirectories(folders))
  }
  async undoOrRedo() {
    await this.wrap(() => this.dtpl.undoOrRedo())
  }
}
