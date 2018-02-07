import {Command, ICommandInitOptions} from './commands/Command'
import {Application} from './Application'
import {CreateDirectoriesCommand, CreateRelatedFilesCommand, CreateTemplateFilesCommand} from './commands'

export class Commander {
  history: Command[] = []

  /**
   * 收集所有下次要运行的命令
   *
   * 系统需要保存命令一个一个的运行
   */
  private queue: Array<{command: Command, forward: boolean, handler: (err: any, result: boolean) => void}> = []
  private isRunning: boolean = false
  private isChecking: boolean = false
  private lastRunningTime?: number

  /**
   * 指向 prev 操作要执行的命令的索引
   */
  cursor: number = -1
  constructor(public app: Application, public length: number) {}

  private async runCommand(command: Command, forward: boolean): Promise<boolean> {
    if (this.isRunning || this.isChecking) {
      return await new Promise<boolean>((resolve, reject) => {
        this.queue.push({command, forward, handler(err: any, result: boolean) {
          if (err) reject(err)
          else resolve(result)
        }})
      })
    }

    try {
      this.isRunning = true
      let result = await command.run(forward)
      this.lastRunningTime = Date.now()
      this.isRunning = false

      // 检查下一条命令
      this.isChecking = true
      setTimeout(async () => {
        let next = this.queue.shift()
        this.isChecking = false
        if (next) {
          try {
            next.handler(null, await this.runCommand(next.command, next.forward))
          } catch (e) {
            next.handler(e, false)
          }
        }
      }, 1)

      return result
    } catch (e) {
      this.isRunning = false
      if (e instanceof Error) {
        e.message = `执行命令 ${command.name} 出错: ${e.message}`
      }
      throw e
    }
  }

  fileMaybeCreatedByCommand() {
    return this.isChecking || this.isRunning || (this.lastRunningTime && Date.now() - this.lastRunningTime < 500)
  }

  private async add(command: Command): Promise<boolean> {
    if (!command.invalid && await this.runCommand(command, true)) {
      this.history.push(command)
      if (this.history.length > this.length) {
        this.history.shift() // 将第一个命令删除掉
      } else {
        this.cursor++
      }
      return true
    }
    return false
  }

  private getCommonComamndOpts(): ICommandInitOptions {
    return {timeout: this.app.editor.configuration.commandInvalidTimeout}
  }

  private async wrap(fn: () => Promise<boolean>): Promise<boolean> {
    try {
      return await fn()
    } catch (e) {
      this.app.error(e.message, e)
      return false
    }
  }

  async addCreateDirectoriesCommand(folders: string[], noInitError: boolean): Promise<boolean> {
    return this.wrap(() => this.add(new CreateDirectoriesCommand(folders, noInitError, this.app, this.getCommonComamndOpts())))
  }
  async addCreateRelatedFilesCommand(textFile: string): Promise<boolean> {
    return this.wrap(() => this.add(new CreateRelatedFilesCommand(textFile, this.app, this.getCommonComamndOpts())))
  }
  async addCreateTemplateFilesCommand(textFiles: string[], open: boolean, noInitError: boolean): Promise<boolean> {
    return this.wrap(() => this.add(new CreateTemplateFilesCommand(textFiles, open, noInitError, this.app, this.getCommonComamndOpts())))
  }

  get hasNext() { return this.cursor < this.length - 1 }
  get hasPrev() { return this.cursor > -1 }

  /**
   * 执行历史记录中的下一条命令
   *
   * @returns {Promise<boolean>} 如果没有下一条或者命令执行失败，返回 false
   * @memberof Commander
   */
  async next(): Promise<boolean> {
    if (!this.hasNext) return false
    let command = this.history[this.cursor + 1]

    if (true === (await this.runCommand(command, true))) {
      this.cursor++
      return true
    }

    return false
  }

  /**
   * 执行历史记录中的上一条命令
   *
   * @returns {Promise<boolean>} 如果没有上一条或者命令执行失败，返回 false
   * @memberof Commander
   */
  async prev(): Promise<boolean> {
    if (!this.hasPrev) return false
    let command = this.history[this.cursor]

    if (true === (await this.runCommand(command, false))) {
      this.cursor--
      return true
    }

    return false
  }
}
