import * as path from 'path'
import * as minimatch from 'minimatch'
import * as fs from 'fs-extra'
import {Template} from './Template'
import {Application} from '../Application'
import {IBasicData, IData, IDtplConfig, IUserTemplate, data, requireFile} from '../common'

export class Source {
  private _basicData?: IBasicData

  relativeFilePath: string
  exists: boolean
  // stats: fs.Stats | undefined
  isFile: boolean
  isDirectory: boolean
  fileContent: string
  systemConfigDir: string

  constructor(public app: Application, public filePath: string) {
    let stats: fs.Stats | undefined
    try {
      stats = fs.statSync(filePath)
    } catch (e) {}

    this.exists = !!stats
    this.isFile = stats ? stats.isFile() : false
    this.isDirectory = stats ? stats.isDirectory() : false
    this.fileContent = this.isFile ? this.app.editor.getFileContent(filePath) : ''
    this.relativeFilePath = path.relative(this.app.rootPath, this.filePath)

    this.systemConfigDir = path.join(app.dotTemplateRootPath, 'out', 'config')
  }

  get basicData(): IBasicData {
    if (!this._basicData) {
      this._basicData = data(this.app.rootPath, this.filePath)
    }
    return this._basicData as IBasicData
  }

  createTemplate(filePath: string, data: IData, userTemplate: IUserTemplate) {
    return new Template(this, filePath, data, userTemplate)
  }

  match(isTemplateDirectory: boolean): Template | undefined {
    let {dtplFolderName} = this.app.editor.configuration
    let dtplFolders = this.findAllDirectoriesCanExistsDtplFolder().map(f => path.join(f, dtplFolderName))

    // 如果刚创建的文件夹正好就是 .dtpl 目录
    // 则不应该在它下面找配置信息，要忽略它
    if (isTemplateDirectory && path.basename(this.filePath) === dtplFolderName) {
      dtplFolders = dtplFolders.filter(f => f.indexOf(this.filePath) !== 0)
    }

    dtplFolders.push(this.systemConfigDir) // dtpl 一定会使用的 .dtpl 目录
    for (let dtplFolder of dtplFolders) {
      if (fs.existsSync(dtplFolder)) {
        let configFile = this.findConfigFileInDtplFolder(dtplFolder)
        let config: IDtplConfig | undefined

        if (configFile) {
          this.app.debug('找到配置文件 %f', configFile)
          config = this.loadDtplConfig(configFile)
        }

        if (config) {
          let userTemplate = this.findMatchedUserTemplate(dtplFolder, configFile as string, isTemplateDirectory, config)

          if (userTemplate) {
            const templatePath = path.resolve(dtplFolder, userTemplate.name)
            this.app.debug(`找到匹配的模板文件 %f`, templatePath)

            return this.createTemplate(templatePath, {...this.basicData, ...(config.globalData || {}), ...(userTemplate.localData || {})}, userTemplate)
          } else {
            this.app.debug('配置文件 %f 中没有匹配的模板', configFile as string)
          }
        }
      }
    }

    this.app.debug(`没有找到和文件 %f 匹配的模板文件`, this.filePath)
    return
  }

