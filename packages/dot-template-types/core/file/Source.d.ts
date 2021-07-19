import { Template } from './Template';
import { Application } from '../Application';
import { IBasicData, IData, IUserTemplate } from '../common';
export declare class Source {
    app: Application;
    filePath: string;
    private _basicData?;
    relativeFilePath: string;
    exists: boolean;
    isFile: boolean;
    isDirectory: boolean;
    fileContent: string;
    systemConfigDir: string;
    constructor(app: Application, filePath: string);
    readonly basicData: IBasicData;
    createTemplate(filePath: string, data: IData, userTemplate: IUserTemplate): Template;
    match(isTemplateDirectory: boolean): Template | undefined;
    /**
     * 根据用户的配置，查找一个匹配的并且存在的模板文件
     */
    private findMatchedUserTemplate;
    /**
     * 加载配置文件，每次都重新加载，确保无缓存
     */
    private loadDtplConfig;
    /**
     * 在 dtpl 目录内找到配置文件
     */
    private findConfigFileInDtplFolder;
    /**
     * 不在递归向上查找 .dtpl 文件夹了（因为如果两个编辑器打开的项目共用一个 .dtpl 文件夹时，会出现问题）
     */
    private findAllDirectoriesCanExistsDtplFolder;
}
