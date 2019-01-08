# dot-template

[![Travis Build Status][travis-image]][travis-url]
[![Appveyor Build Status][appveyor-image]][appveyor-url]

**新建文件或文件夹时，根据预定义的配置和模板，自动向新文件里插入模板内容，或在新文件夹里生成新文件**


## 主要功能

* 自动写入项目模板中的文件
* 自动注入文件模板到新建的文件中
* 生成某一文件的关联文件
* 注入内容到指定的文件中（**新功能**）


## 如何使用

1. vscode 插件中查找并安装 `dot-template-vscode`
2. 重启 vscode
3. 在当前打开的项目中的根目录上创建一个 `.dtpl` 的文件夹（然后跟随 vscode 弹出的提示做即可）

[更多详情请参考此](./ARTICLE_ABOUT_IT.md)


<!--
## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.
-->

<a id="config"></a>

## 项目配置

<!--# INJECT_START configure #-->
* `dot-template-vscode.debug`: 设置是否输出调试信息在项目根目录中的 dtpl.debug.log 文件中
* `dot-template-vscode.noExampleWhenCreateDtplFolder`: 新建 .dtpl 文件夹时不要创建演示用的模板
* `dot-template-vscode.watchFilesGolbPattern`: 指定要监听的文件，使用了 minimatch 匹配，并开启了 dot=true，其它选项默认
     默认值： `"**/*"`
* `dot-template-vscode.commandInvalidTimeout`: 设置命令的有效时间，过期后就无法撤销或重新执行，单位毫秒
     默认值： `60000`
* `dot-template-vscode.dtplFolderName`: 文件夹的名称，用于存放模板文件及相关配置文件
     默认值： `".dtpl"`
* `dot-template-vscode.dtplExtension`: 指定 dtpl 模板文件的后缀名
     默认值： `".dtpl"`
* `dot-template-vscode.ejsExtension`: 指定 ejs 模板文件的后缀名
     默认值： `".ejs"`
* `dot-template-vscode.njkExtension`: 指定 nunjucks 模板文件的后缀名
     默认值： `".njk"`
* `dot-template-vscode.minimatchOptions`: minimatch 的选项，用于匹配模板名称, 参考：https://github.com/isaacs/minimatch#options
     默认值： `{"matchBase":true,"nocomment":true,"dot":true}`
<!--# INJECT_END #-->

<a id="command"></a>

## 支持命令

<!--# INJECT_START commands #-->
* `createTemplateFiles`: DTPL: Create template files
    - win 快捷键： `ctrl+k ctrl+p`
    - mac 快捷键： `cmd+k cmd+p`

  创建模板文件 
  1. 如果当前编辑器没有打开的文件，则会弹出输入框，可以输入你要创建的文件；
  2. 如果当前打开的文件没内容，则会去寻找合适的模板来渲染；
  3. 如果当前打开的文件有内容，则会去寻找合适的关联文件来创建

* `createRelatedFiles`: DTPL: Create related files
    - win 快捷键： `ctrl+k ctrl+s`
    - mac 快捷键： `cmd+k cmd+s`

  创建当前编辑器打开的文件的关联文件，如果当前编辑器没打开任何文件，则会报错

* `undoOrRedo`: DTPL: Undo or Redo last action
    - win 快捷键： `ctrl+k ctrl+u`
    - mac 快捷键： `cmd+k cmd+u`

  撤销或重做上次命令所做的所有修改，并且一分钟内才有效，超不一分钟无法撤销或重做（主要为了避免误操作）

<!--# INJECT_END #-->

<a id="data"></a>

## 渲染模板时的基本的环境变量 IData

<!--# INJECT_START environment #-->
  **Variable**         |  **Type**                 |  **Nullable**   |  **Description**                                             
-----------------------|---------------------------|-----------------|--------------------------------------------------------------
  `rootPath`           |  `string`                 |                 |  项目根目录的绝对路径                                        
  `npmPath`            |  `string`                 |                 |  项目下的 node_modules 目录的绝对路径                        
  `date`               |  `string`                 |                 |  当前日期，格式：yyyy-mm-dd                                  
  `time`               |  `string`                 |                 |  当前时间，格式: hh-mm                                       
  `datetime`           |  `string`                 |                 |  当前日期和时间，格式：yyyy-mm-dd hh-mm                      
  `user`               |  `string`                 |                 |  当前用户，通过读取环境变量中的 USER 字段而获取到的          
  `pkg`                |  `{[key: string]: any}`   |                 |  当前项目的 package.json 所对应的 JSON 对象                  
  `filePath`           |  `string`                 |                 |  当前文件的绝对路径                                          
  `relativeFilePath`   |  `string`                 |                 |  当前文件相对于根目录的路径                                  
  `fileName`           |  `string`                 |                 |  当前文件的名称，不带路径和后缀                              
  `fileExt`            |  `string`                 |                 |  当前文件的后缀名                                            
  `dirPath`            |  `string`                 |                 |  当前文件所在的目录的绝对路径                                
  `dirName`            |  `string`                 |                 |  当前文件所在的目录的名称                                    
  `rawModuleName`      |  `string`                 |                 |  fileName 的别名，即当前文件的名称（不含后缀）               
  `moduleName`         |  `string`                 |                 |  驼峰形式的 fileName                                         
  `ModuleName`         |  `string`                 |                 |  单词首字母都大写的形式的 fileName                           
  `MODULE_NAME`        |  `string`                 |                 |  所有字母都大写，中间以下划线连接的 fileName                 
  `module_name`        |  `string`                 |                 |  所有字母都小写，中间以下划线连接的 fileName                 
  `ref`                |  `IData`                  |  Yes            |创建 related 文件时，原文件的 IData 对象；或者创建文件夹模板内的文件时，文件夹的 IData 对象
<!--# INJECT_END #-->

除了上面的基本环境变量外，用户也可以在配置文件中定义 `globalData` 这个针对所有模板的变量，或者在单独的模板定义 `localData` 这个只针对本模板的局部变量

<!--
## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.
-->


[travis-image]: https://travis-ci.org/qiu8310/dot-template.svg?branch=master
[travis-url]: https://travis-ci.org/qiu8310/dot-template
[appveyor-image]: https://ci.appveyor.com/api/projects/status/0uegrq3stbmhvcwj?svg=true
[appveyor-url]: https://ci.appveyor.com/project/qiu8310/dot-template
