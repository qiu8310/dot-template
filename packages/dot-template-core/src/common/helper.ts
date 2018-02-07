import * as path from 'path'
import * as fs from 'fs-extra'

/**
 * 按先后顺序一个个用 run 函数来运行 tasks 中的字段
 *
 * @export
 * @template T
 * @template R
 * @param {T[]} tasks 要运行的任务
 * @param {(task: T) => Promise<R>} run 运行函数
 * @returns {Promise<R[]>} 返回每个 tasks 对应的结果组成的数组
 */
export async function series<T, R>(tasks: T[], run: (task: T, index: number, tasks: T[]) => Promise<R>): Promise<R[]> {
  let result: R[] = []
  if (!tasks.length) return result

  let handle: any = tasks.slice(1).reduce(
    (prev, task: T, index, ref) => {
      return async () => {
        result.push(await prev())
        return await run(task, index + 1, ref)
      }
    },
    async () => await run(tasks[0], 0, tasks)
  )
  result.push(await handle())
  return result
}

/**
 * 对数组去重
 */
export function unique<T, K extends keyof T>(items: T[], uniqueKey?: K) {
  return items.reduce((result: T[], item) => {
    if (uniqueKey) {
      if (result.every(_ => _[uniqueKey] !== item[uniqueKey])) result.push(item)
    } else {
      if (result.indexOf(item) < 0) result.push(item)
    }
    return result
  }, [])
}


const importOrExportRegexp = /^\s*(?:import|export)\s+.*?\s+from\s+['"]([^'"]+)['"]/mg
const requireRegExp = /^\s*(?:var|let|const|import)\s+\w+\s+=\s+require\(['"]([^'"]+)['"]\)/mg

/**
 * 查找 js 文件中引用的其它文件，一般是通过 require 或 import 语法来引用的
 *
 * 如：
 *
 * ```
 *  import Test from './Test'
 *  export * from './Test'
 *  const Test = require('./Test')
 *  import Test = require('./Test')
 * ```
 */
export function findJsRelatedFiles(jsfile: string, fileContent: string): string[] {
  let result: string[] = []

  let add = (from: string): string => {
    // 一定要是相对目录
    if (from[0] === '.') {
      let file = path.resolve(path.dirname(jsfile), from)

      // 如果没有后缀，要加上当前文件的后缀
      // TODO: 有可能是文件夹
      if (!(/\.\w+$/.test(file))) file += path.extname(jsfile)

      if (result.indexOf(file) < 0) result.push(file)
    }
    return ''
  }

  fileContent.replace(importOrExportRegexp, (raw, from) => add(from))
  fileContent.replace(requireRegExp, (raw, from) => add(from))

  return result
}

const fileMTimeCache: {[key: string]: number} = {}
export function requireFile(file: string): any {
  let mtime = fs.statSync(file).mtime.getTime()
  if (!fileMTimeCache[file] || fileMTimeCache[file] !== mtime) {
    delete require.cache[require.resolve(file)]
  }
  fileMTimeCache[file] = mtime
  return require(file)
}


let ignoreFileMTime = 0
let ignoredPatterns: string[] = []

export function getIgnoredPatterns(rootPath: string): string[] {
  let file = path.join(rootPath, '.gitignore')
  let mtime: number

  try {
    mtime = fs.statSync(file).mtime.getTime()
  } catch (e) { return [] }

  if (!ignoreFileMTime || ignoreFileMTime !== mtime) {
    ignoredPatterns = fs.readFileSync(file).toString()
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l && l[0] !== '#')
      .map(l => l.endsWith('/') ? l + '**' : l)
  }
  ignoreFileMTime = mtime
  return ignoredPatterns
}

export function toArray<T>(item: undefined | T | T[]): T[] {
  if (!item) return []
  return Array.isArray(item) ? item : [item]
}
