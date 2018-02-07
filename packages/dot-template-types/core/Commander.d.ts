import { Command } from './commands/Command';
import { Application } from './Application';
export declare class Commander {
    app: Application;
    length: number;
    history: Command[];
    /**
     * 收集所有下次要运行的命令
     *
     * 系统需要保存命令一个一个的运行
     */
    private queue;
    private isRunning;
    private isChecking;
    private lastRunningTime?;
    /**
     * 指向 prev 操作要执行的命令的索引
     */
    cursor: number;
    constructor(app: Application, length: number);
    private runCommand(command, forward);
    fileMaybeCreatedByCommand(): boolean | 0 | undefined;
    private add(command);
    private getCommonComamndOpts();
    private wrap(fn);
    addCreateDirectoriesCommand(folders: string[], noInitError: boolean): Promise<boolean>;
    addCreateRelatedFilesCommand(textFile: string): Promise<boolean>;
    addCreateTemplateFilesCommand(textFiles: string[], open: boolean, noInitError: boolean): Promise<boolean>;
    readonly hasNext: boolean;
    readonly hasPrev: boolean;
    /**
     * 执行历史记录中的下一条命令
     *
     * @returns {Promise<boolean>} 如果没有下一条或者命令执行失败，返回 false
     * @memberof Commander
     */
    next(): Promise<boolean>;
    /**
     * 执行历史记录中的上一条命令
     *
     * @returns {Promise<boolean>} 如果没有上一条或者命令执行失败，返回 false
     * @memberof Commander
     */
    prev(): Promise<boolean>;
}
