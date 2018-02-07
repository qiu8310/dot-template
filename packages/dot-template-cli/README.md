# dot-template-cli

dot-template 命令行工具，vscode 中可以安装 [dot-template vscode 插件](https://marketplace.visualstudio.com/items?itemName=qiu8310.dot-template)

## 使用方法

### 单独使用

* 使用 `dtpl touch <files>` 创建文本文件；
* 使用 `dtpl related <files...>` 创建指定的文件的关联文件；
* 使用 `dtpl mkdir <directories...>` 创建文件夹；

### 创建服务器后再使用（方便撤销和重做）

1. 使用 `dtpl watch` 创建一个服务器
2. 使用 `dtpl touch <files>` 创建文本文件；
   使用 `dtpl related <files...>` 创建指定的文件的关联文件；
   使用 `dtpl mkdir <directories...>` 创建文件夹；
   使用 `dtpl revoke` 来撤销或重做上一次命令（只能撤销一次，并且要在 1 分钟内，因为文件很容易被更新，撤销容易丢失文件）


## 更多详情请查看 [dot-template](https://github.com/ikcamp/dot-template)
