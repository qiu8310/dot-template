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
export declare function series<T, R>(tasks: T[], run: (task: T, index: number, tasks: T[]) => Promise<R>): Promise<R[]>;
/**
 * 对数组去重
 */
export declare function unique<T, K extends keyof T>(items: T[], uniqueKey?: K): T[];
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
export declare function findJsRelatedFiles(jsfile: string, fileContent: string): string[];
export declare function requireFile(file: string): any;
export declare function getIgnoredPatterns(rootPath: string): string[];
export declare function toArray<T>(item: undefined | T | T[]): T[];
