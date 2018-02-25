import {Stats} from 'fs'
import {Source} from '../core/file/Source'
import {Template} from '../core/file/Template'
export {Source, Template}

export interface IObject { [key: string]: any }


/**
 * 复制文件夹模板中的每一个文件时生成的一个关于此文件的对象
 *
 * template 中的 filter 函数接收的参数
 *
 * @export
 * @interface ICopySource
 */
export interface ICopySource {
  /** 复制源文件夹 */
  fromDir: string
  /** 复制的目标文件夹 */
  toDir: string

  /** 当前复制的文件的绝对路径（注意也有可能是个文件夹） */
  fromPath: string

  /** 目标路径 */
  toPath: string

  /** 文件的原始名称 */
  rawName: string
  /** 文件原始内容；如果是文件夹时，此字段为空字符串 */
  rawContent: string

  /** 文件的新名称，文件名中可能会带 ${moduleName} 等这些 IData 中的变量，它们会被 dtpl-render 给替换了，此名字是替换后的名字 */
  name: string

  /** 文件的新路径，相对于 fromDir 的路径， 文件路径中可能会带 ${moduleName} 等这些 IData 中的变量，它们会被 dtpl-render 给替换了，此路径是替换后的名字 */
  relativePath: string

  /** 文件用模板引擎渲染之后的新内容；如果是文件夹时，此字段为空字符串 */
  content: string

  /** 复制的文件的 stats 对象 */
  stats: Stats
}

/**
 *
 */
export interface ICopyFilterResult {
  /**
   * 返回一个新的文件的绝对路径
   *
   * filePath 和 name 只需要设置一个就行了，都设置会优先使用 filePath
   */
  filePath?: string
  /**
   * 返回一个新的名字
   *
   * filePath 和 name 只需要设置一个就行了，都设置会优先使用 filePath
   */
  name?: string

  /**
   * 新的文件内容（文件夹时此字段无效）
   */
  content?: string
}

/**
 * 复制文件夹模板后，生成的所有复制的文件路径
 *
 * template 中 afterFilter 函数接收的参数
 */
export type ICopiedFiles = string[]

/**
 * 标识要生成的新文件的路径 和 要插入引用的位置及引用内容
 *
 * template 中的 related 函数返回的对象
 */
export interface IRelated {
  /**
   * 相对于当前编辑的文件的一个相对路径
   *
   * dot-template 会根据这个相对路径来创建一个新的文件，举例来说：
   *
   * 假设当前文件是 src/Home.ts
   *
   * 可能需要一个同名的 css 文件放在同目录下的 style 文件夹内，这时你可以将 relativePath 设置成 './style/Home.css'
   *
   * 也有可能需要一个同名的测试文件放在根目录下的 test 文件夹内，这时你可以将 relativePath 设置成 'test/Home.ts'
   */
  relativePath: string

  /**
   * 生成了一个关联文件后，当前编辑的文件中可能需要插入一行来引用关联的文件
   *
   *
   * 还拿上面例子来说，当生成了一个同名的 css 文件后，你可能需要在 src/Home.ts 中的第三行插入
   * 一行 "require('./style/Home.css')" 来引用它，这时就可以指定
   *
   * ```
   *  {
   *    relativePath: './style/Home.css'
   *    reference: '\nrequire("./style/Home.css")\n' // 前后加换行符
   *    begin: {x: 3, y: 0}
   *  }
   * ```
   *
   * 表示自动在当前编辑的文件的第 row 行插入 reference 指定的字符串
   */
  reference?: string

  /**
   * 插入 reference 起始坐标
   *
   * 如果没设置 from，则默认为 {row: 0, col: 0}
   *
   */
  begin?: {row: number, col?: number}

  /**
   * 插入 reference 结束坐标（不包含在内）
   *
   * - 如果不设置 end，则默认和 from 一样，即完全会插入 reference 在 begin 坐标
   * - 如果设置了 end，则 begin - end 之间的数据全会被 reference 替换了
   */
  end?: {row: number, col?: number}

