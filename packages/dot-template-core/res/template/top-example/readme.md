# Hi there, 欢迎使用 dot-template !

> 这是一个简易的教程文档，会手把手带你过一遍 dot-template 基本功能，如果你已经对它很熟悉了，可以忽略此文件！
>
> 访问此文件的线上版本： https://www.zybuluo.com/qiu8310/note/517787


-------------

可能你已经发现了，你只是简单的创建了一个 **.dtpl 文件夹**，系统就已经为你创建了一大堆文件在其目录下。对，这就是 dot-template 的功能，**自动为你创建文件，并生成内容**。

## 好了，现在我们来一步步的体验一遍 dot-tempate 的基本功能：

__* 查看此文档需要结合同目录下的 dtpl.ts 文件一起阅读，dtpl.ts 文件是 dot-template 的配置文件__

### 1. 在项目根目录上创建一个 `my-example` 文件夹试试

你会发现 my-example 目录下又多了一大批文件，而且最外层
目录上也多了几个文件：

- package.json
- tsconfig.json
- webpack.config.js
- .gitignore

*如果项目中之前就有这些文件，那么原文件会被放到 .backup 目录内*


它是怎么创建的？

**请查看 `.dtpl/dtpl.ts` 文件中的 `模板一 : 项目模板` 配置部分**


### 2. 运行刚刚创建的项目（什么，刚刚创建了一个项目！）

- 先用 npm 在项目根目录下安装依赖包 `npm install`

- 启动服务 `npm run dev`

- 打开浏览器，访问 http://localhost:8080/

**就这么简单，你就创建了一个 react 项目了！！！ 不过 dot-template 并没有到此就结束了！**


### 3. 在 `my-example/widge` 目录上新建一个文件 `Head.tsx` 试试

你会发现 dot-template 根据模板 `.dtpl/template/widget.tsx.dtpl` 自动为你填充了一些基本的内容，在不修改源码的情况下，你就可以直接使用这个新创建的组件！你也可以修改源模板的内容来适应你自己的项目！

**请查看 `.dtpl/dtpl.ts` 文件中的 `模板二 : 文件模板` 配置部分**


### 4. 在 `my-example/page` 目录上新建一个文件 `Test.tsx` 试试

你会发现和在 widge 目录创建文件一样，没什么太大的区别。但是，别急：先确保 `Test.tsx` 文件在编辑状态下，接着你按下 `cmd+k cmd+p` (window 下是`ctrl+k ctrl+p`)快捷键试试。

你会发现系统自动在 `my-example/page/style` 目录下创建了一个同名的 `Test.css` 文件，并且在 `Test.tsx` 文件中插入了对此 css 的引用！

**请查看 `.dtpl/dtpl.ts` 文件中的 `模板三 : 创建关联文件，并生成其内容` 配置部分**


### 5. 关于渲染模板使用的数据部分，请查看 `.dtpl/dtpl.ts` 文件末尾


## Last but not Least

当你对 dot-template 生成的内容，或新生成的文件不满意时，你可以使用快捷键 `cmd+k cmd+u` （window 下是 `ctrl+k ctrl+u`）来撤销，重复再按一次会重新生成，但是，如果 **1分钟** 后没有撤销的话，就无法再撤销了（主要因为怕误操作，而操作者自己确不知，这样可能会导致文件无法恢复）


## 关于 dot-tempate 项目的地址

* [dot-template github 源码地址](https://github.com/qiu8310/dot-template)

* [dot-template vscode 插件地址](https://marketplace.visualstudio.com/items?itemName=qiu8310.dot-template-vscode)

**如果你喜欢的话，欢迎 [给个 Star](https://github.com/qiu8310/dot-template)**

**如果你有建议的话，欢迎 [提 Issue](https://github.com/qiu8310/dot-template/issues/new)**
