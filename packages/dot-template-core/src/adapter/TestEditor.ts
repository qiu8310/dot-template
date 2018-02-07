import {Editor} from '../core/Editor'
import * as warn from 'mora-scripts/libs/sys/warn'
import * as error from 'mora-scripts/libs/sys/error'
import * as info from 'mora-scripts/libs/sys/info'

export class TestEditor extends Editor {
  EOL = '\n'
  constructor(rootPath: string, public output: boolean) {
    super(rootPath)
    this.configuration.debug = true
  }

  test_debugs: string[] = []
  debug(message: string) {
    if (this.output) console.log(message)
    this.test_debugs.push(message)
  }

  test_warnings: string[] = []
  warning(message: string) {
    if (this.output) warn(message)
    this.test_warnings.push(message)
  }

  test_infos: string[] = []
  info(message: string) {
    if (this.output) info(message)
    this.test_infos.push(message)
  }

  test_errors: string[] = []
  error(message: string, e: Error | any) {
    if (this.output) error(message)
    this.test_errors.push(message)
  }

  returnWhenConfirm: boolean = true
  async confirm(message: string): Promise<boolean> {
    return this.returnWhenConfirm
  }

  returnWhenSetFileContent: boolean = true
  async setFileContentAsync(file: string, content: string): Promise<boolean> {
    if (this.returnWhenSetFileContent) {
      return await super.setFileContentAsync(file, content)
    }
    return this.returnWhenSetFileContent
  }

  openedFiles: string[] = []
  async openFileAsync(file: string): Promise<boolean> {
    await super.openFileAsync(file) // 调用一下，触发代码覆盖
    if (this.openedFiles.indexOf(file) < 0) this.openedFiles.push(file)
    return true
  }

  async closeFileAsync(file: string): Promise<boolean> {
    await super.closeFileAsync(file) // 调用一下，触发代码覆盖
    this.openedFiles = this.openedFiles.filter(f => f !== file)
    return true
  }

  isOpened(file: string): boolean {
    super.isOpened(file) // 调用一下，触发代码覆盖
    return this.openedFiles.indexOf(file) >= 0
  }

  dispose() {
  }
}