  /**
   * 在 js/ts 文件中自动在合适的地方插入样式文件的引用（这是特殊功能，谁要作者是前端呢，给自己开个小灶）
   *
   * 如果是样式文件的话，指定此字段后，可以智能的将 reference 插入到所有 require 或 import 的最后面
   *
   * 如果当前编辑的文件不是 js/ts 文件，或没有指定 reference，或设置了 begin 或 end 时，设置了此字段也不会起作用
   */
  smartInsertStyle?: boolean
}

export interface IInject {
  /**
   * 要注入的文件
   */
  file: string

  /**
   * 要注入的内容
   */
  data: {[key: string]: any}

  /**
   * 在原文件末尾添加新数据，而不是整体替换
   */
  append?: boolean;

  /**
   * 注入标识，默认会自动根据后缀名来判断（但并不能识别所有的后缀）
   */
  tags?: 'loose' | 'hash' | 'docs' | 'html' | string[]
}

export interface IDtplConfig {
  templates: IUserTemplate[]
  globalData?: IObject
}

export interface IUserTemplate {
  /**
   *  模板的名称，需要在同目录下有个和 name 一致的文件
   */
  name: string

  /**
   * 渲染模板用的自定义的数据
   */
  localData?: IObject

  /**
   * 在复制文件夹模板里的文件时，可以过滤掉一些不要复制的文件，或者修改要生成的新文件的路径及内容
   */
  filter?: (source: ICopySource) => boolean | ICopyFilterResult

  /**
   * 在复制文件时，是否覆盖已有的文件；默认会创建一个 .backup 文件夹用于存放原有文件
   */
  overwrite?: boolean

  /**
   * 过滤完后，并且文件都已复制完成后会执行此函数
   *
   * 可以用它来创建一些新文件，或者删除一些文件，总之任何 node 可以做的事你都可以在这里尝试
   */
  afterFilter?: (fromDir: string, toDir: string, result: ICopiedFiles, template: Template) => void

  /**
   * 获取关联的文件信息
   *
   * 如果当前编辑的文件有内容时，createTemplateFile 命令不会向它注入模板
   * 但如果配置此函数，可以给当前文件插入代码，并创建一个关联的文件。比如：
   *
   * 正在编辑文件 src/page/Home.js 文件，你可能希望快速创建 src/page/styles/Home.css 文件和它关联，
   * 并且将引用 "require('./styles/Home.css')" 插入到 src/Home.js 中，这时可以配置此
   * 函数，并返回
   *
   * ```
   *  {
   *    relativePath: './styles/Home.css',  // 前面带 "./" 表示相对于当前编辑文件的目录
   *    reference: `require('./styles/Home.css')`,
   *
   *    // 这个配置选项是专门给此情况时使用（算是开小灶吧），表示自动插入到当前文件的合适的地方
   *    // 如果是其它情况，你需要指定 begin坐标 或 begin和end坐标 （同时有 begin 和 end 时表示会替换这部分的内容）
   *    smartInsertStyle: true
   *  }
   * ```
   *
   * 另一种情况是，你需要创建一个和 src/page/Home.js 同名的测试文件放在项目最外层的 test 文件下，你可以这样返回
   *
   * ```
   *   {
   *      relativePath: 'test/Home.js'      // 前面不带 "./" 表示是相对于项目根目录
   *   }
   * ```
   *
   */
  related?: (data: IData, fileContent: string) => IRelated | IRelated[]

  /**
   * 使用 mora-scripts/libs/fs/inject.js 注入内容到其它文件中
   */
  inject?: (data: IData, fileContent: string) => IInject | IInject[]

  // onRender?: (content: string) => string

  /**
   * 匹配函数或 minimatch 的 pattern
   */
  matches: string | ((minimatch: IMinimatchFunction, source: Source) => boolean) | Array<string | ((minimatch: IMinimatchFunction, source: Source) => boolean)>

  /**
   * 是否使用 minimatch 去匹配 matches 中的字符串
   *
   * 默认值为系统配置中的 `dot-template-vscode.minimatchOptions`
   *
   * - true：  使用 minimatch 默认的参数
   * - false:  不使用 minimatch 完全使用字符串
   * - {}:     为对象时，可以指定 minimatch 的选项
   *
   * @type {(boolean | IMinimatchOptions)}
   * @memberof ITemplateProp
   */
  minimatch?: boolean | IMinimatchOptions
}

