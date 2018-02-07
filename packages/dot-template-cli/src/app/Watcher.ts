import * as net from 'net'
import * as fs from 'fs-extra'
import * as chokidar from 'chokidar'
import * as error from 'mora-scripts/libs/sys/error'
import * as info from 'mora-scripts/libs/sys/info'

import {Application, CliEditor, config, Parser, IParserMessage, DtplAgent} from './common'

export interface IWatcherOptions {
  socketFile?: string
  debug?: boolean
  rootPath?: string
  watch?: boolean
  watchGlobPatterns?: string[]
}


export class Watcher extends DtplAgent {
  server: net.Server | null
  private socketFile: string
  private parser: Parser
  private fswatcher?: chokidar.FSWatcher

  destroy = () => {
    if (fs.existsSync(this.socketFile)) {
      fs.unlinkSync(this.socketFile)
    }
    if (this.fswatcher) {
      this.fswatcher.close()
      this.fswatcher = undefined
    }
    if (this.server) {
      this.server.close()
      this.server = null
    }
  }

  constructor(options: IWatcherOptions = {}) {
    super()

    let {
      socketFile = config.socketFile,
      rootPath = process.cwd(),
      watch = false,
      watchGlobPatterns = [],
      debug = false
    } = options
    this.socketFile = socketFile
    this.dtpl = new Application(new CliEditor(rootPath, debug))

    this.parser = new Parser()
    this.parser.on('message', (json: IParserMessage) => this.handleMessage(json))

    this.server = net.createServer(this.handleConnection.bind(this))
    this.server.on('error', error)

    if (watch) {
      this.watchDir(watchGlobPatterns.length ? watchGlobPatterns : rootPath)
    }
    process.on('exit', this.destroy)
    process.on('SIGINT', this.destroy)
    process.on('SIGHUP', this.destroy)
  }

  watchDir(dir: string | string[]) {
    let emit = (filepath: string) => {
      if (typeof filepath === 'string') this.dtpl.emitNewFile(filepath)
    }

    this.fswatcher = chokidar.watch(dir, {
      ignored: ['**/node_modules/**', '**/.git/**'],
      ignoreInitial: true
    }).on('add', emit).on('addDir', emit)
  }

  handleConnection(socket: net.Socket) {
    info('receive new connection')
    socket.on('data', (buf) => this.parser.feed(buf))
    socket.on('close', () => info('connection closed'))
  }

  handleMessage(m: IParserMessage) {
    let {type, data} = m
    info(`receive command ${type} ${JSON.stringify(data)}`)
    if (type === 'createTemplateFiles') {
      this.createTemplateFiles(data)
    } else if (type === 'createDirectories') {
      this.createDirectories(data)
    } else if (type === 'createRelatedFiles') {
      this.createRelatedFiles(data)
    } else {
      this.undoOrRedo()
    }
  }

  listen(callback?: () => void) {
    let {socketFile} = this
    if (fs.existsSync(socketFile)) {
      throw new Error(`Socket file ${socketFile} already exists`)
    }

    if (this.server) {
      this.server.listen(socketFile, () => {
        if (callback) callback()
        info(`Watcher listen on ${socketFile}`)
      })
    } else {
      throw new Error('Already destroied!')
    }
  }
}
