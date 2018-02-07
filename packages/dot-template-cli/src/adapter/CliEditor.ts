import {Editor} from 'dot-template-core'
import * as inquirer from 'inquirer'

export class CliEditor extends Editor {

  constructor(rootPath: string, debug: boolean = false) {
    super(rootPath)
    this.configuration.debug = debug
  }

  async confirm(message: string): Promise<boolean> {
    let answer = await inquirer.prompt({message, type: 'confirm', name: 'chose'})
    return answer.chose
  }

  dispose() {
  }
}
