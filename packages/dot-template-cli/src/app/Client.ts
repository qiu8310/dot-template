import * as net from 'net'
import * as fs from 'fs-extra'
import {config, Parser, CliEditor, Application, DtplAgent} from './common'
import * as info from 'mora-scripts/libs/sys/info'
import * as error from 'mora-scripts/libs/sys/error'

export interface IClientOptions {
  socketFile?: string
  debug?: boolean
  rootPath?: string
}

export class Client extends DtplAgent {
  socket?: net.Socket
  parser: Parser

  constructor(options: IClientOptions = {}) {
    super()

    let {
      socketFile = config.socketFile,
      rootPath = process.cwd(),
      debug = true
    } = options

    this.parser = new Parser()
    if (fs.existsSync(socketFile)) {
      this.socket = net.connect(socketFile)
      this.socket.setEncoding('utf8')
      info('Connect to Watcher on socket ' + socketFile)
    } else {
      this.dtpl = new Application(new CliEditor(rootPath, debug))
    }
  }

  async createTemplateFiles(files: string[]) {
    if (this.socket) {
      this.socket.end(this.parser.encode({type: 'createTemplateFiles', data: files}))
    } else {
      await super.createTemplateFiles(files)
    }
  }
  async createRelatedFiles(file: string) {
    if (this.socket) {
      this.socket.end(this.parser.encode({type: 'createRelatedFiles', data: file}))
    } else {
      await super.createRelatedFiles(file)
    }
  }
  async createDirectories(folders: string[]) {
    if (this.socket) {
      this.socket.end(this.parser.encode({type: 'createDirectories', data: folders}))
    } else {
      await super.createDirectories(folders)
    }
  }
  async undoOrRedo() {
    if (this.socket) {
      await this.socket.end(this.parser.encode({type: 'undoOrRedo', data: ''}))
    } else {
      error('没有启动 Watcher，无法回滚')
    }
  }
}