export type IData = IBasicData | IBasicData & IObject

export interface IBasicData {
  /*# INJECT_START basicData #*/
  /**
   * 项目根目录的绝对路径
   * @type {string}
   */
  rootPath: string
  /**
   * 项目下的 node_modules 目录的绝对路径
   * @type {string}
   */
  npmPath: string
  /**
   * 当前日期，格式：yyyy-mm-dd
   * @type {string}
   */
  date: string
  /**
   * 当前时间，格式: hh-mm
   * @type {string}
   */
  time: string
  /**
   * 当前日期和时间，格式：yyyy-mm-dd hh-mm
   * @type {string}
   */
  datetime: string
  /**
   * 当前用户，通过读取环境变量中的 USER 字段而获取到的
   * @type {string}
   */
  user: string
  /**
   * 当前项目的 package.json 所对应的 JSON 对象
   * @type {{[key: string]: any}}
   */
  pkg: {[key: string]: any}
  /**
   * 当前文件的绝对路径
   * @type {string}
   */
  filePath: string
  /**
   * 当前文件相对于根目录的路径
   * @type {string}
   */
  relativeFilePath: string
  /**
   * 当前文件的名称，不带路径和后缀
   * @type {string}
   */
  fileName: string
  /**
   * 当前文件的后缀名
   * @type {string}
   */
  fileExt: string
  /**
   * 当前文件所在的目录的绝对路径
   * @type {string}
   */
  dirPath: string
  /**
   * 当前文件所在的目录的名称
   * @type {string}
   */
  dirName: string
  /**
   * fileName 的别名，即当前文件的名称（不含后缀）
   * @type {string}
   */
  rawModuleName: string
  /**
   * 驼峰形式的 fileName
   * @type {string}
   */
  moduleName: string
  /**
   * 单词首字母都大写的形式的 fileName
   * @type {string}
   */
  ModuleName: string
  /**
   * 所有字母都大写，中间以下划线连接的 fileName
   * @type {string}
   */
  MODULE_NAME: string
  /**
   * 所有字母都小写，中间以下划线连接的 fileName
   * @type {string}
   */
  module_name: string
  /**
   * 创建 related 文件时，原文件的 IData 对象；或者创建文件夹模板内的文件时，文件夹的 IData 对象
   * @type {IData}
   */
  ref?: IData
  /*# INJECT_END #*/
}

export interface IMinimatchOptions {
  /**
   * Dump a ton of stuff to stderr.
   *
   * @default false
   */
  debug?: boolean;

  /**
   * Do not expand {a,b} and {1..3} brace sets.
   *
   * @default false
   */
  nobrace?: boolean;

  /**
   * Disable ** matching against multiple folder names.
   *
   * @default false
   */
  noglobstar?: boolean;

  /**
   * Allow patterns to match filenames starting with a period,
   * even if the pattern does not explicitly have a period in that spot.
   *
   * @default false
   */
  dot?: boolean;

  /**
   * Disable "extglob" style patterns like +(a|b).
   *
   * @default false
   */
  noext?: boolean;

  /**
   * Perform a case-insensitive match.
   *
   * @default false
   */
  nocase?: boolean;

  /**
   * When a match is not found by minimatch.match,
   * return a list containing the pattern itself if this option is set.
   * Otherwise, an empty list is returned if there are no matches.
   *
   * @default false
   */
  nonull?: boolean;

  /**
   * If set, then patterns without slashes will be matched against
   * the basename of the path if it contains slashes.
   *
   * @default false
   */
  matchBase?: boolean;

  /**
   * Suppress the behavior of treating #
   * at the start of a pattern as a comment.
   *
   * @default false
   */
  nocomment?: boolean;

  /**
   * Suppress the behavior of treating a leading ! character as negation.
   *
   * @default false
   */
  nonegate?: boolean;

  /**
   * Returns from negate expressions the same as if they were not negated.
   * (Ie, true on a hit, false on a miss.)
   *
   * @default false
   */
  flipNegate?: boolean;
}
export type IMinimatchFunction = (target: string, pattern: string, options?: IMinimatchOptions) => boolean
