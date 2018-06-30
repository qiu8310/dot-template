import { Command, ICommandInitOptions } from './Command';
import { Application } from '../Application';
export interface IPoint {
    row: number;
    col: number;
}
export declare class CreateRelatedFilesCommand extends Command {
    private relatedSources;
    private infos;
    /**
     * 初始文件的 Source
     */
    private source;
    /**
     * 创建关联文件
     *
     * relatedFiles 所关联的文件都是不存在的
     */
    constructor(textFile: string, app: Application, options: ICommandInitOptions);
    private replace(content, replacer, begin, end);
    execute(): Promise<boolean>;
    rollback(): Promise<boolean>;
}
export declare function calculateStartInjectPoint(content: string, reference: string): {
    begin: IPoint;
    end?: IPoint;
};
