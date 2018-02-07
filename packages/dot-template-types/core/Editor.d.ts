import { IMinimatchOptions } from './common';
import { Application } from './Application';
export interface IConfiguration {
    debug: boolean;
    noExampleWhenCreateDtplFolder: boolean;
    watchFilesGolbPattern: string;
    commandInvalidTimeout: number;
    dtplFolderName: string;
    minimatchOptions: IMinimatchOptions;
    templateExtensions: {
        ejs: string;
        dtpl: string;
        njk: string;
    };
}
export declare abstract class Editor {
    rootPath: string;
    app: Application;
    EOL: string;
    configuration: IConfiguration;
    constructor(rootPath: string);
    /**
     * 组件销毁时会被调用
     */
    abstract dispose(): void;
    /**
     * 弹出确认框
     */
    abstract confirm(message: string): Promise<boolean>;
    getRelativeFilePath(file: string): string;
    /**
     * 文件是否是 js 文件
     *
     * 如果在 vscode 中可以通过判断 languageId 来准确得到
     *
     * @param {string} file
     */
    isJsFileOrTsFile(file: string): boolean;
    /**
     * 打开文件
     */
    openFileAsync(file: string): Promise<boolean>;
    /**
     * 关闭文件
     */
    closeFileAsync(file: string): Promise<boolean>;
    /**
     * 设置文件内容
     *
     * @param {string} file
     * @param {string} content
     */
    setFileContentAsync(file: string, content: string): Promise<boolean>;
    /**
     * 同步获取文件的内容
     *
     * @param {string} file
     * @returns
     * @memberof Editor
     */
    getFileContent(file: string): string;
    /**
     * 判断文件是否打开了
     */
    isOpened(file: string): boolean;
    debug(message: string): void;
    info(message: string): void;
    warning(message: string): void;
    error(message: string, e?: any): void;
}
