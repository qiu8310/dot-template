import {fixturesPath, path, fs, TestEditor, Application, assert} from './helper'

export type EventType = 'createdFile' | 'deletedFile' | 'updatedFile'
export interface ListenedItem {
  type: EventType, args: any[]
}
export class Project {
  rootPath: string
  editor: TestEditor
  app: Application

  listens: ListenedItem[] = []
  constructor(name: string, dtplFolderName?: string, output: boolean = false) {
    this.rootPath = path.resolve(fixturesPath, '..', 'project-' + name)
    fs.ensureDirSync(this.rootPath)
    fs.emptyDirSync(this.rootPath)

    this.editor = new TestEditor(this.rootPath, output)

    if (dtplFolderName) {
      let target = path.join(this.rootPath, dtplFolderName)
      fs.ensureDirSync(target)
      fs.copySync(path.join(fixturesPath, dtplFolderName), target)
      this.editor.configuration.dtplFolderName = dtplFolderName
    }

    this.app = new Application(this.editor)

    let listener = (type: EventType) => {
      return (...args: any[]) => this.listens.push({type, args})
    }

    this.app.onCreatedFile(listener('createdFile'))
    this.app.onDeletedFile(listener('deletedFile'))
    this.app.onUpdatedFile(listener('updatedFile'))
  }

  // 事件是异步触发的
  async matchListens(length: number, matches: Array<{type: EventType, args?: any[], fn?: ((item: ListenedItem) => boolean)}> = []) {
    return new Promise((resolve) => {
      setTimeout(() => {
        assert.equal(this.listens.length, length)
        for (let i = 0; i < matches.length; i++) {
          let lis = this.listens[i]
          let mat = matches[i]
          assert.equal(lis.type, mat.type, `listen event type not match`)
          if (mat.args) {
            assert(mat.args.length <= lis.args.length, 'expect too many listen args')
            for (let j = 0; j < mat.args.length; j++) {
              if (typeof mat.args[j] === 'string') {
                let arg = lis.args[j]
                arg = typeof arg === 'string' && arg.indexOf(this.rootPath) === 0 ? arg.substr(this.rootPath.length + 1) : arg
                assert.equal(mat.args[j], arg.trim(), `expect arg item not match`)
              }
            }
          }
          if (mat.fn) {
            assert(mat.fn(lis), 'listen callback return not true')
          }
        }
        resolve()
      }, 100)
    })
  }

  fullPath(file: string) {
    return path.resolve(this.rootPath, file)
  }

  writeFile(file: string, content: string = '') {
    let fullPath = this.fullPath(file)
    fs.ensureDirSync(path.dirname(fullPath))
    fs.writeFileSync(fullPath, content)
  }

  deleteFile(file: string) {
    let fullPath = this.fullPath(file)
    fs.statSync(fullPath).isFile()
      ? fs.unlinkSync(fullPath)
      : fs.removeSync(fullPath)
  }

  fileShouldExists(file: string) {
    assert(fs.existsSync(this.fullPath(file)), `file ${file} not exists`)
  }
  fileShouldNotExists(file: string) {
    assert(!fs.existsSync(this.fullPath(file)), `file ${file} exists`)
  }

  fileShouldBeTextFile(file: string) {
    this.fileShouldExists(file)
    assert(fs.statSync(this.fullPath(file)).isFile(), `file ${file} not a text file`)
  }

  getFileContent(file: string) {
    this.fileShouldBeTextFile(file)
    return fs.readFileSync(this.fullPath(file)).toString()
  }

  fileShouldOpened(file: string) {
    assert(this.editor.isOpened(this.fullPath(file)), `file ${file} should opened`)
  }
  fileShouldNotOpened(file: string) {
    assert(!this.editor.isOpened(this.fullPath(file)), `file ${file} should not opened`)
  }

  fileShouldMatch(file: string, match: RegExp | string, exact?: boolean) {
    let content = this.getFileContent(file)
    if (!exact) content = content.trim()
    if (typeof match === 'string') {
      assert.equal(content, match, `file ${file} content ${JSON.stringify(content)} not match ${JSON.stringify(match)}`)
    } else {
      assert(match.test(content), `file ${file} content ${JSON.stringify(content)} not match ${match}`)
    }
  }

  async createTemplateFilesAsync(files: string | string[], result: boolean, open: boolean = false) {
    files = Array.isArray(files) ? files : [files]
    files = files.map(f => f ? this.fullPath(f) : f) // 需要测试创建空文件的情况
    let res = await this.app.createTemplateFiles(files, open)
    assert.equal(res, result, 'createTemplateFiles result not match')
  }

  async createRelatedFilesAsync(file: string, result: boolean) {
    let res = await this.app.createRelatedFiles(this.fullPath(file))
    assert.equal(res, result, 'createRelatedFiles result not match')
  }

  async createDirectoriesAsync(files: string | string[], result: boolean) {
    files = Array.isArray(files) ? files : [files]
    let res = await this.app.createDirectories(files.map(f => this.fullPath(f)))
    assert.equal(res, result, 'createRelatedFiles result not match')
  }

  async unredoAsync(result: boolean) {
    let res = await this.app.undoOrRedo()
    assert.equal(res, result, 'undo redo result not match')
  }

  destroy() {
    fs.removeSync(this.rootPath)
  }
}

