import * as path from 'path'
import {transformer} from './transformer'
import {IBasicData} from './interface'

export function data(rootPath: string, filePath: string): IBasicData {
    let d = new Date()
    let pad = (n: number): number | string => n < 10 ? '0' + n : n
    let date = [d.getFullYear(), d.getMonth() + 1, d.getDate()].map(pad).join('-')
    let time = [d.getHours(), d.getMinutes()].map(pad).join(':')
    let datetime = date + ' ' + time

    let npmPath = path.join(rootPath, 'node_modules')

    let pkg = {}
    try { pkg = require(path.join(rootPath, 'package.json')) } catch (e) { }

    let dirPath = path.dirname(filePath)
    let fileExt = path.extname(filePath)
    let fileName = path.basename(filePath, fileExt)
    let dirName = path.basename(dirPath)
    let relativeFilePath = path.relative(rootPath, filePath)

    return  {
      date,
      time,
      datetime,

      user: process.env.USER || '',
      pkg,

      rootPath,
      npmPath,
      filePath,
      dirPath,
      fileName,
      dirName,
      fileExt,
      relativeFilePath,

      rawModuleName: fileName,
      moduleName: transformer.camel(fileName),
      ModuleName: transformer.capitalize(fileName),
      MODULE_NAME: transformer.upper(fileName),
      module_name: transformer.snake(fileName)
    }
}

export const dataExplain = {
  /*# INJECT_START dataExplain #*/
  rootPath: {desc: '项目根目录的绝对路径', type: 'string'},
  npmPath: {desc: '项目下的 node_modules 目录的绝对路径', type: 'string'},
  date: {desc: '当前日期，格式：yyyy-mm-dd', type: 'string'},
  time: {desc: '当前时间，格式: hh-mm', type: 'string'},
  datetime: {desc: '当前日期和时间，格式：yyyy-mm-dd hh-mm', type: 'string'},
  user: {desc: '当前用户，通过读取环境变量中的 USER 字段而获取到的', type: 'string'},
  pkg: {desc: '当前项目的 package.json 所对应的 JSON 对象', type: '{[key: string]: any}'},
  filePath: {desc: '当前文件的绝对路径', type: 'string'},
  relativeFilePath: {desc: '当前文件相对于根目录的路径', type: 'string'},
  fileName: {desc: '当前文件的名称，不带路径和后缀', type: 'string'},
  fileExt: {desc: '当前文件的后缀名', type: 'string'},
  dirPath: {desc: '当前文件所在的目录的绝对路径', type: 'string'},
  dirName: {desc: '当前文件所在的目录的名称', type: 'string'},
  rawModuleName: {desc: 'fileName 的别名，即当前文件的名称（不含后缀）', type: 'string'},
  moduleName: {desc: '驼峰形式的 fileName', type: 'string'},
  ModuleName: {desc: '单词首字母都大写的形式的 fileName', type: 'string'},
  MODULE_NAME: {desc: '所有字母都大写，中间以下划线连接的 fileName', type: 'string'},
  module_name: {desc: '所有字母都小写，中间以下划线连接的 fileName', type: 'string'},
  ref: {desc: '创建 related 文件时，原文件的 IData 对象；或者创建文件夹模板内的文件时，文件夹的 IData 对象', type: 'IData'}
  /*# INJECT_END #*/
}
