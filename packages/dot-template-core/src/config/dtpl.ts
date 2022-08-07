import * as path from 'path'
import * as _ from '../common/interface'

export default function(source: _.Source): _.IDtplConfig {
  const config = source.app.editor.configuration
  const interfaceFile = path.resolve(source.app.dotTemplateRootPath, 'out', 'common', 'interface')
                        .replace(/\\/g, '/') // window 上的路径 \ 需要换成 /

  return {
    templates: [
      {
        name: '../../res/template/top-no-example/dtpl.ts.ejs',
        localData: {ref: {interface: interfaceFile}},
        matches() {
          let p = source.filePath
          let dirName = path.basename(path.dirname(p))
          let fileName = path.basename(p)
          return fileName === 'dtpl.ts' && dirName === config.dtplFolderName
        }
      },
      {
        name: '../../res/template/top-no-example/dtpl.cjs.ejs',
        localData: {ref: {interface: interfaceFile}},
        matches() {
          let p = source.filePath
          let dirName = path.basename(path.dirname(p))
          let fileName = path.basename(p)
          return ['dtpl.js', 'dtpl.cjs'].includes(fileName) && dirName === config.dtplFolderName
        }
      },
      {
        // 指定模板名称，需要在同目录下有个同名的文本文件或者文件夹
        // 当前指定的是一个文件夹模板
        name: '../../res/template',

        // 根据用户当前正在创建或编辑的文件的信息来判断是否需要使用此模板来处理此文件
        matches: (minimatch, source) => {
          let {isDirectory, filePath} = source
          return isDirectory && path.basename(filePath) === config.dtplFolderName
        },

        /**
         * 当用户创建了指定的文件夹后，系统会自动复制此模板文件夹下的所有文件到这个新创建的文件
         * 你可以用此函数来过滤掉一些你不需要复制的文件
         * 或者返回新的文件路径和内容
         */
        filter(copy: _.ICopySource): boolean | _.ICopyFilterResult {
          let noExample = source.app.editor.configuration.noExampleWhenCreateDtplFolder
          let dirName = path.basename(path.dirname(copy.fromPath))

          if (dirName === 'top-example' || dirName === 'top-no-example') {
            if (dirName === 'top-example' && noExample || dirName === 'top-no-example' && !noExample) {
              return false
            }
            return {
              name: copy.name,
              filePath: path.resolve(copy.toPath, '..', '..', copy.name)
            }
          }

          if (noExample) return false
          return {
            name: copy.rawName,
            content: copy.rawContent
          }
        }
      }
    ],

    globalData: {
      interface: interfaceFile
    }
  }
}
