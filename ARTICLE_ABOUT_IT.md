# dot-template 解放 `Ctrl + C` & `Ctrl + V`

## 目录

* [作为程序员的你，是否经常会被下面三个问题所困扰](#problem)
* [不想偷懒的程序员不是一个好程序员](#lazy)
* [vscode 插件 dot-template 如何优雅的解决这三个问题](#vscode-answer)
* [不用 vscode 编辑器如何用 dot-template](#no-vscode-answer)
* [dot-template 源码简要概述](#source-code)
* [其它资源](#others)


<a id="problem"></a>

## 作为程序员的你，是否经常会被下面三个问题所困扰

1. 开启一个新项目，但是想复用以前项目的一些基础代码，这时你不得不一个文件一个文件的把一些代码 Copy 到新项目来，一不留神还经常出问题；或者干脆复制整个项目过来，然后进行繁杂的删减操作
2. 创建一个新文件，但是一些基础代码不想一行行的写，这时你 Copy 另一个已经写好了的同类型的文件的代码，然后删除一些逻辑代码，并修改相关名称，忙的不亦乐乎，最后发现其实比手写没省多少时间
3. 当项目大了之后，模块化了之后，很多文件是会有关联的，比如有个 `About.jsx` 的 React 组件页面，你一般也会需要一个同名的样式文件放在固定的某个目录下，比如 `style/About.css`，你需要手动去新建它，并在 `About.jsx` 中插入到它的引用 `require('./style/About.css')`，虽然没什么的，但是如果有程序可以帮你自动创建并插入引用，岂不快哉？




<a id="lazy"></a>

## 不想偷懒的程序员不是一个好程序员

将上面三个问题总结下，无非就是下面三个问题：

> 1、如何快速创建一个项目？
>
> **使用项目模板**
>
> 2、如何快速创建一个页面？
>
> **使用页面模板**
>
> 3、如何快速创建一个关联文件？
>
> **使用关联文件配置（也不知道叫什么好）**

### 项目模板

关于项目模板，很多公司可能会有它自己的一套快速创建新项目的方法，而且开源社区也有 [yeoman][yeoman] 这样的脚手架。作为曾经 yeoman 的重度用户，我创建过不少 yeoman 脚手架，比如给开发网站程序用的 [generator-node-babel][generator-node-babel]，给开发 node 应用程序用的 [generator-nody][generator-nody]，不过这些项目都是很久以前做的了，而且很长时间都没更新过，我也重来都没想去整理它们了，最后只能沦为网络垃圾！

现在我不再使用 yeoman 去创建项目模板的原因大致是：

* 项目模板使用频次不高，只有在新启项目的时候才需要
* 社区技术变化太快了，当新启项目时发现以前写的技术都落后了
* 自由时间太少，没精力去维护
* 用 yeoman 维护项目模板也不是很方便

**而用 dot-template 就不一样了，你甚至不用写任何脚本，可以将项目模板文件快速灵活的复制到另一个地方；另外项目模板可以和项目在同一个地方，你可以随时修改你的模板文件，而且 dtpl 模板引擎没有复杂的语法，和原码几乎一模一样，这样维护非常方便**

### 页面模板

最近在工作中，大部分项目都使用上了 React ，而且项目内的每个组件、每个页面基本上都模块化了，功能相似的模块之间的代码会有很多重复的地方，比如下面这个是 Home 页面的基础代码，而在 About 页面中你也会看到类似的结构，无非就是把代码里的 Home 换成了 About

```jsx
import * as React from 'react'
import {PageComponent, Page, inject} from '../base'
import './styles/Home.scss'

@inject('app')
export class Home extends PageComponent {
  render() {
    return (
      <Page name='Home' title='页面标题'>
        // ...
      </Page>
    )
  }
}
```

每新建一个 router 的页面，基本上都要写上面的代码，忒烦！之前有在用 [vscode 的 snippet][vscode-snippet] 来完成页面模板的功能，它对于小片的代码很灵活，但对于这种页面级别的代码一点也不方便：

* 首先里面的一些需要自动替换的变量， vscode 不会自动根据文件名称替换，[新版本的 vscode 虽然已经添加了一些内置的变量][vscode-snippet-variables]，但太少了，而且好像也不可以自定义新的变量
* 随着项目的迭代，页面的基础代码也可能会变，这时你得去更新 vscode 上不太直观的 snippet 代码
* 另外，切换项目后，你的 snippet 可能又不一样，又得维护一套
* 最后，你还要去记能触发这些 snippet 的 trigger 键，snippet 越多，记忆负担就越重

我用 vscode 自定义的 snippet 去做页面模板的时候，刚开始用的很爽，最后随着项目的迭代，我都懒的去更新它们了，最后大部分 snippet 都废弃了 [捂脸]

**dot-template 将每个页面的模板放在当前项目的同一个文件夹下维护，使用起来非常方便，而且当你新建一个文件时，就自动为新文件渲染了对应的模板，都不需要你动手！**


### 关联文件

做网站项目时，我喜欢写一个脚本，就写一个同名的样式文件；而写 node 程序时，写一个脚本，就会写一个同名的测试文件。虽然只是创建一个新文件，没多大成本，但时，可以自动完成的，为什么要去手动做呢？



<a id='vscode-answer'></a>

## vscode 插件 dot-template 如何优雅的解决这三个问题


### 在 vscode 中安装 dot-template


![在插件搜索框搜索并安装](https://n1image.hjfile.cn/res7/2017/11/06/cb4409bb54282c435a1223d1a8bef63e.jpg)


### 使用 dot-template

<!--

![生成一个示例项目](https://n1image.hjfile.cn/res7/2017/11/06/63f50ea8bd283281b348ea4ffb2f38b9.jpg)
![新建文件，自动生成内容](https://n1image.hjfile.cn/res7/2017/11/06/2308565ef96bae8b29a7246e0edfe753.jpg)

-->


dot-template 是基于配置文件的，以及一大堆预定义好的模板文件，为了统一管理，需要把配置文件和模板文件一起放在项目根目录下的 `.dtpl` 文件夹内。

安装 `dot-template` 之后，只要你在项目中创建一个空的 `.dtpl` 文件夹， dot-template 就会自动帮你生成配置文件和一些演示用的模板

![添加配置文件夹](https://n1image.hjfile.cn/res7/2017/11/06/e3a6450453f63113d29b7ee228b42ede.jpg)

### 关于模板文件

dot-template 支持三种模板：`nunjunks`、`ejs`、以及 dot-template 自己的模板 `dtpl`，后缀名分别为 `.njk`，`.ejs`，`.dtpl`。dot-template 会自动根据模板的后缀名来决定使用什么渲染引擎，在复制文件名称的时候，也会自动将这些模板引擎的后缀名去掉。

这里特别要说下 `.dtpl` 的模板，它的变量需要是像 `$name` 这种以 `$` 符号开头的，或者如果要用 `.` 的形式，需要加上大括号，如 `${person.name}`，此模板目前只支持变量替换的功能，没有 `if/for/while` 这些控制语句的功能；但是它有很强的语法提示功能，当你在模板文件内输入 `$` 后， vscode 自动会提示你当前模板所拥有的所有变量，甚至包括你自己定义的模板的局部变量和全局变量（系统默认支持的变量可以[参考这里](#data)）


![dtpl模板中可以获取用户配置的局部变量和全局变量](https://n1image.hjfile.cn/res7/2017/11/06/c676542ecd61bfe525d14dd6e04e178c.jpg)
![dtpl模板中系统默认变量会有详细说明](https://n1image.hjfile.cn/res7/2017/11/06/f302171721f8279cf961c502f757152a.jpg)
![dtpl模板中系统变量命名风格和实际显示的值是一致的](https://n1image.hjfile.cn/res7/2017/11/06/e182aec4c163312ba03da8204bfd0c67.jpg)
![鼠标悬乎也可以看到解释](https://n1image.hjfile.cn/res7/2017/11/06/cd448d9a8290d89eed5c9209c6823aa2.jpg)


### 关于配置文件

配置文件需要在 `.dtpl` 文件夹下，并且命名为 `dtpl.js` 或 `dtpl.ts`，用 ts 文件会有很强的语法提示，并且需要在当前项目中安装 `ts-node` 和 `typescript` 组件；但用 js 文件会有很强的处理速度，建议用 ts 写，但写完之后就用 `tsc` 编译成 js，或者直接用 `tsc --watch dtpl.ts` 命令，这样只要你修改了 ts 文件，就自动更新 js 文件；有 js 文件系统会优先加载 js。

配置文件 `dtpl.js` 大概结构是这样的：

```js
module.exports = function(source) {
  return {
    templates: [
      {/* 模板一的配置 */}
      {/* 模板二的配置 */}
      {/*    ...     */}
    ],

    globalData: {
      // 所有模板都可以使用的渲染数据
    }
  }
}
```


**单个模板的最基本配置**

```js
/**
 * 当在项目的 widget 目录下新建 tsx 文件时，会自动使用 template/widget.tsx.dtpl 来生成文件内容
 */
{
  name: 'template/widget.tsx.dtpl',     // 指定要使用的模板，此文件需要存在（也可以是一个文件夹）
  matches: '*-example/widget/**/*.tsx'  // 指定匹配规则，这里是匹配所有以 "-example" 结尾的文件夹下的 widget 下的 "tsx" 文件
}
```

**模板支持的所有配置**

> 如果使用 ts 编写配置文件，需要额外安装 `dot-template-types` 包
>
> `import * as _ from 'dot-template-types'`

```ts
/**
 *  模板的名称，需要在同目录下有个和 name 一致的文件
 */
name: string;
/**
 * 渲染模板用的自定义的数据
 */
localData?: IObject;
/**
 * 在复制文件夹模板里的文件时，可以过滤掉一些不要复制的文件，或者修改要生成的新文件的路径及内容
 */
filter?: (source: ICopySource) => boolean | ICopyFilterResult;
/**
 * 在复制文件时，是否覆盖已有的文件；默认会创建一个 .backup 文件夹用于存放原有文件
 */
overwrite?: boolean;
/**
 * 过滤完后，并且文件都已复制完成后会执行此函数
 *
 * 可以用它来创建一些新文件，或者删除一些文件，总之任何 node 可以做的事你都可以在这里尝试
 */
afterFilter?: (fromDir: string, toDir: string, result: ICopiedFiles, template: Template) => void;
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
related?: (data: IData, fileContent: string) => IRelated | IRelated[];
/**
 * 匹配函数或 minimatch 的 pattern
 */
matches: string | ((minimatch: IMinimatchFunction, source: Source) => boolean) | Array<string | ((minimatch: IMinimatchFunction, source: Source) => boolean)>;
/**
 * 是否使用 minimatch 去匹配 matches 中的字符串
 *
 * 默认值为系统配置中的 `dot-template.minimatchOptions`
 *
 * - true：  使用 minimatch 默认的参数
 * - false:  不使用 minimatch 完全使用字符串
 * - {}:     为对象时，可以指定 minimatch 的选项
 *
 * @type {(boolean | IMinimatchOptions)}
 * @memberof ITemplateProp
 */
minimatch?: boolean | IMinimatchOptions;
```


> **看上去是不是很复杂？**
>
> 别急，既然 dot-template 是一个以模板见长的工具，那么它也为它自己准备好了一套模板！
>
> 你只需要先在 vscode 插件市场里搜索并安装 `dot-template-vscode`，然后重启 vscode，在你的项目的根目录创建一个 `.dtpl` 的空文件夹，dot-template 会自动为你生成一个示例的配置文件，还带有一个简易的教程哦！
>
> 还不快去[安装][dtpl-vscode]！




<a id='no-vscode-answer'></a>

## 不用 vscode 编辑器如何使用 dot-template

dot-template 设计的初衷是 vscode 的插件，但在写代码的过程中，我发现其实它并没有太多的依赖 vscode，所以我就把依赖了 vscode 的部分抽离出来了，这样可以很方便的把它移植到其它编辑器中。其它编辑器版本的我没做，只做了一个命令行版本的，项目还是同一个项目（主要是懒，不想把它们放到多个项目中，一个人没精力去维护 [捂脸]），用法如下：

1. 先全局安装 npm 包

  ```bash
  npm install -g dot-template-cli
  ```

2. 安装完后会在你系统里添加 `dtpl` 命令，这时你只要 `cd` 到你的项目根目录内，运行

```bash
dtpl watch
```

注意：由于监听文件变化的组件 `chokidar` 在 window 下好像不是很好，所以 window 下用 watch 模式体验并不好。不过 window 用户可以用下面命令行程序来创建文件或文件夹：

```bash
dtpl touch your_file
dtpl mkdir your_dir
```


**接下来，你在项目里新建文件或文件夹，都会像在 vscode 里一样，会自动寻找 `.dtpl` 文件夹下合适的模板**


<a id='source-code'></a>

## dot-template 源码简要概述

![组件的 UML 关系图][uml]

如上图所示，整个项目都已经组件化了，而且项目完全是使用 typescript 完成的。

* 如果你想在其它编辑器中开发一个 dot-template 的插件，只需要继承 `src/core/Editor.ts` 中定义的 Editor 类即可，可以参考 `src/adapter/` 目录下已有的两个 Editor: `VscodeEditor` 和 `CliEditor`
* 如果你有新的 idea，想要创建一个新的命令，可以参考 `src/core/commands/` 文件下的一些已有的命令，相信你很快也可以写出你自己的命令！
* `src/core/Render.tsx` 是模板渲染引擎，所有支持的渲染引擎都在这，如果你也想添加自己的引擎， Give it a try!
* 每个新建的文件，我把它当作 `Source` 类，在 `src/core/file/Source.ts` 文件内，`Source` 类会去 `.dtpl` 文件夹下查找能和它匹配的 `Template` (`src/core/file/Template.ts`) 文件，然后用这个 `Template` 来渲染自己


> 有兴趣的可以直接去 [Github 上查看源码][dtpl]，也欢迎去完成一些[我尚未完成但想去做的功能][dtpl-todo]


<a id="others"></a>

## 其它资源


<a id="command"></a>

### vscode 中的命令

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



<a id="config"></a>

### vscode 中的配置

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


<a id="data"></a>

### 渲染模板时的基本的环境变量 IData

<!--# INJECT_START environment #-->
  **Variablle**        |  **Type**                 |  **Nullable**   |  **Description**                                             
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


<!-- 引用资源  -->
[yeoman]:                     http://yeoman.io/
[vscode-snippet]:             https://code.visualstudio.com/docs/editor/userdefinedsnippets
[vscode-snippet-variables]:   https://code.visualstudio.com/docs/editor/userdefinedsnippets#_variables
[generator-node-babel]:       https://github.com/qiu8310/generator-node-babel
[generator-jquerify]:         https://github.com/qiu8310/generator-jquerify
[generator-nody]:             https://github.com/qiu8310/generator-nody
[dtpl]:                       https://github.com/ikcamp/dot-template
[dtpl-todo]:                  https://github.com/ikcamp/dot-template/blob/master/TODO.md
[dtpl-vscode]:                https://marketplace.visualstudio.com/items?itemName=qiu8310.dot-template
[uml]:                        https://n1image.hjfile.cn/res7/2017/11/05/c3e2b522783ce717103b15dd28d230e3.png