  /**
   * 根据用户的配置，查找一个匹配的并且存在的模板文件
   */
  private findMatchedUserTemplate(dtplFolder: string, configFile: string, isTemplateDirectory: boolean, config: IDtplConfig): IUserTemplate | undefined {
    let defaultMinimatchOptions = this.app.editor.configuration.minimatchOptions

    return config.templates.find(t => {
      let matches = Array.isArray(t.matches) ? t.matches : [t.matches]
      let templatePath = path.resolve(dtplFolder, t.name)

      let found: boolean = false
      if (templatePath === this.filePath && templatePath.endsWith('.dtpl')) { // 当前编辑的文件就是它自己，匹配成功，主要为了触发 dtpl 文件的自动补全
        found = true
      } else {
        found = !!matches.find(m => {
          let result = false
          if (typeof m === 'string') {
            if (t.minimatch === false) {
              result = this.relativeFilePath === m
            } else {
              result = minimatch(this.relativeFilePath, m, typeof t.minimatch !== 'object' ? defaultMinimatchOptions : t.minimatch)
            }
          } else if (typeof m === 'function') {
            result = !!this.app.runUserFunction('template.match', m, [minimatch, this], t)
          } else {
            this.app.warning(`配置文件 %f 中的模板 ${t.name} 中的 matches 配置错误，只允许字符串或函数`, configFile)
            result = false
          }

          if (dtplFolder !== this.systemConfigDir) {
            this.app.debug(`TEMPLATE: ${t.name} MATCH: ${m} 匹配${result ? '' : '不'}成功`)
          }
          return result
        })
      }

      if (found) {
        if (!fs.existsSync(templatePath)) {
          this.app.warning(`模板 ${t.name} 对应的文件 %f 不存在，已忽略`, templatePath)
          found = false
        } else {
          let stats = fs.statSync(templatePath)
          if (stats.isFile() && isTemplateDirectory || stats.isDirectory() && !isTemplateDirectory) {
            // 很正常，不要报错了
            // this.app.warning(`模板 ${t.name} 对应的文件 %f ${isTemplateDirectory ? '应该是目录' : '不应该是目录'}`, templatePath)
            found = false
          }
        }
      }

      return found
    })
  }

  /**
   * 加载配置文件，每次都重新加载，确保无缓存
   */
  private loadDtplConfig(configFile: string): IDtplConfig | undefined {
    if (configFile.endsWith('.ts')) {
      let tsnode = path.join(this.app.rootPath, 'node_modules', 'ts-node')
      let tsc = path.join(this.app.rootPath, 'node_modules', 'typescript')
      if (fs.existsSync(tsnode) && fs.existsSync(tsc)) {
        require(path.join(tsnode, 'register')) // 不需要用 requireFile
      } else {
        this.app.error(this.app.format(`配置文件 %f 使用了 ts 后缀，但本地没有安装 ts-node 和 typescript，无法编译`, configFile))
        return
      }
    }
    let mod: any = requireFile(configFile)
    let config: IDtplConfig | undefined
    if (mod) {
      let fn = mod.default ? mod.default : mod
      if (typeof fn === 'function') config = this.app.runUserFunction('dtpl config', fn, [this])
      else if (typeof fn === 'object') config = fn
      else {
        this.app.warning(`配置文件 %f 配置错误，没有导出函数或对象`)
        return
      }
    }

    if (config && (!config.templates || !Array.isArray(config.templates))) {
      this.app.warning(`配置文件 %f 没有返回 templates 数组`, configFile)
      return
    }

    return config
  }

  /**
   * 在 dtpl 目录内找到配置文件
   */
  private findConfigFileInDtplFolder(dtplFolder: string): string | undefined {
    let result: string | undefined
    let names = ['dtpl.cjs', 'dtpl.js', 'dtpl.ts']

    for (let n of names) {
      let f = path.join(dtplFolder, n)
      if (fs.existsSync(f) && fs.statSync(f).isFile()) {
        result = f
        break
      }
    }

    if (!result) {
      this.app.warning(`目录 %f 里没有配置文件`, dtplFolder)
    }

    return result
  }

  /**
   * 不在递归向上查找 .dtpl 文件夹了（因为如果两个编辑器打开的项目共用一个 .dtpl 文件夹时，会出现问题）
   */
  private findAllDirectoriesCanExistsDtplFolder(): string[] {
    let result = [this.app.rootPath]

    // let dir = this.filePath // 不用管它是文件还是文件夹
    // result.push(dir)

    // while (dir !== path.resolve(dir, '..')) {
    //   dir = path.resolve(dir, '..')
    //   result.push(dir)
    // }

    if (process.env.HOME && result.indexOf(process.env.HOME) < 0) result.push(process.env.HOME)
    return result
  }
}
