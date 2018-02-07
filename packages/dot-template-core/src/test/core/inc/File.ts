import {Project} from './Project'
import * as fs from 'fs-extra'
export class File {
  constructor(public name: string, public pro: Project) {}

  async create(result: boolean, open?: boolean) {
    await this.pro.createTemplateFilesAsync(this.name, result, open)
  }

  async related(result: boolean) {
    await this.pro.createRelatedFilesAsync(this.name, result)
  }

  async createDirectories(result: boolean) {
    await this.pro.createDirectoriesAsync(this.name, result)
  }

  get path() {
    return this.pro.fullPath(this.name)
  }

  dir() {
    fs.ensureDirSync(this.pro.fullPath(this.name))
  }
  write(content: string) {
    this.pro.writeFile(this.name, content)
  }

  async openAsync() {
    return await this.pro.editor.openFileAsync(this.pro.fullPath(this.name))
  }
  async closeAsync() {
    return await this.pro.editor.closeFileAsync(this.pro.fullPath(this.name))
  }

  delete() {
    this.pro.deleteFile(this.name)
  }

  content() {
    return this.pro.getFileContent(this.name)
  }

  shouldExists() {
    this.pro.fileShouldExists(this.name)
  }
  shouldNotExists() {
    this.pro.fileShouldNotExists(this.name)
  }

  shouldBeTextFile() {
    this.pro.fileShouldBeTextFile(this.name)
  }

  shouldOpened() {
    this.pro.fileShouldOpened(this.name)
  }

  shouldNotOpened() {
    this.pro.fileShouldNotOpened(this.name)
  }

  shouldMatch(match: RegExp | string, exact?: boolean) {
    this.pro.fileShouldMatch(this.name, match, exact)
  }
}
