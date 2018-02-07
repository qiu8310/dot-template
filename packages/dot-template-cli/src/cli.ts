#!/usr/bin/env node

import * as cli from 'mora-scripts/libs/tty/cli'
import * as path from 'path'
import {Watcher, IWatcherOptions, Client, IClientOptions, getRootPath} from './app/'

const commonOpts = {
  'r | rootPath': '<string>  指定项目根目录，没有指定则使用 package.json 文件所在目录或者当前目录',
  'd | debug':    '<boolean> 调试模式（无 watch 时才有效）',
  's | socket':   '<string>  指定 socket 文件路径'
}

const commands = {
  touch: {
    desc: '新建文本文件',
    cmd: touch
  },
  mkdir: {
    desc: '新建文件夹',
    cmd: mkdir
  },
  related: {
    desc: '创建指定的文件的关联文件',
    cmd: related
  },
  revoke: {
    desc: '撤销或重做上一次命令',
    cmd: revoke
  },
  watch: {
    desc: '启动 watch 服务器',
    cmd: watch
  }
}

cli({
  usage: 'dtpl [options] <command>'
})
.commands({
  ...commands
})
.parse(function() {
  return this.help()
})

async function client(r: any, fn: (c: Client) => Promise<void>) {
  let opt: IClientOptions = {
    rootPath: getRootPath(r.rootPath),
    debug: !!r.debug
  }
  if (r.socket) opt.socketFile = path.resolve(r.socket)
  let c = new Client(opt)
  await fn(c)
}

function resolve(files: string[]) {
  return files.map(f => path.resolve(f))
}

function touch(topRes: any) {
  cli({
    usage: 'dtpl touch <files1, file2, ...>',
    desc: '新建文本文件，并尝试查找模板，有合适的模板的话，则渲染模板内容到此文件上',
    version: false
  })
  .options(commonOpts)
  .parse(topRes._, function(res) {
    if (res._.length) {
      client(res, c => c.createTemplateFiles(resolve(res._)))
    } else {
      this.error('请指定要创建的文件')
    }
  })
}

function related(topRes: any) {
  cli({
    usage: 'dtpl related <file>',
    desc: '新建文本文件，并尝试查找模板，有合适的模板的话，则渲染模板内容到此文件上',
    version: false
  })
  .options(commonOpts)
  .parse(topRes._, function(res) {
    if (res._.length === 1) {
      client(res, c => c.createRelatedFiles(resolve(res._)[0]))
    } else {
      this.error('必须只能指定一个文件')
    }
  })
}

function mkdir(topRes: any) {
  cli({
    usage: 'dtpl mkdir <dir1, dir2, ...>',
    desc: '新建文件夹，并尝试查找模板，有合适的模板的话，则复制模板内的所有文件到此文件夹内',
    version: false
  })
  .options(commonOpts)
  .parse(topRes._, function(res) {
    if (res._.length) {
      client(res, c => c.createDirectories(resolve(res._)))
    } else {
      this.error('请指定要创建的文件夹')
    }
  })
}

function revoke(topRes: any) {
  cli({
    usage: 'dtpl revoke',
    desc: '撤销或重做上一次命令',
    version: false
  })
  .parse(topRes._, function(res) {
    client(res, c => c.undoOrRedo())
  })
}

function watch(topRes: any) {
  cli({
    usage: 'dtpl watch [options]',
    desc: [
      '启动 watch 服务器，通过纯一的服务器来处理其它命令',
      '这样就可以回滚某个命令，同时可以支持自动监听文件变化'
    ],
    version: false
  }).options({
    ...commonOpts,
    'w | watchFileGlobs':    '<array> 指定要监听的文件，没有指定则会监听根目录'
  }).parse(topRes._, function(r) {
    let opt: IWatcherOptions = {
      rootPath: path.resolve(r.rootPath || process.cwd()),
      watch: true,
      debug: !!r.debug,
      watchGlobPatterns: r.watchFileGlobs ? r.watchFileGlobs : []
    }
    if (r.socket) opt.socketFile = path.resolve(r.socket)
    new Watcher(opt).listen()
  })
}
