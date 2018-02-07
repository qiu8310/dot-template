* [x] 指定监听的文件，（避免去监听 node_modules 下的文件或其它通用的地方）
* [x] 监听 dtpl.ts 文件，文件为空时可以注入一个简化版本的 dtpl.ts
* [x] 自动过滤 .gitignore 中的文件（处理文件夹还不太完美，需要根据后面有没 / 来判断是否是文件夹，另外还不支持 ! 符号）

* 改善 example

* [x] related 文件支持 inject 一些信息到原文件上，inject 支持 append
* [x] 自动更新 dtpl.ts 配置文件中的 interface 路径（或者发布一个 interface 包？）

    ```
    import * as _ from '/Users/Mora/.vscode/extensions/qiu8310.dot-template-0.2.1/out/common/interface'
    ```

    **采用了 types-dot-template 包的形式**


* 完善 命令的前进后退机制 (DO & UNDO)
* 打开（最好以预览的方式打开） .dtpl 目录下的 readme 文件（和下面的这条只要有一个存在就好）
* 新建完目录时，最好展开它

    // 先显示 explorer 窗口
    vscode.commands.executeCommand('workbench.view.explorer')

* 创建文件夹时，可以通过 filter 把文件复制到外面的一个目录里去，这时 revoke 无法删除它
* 在线获取 template 模板（包括文件和目录）
* 添加 vscode 的右键命令，即当鼠标放在右侧的文件或文件夹上时
* 优先使用用户本地的 ts-node

* 支持配置渲染引擎
* 扩展 `.dtpl` 模板的功能
* 添加 vscode 测试 和 cli 测试
* 给 .dtpl 模板文件添加一个 icon


官方示例大全 https://github.com/Microsoft/vscode-extension-samples

## 发布代码步骤

```bash

git checkout master

npm run build
npm test
npm version patch/minor/major

cd typing
# 修改 package.json 的版本号
npm publish
cd ..

git checkout vscode
git merge master
vsce publish

git checkkout npm
git merge master
npm publish

```
