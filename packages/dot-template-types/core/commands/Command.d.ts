import { Application } from '../Application';
import { Template } from '../file/Template';
export interface ICommandInitOptions {
    /**
     * 指定过期时间，即如过超过这个时间就无法 execute 或 rollback
     */
    timeout?: number;
}
/**
 * 命令组件有效期过了，无法再执行或回滚
 */
export declare class CommandTimeoutError extends Error {
    constructor(command: Command, expiredSeconds: number);
}
export declare enum CommandStatus {
    /** 已经完成初始化 */
    INITED = 0,
    /** 已经执行过了，没有 rollback， rollback 即回到了 INITED */
    EXECUTED = 1,
}
export declare abstract class Command {
    name: string;
    protected app: Application;
    private options;
    /**
     * 当前命令的状态，是刚初始化还是已经执行过了
     */
    status: CommandStatus;
    /**
     * 标识当前命令是否有效
     *
     * 在命令初始化时，可能会有些非法参数，这时可以将 Command 设置成 invalid，
     * 这样就不会被记录到 Commander 中
     *
     * @type {boolean}
     * @memberof Command
     */
    invalid: boolean;
    /**
     * 上次运行时间
     */
    private lastRunTimestamp?;
    constructor(name: string, app: Application, options: ICommandInitOptions);
    /**
     * 输出 debug 信息
     */
    protected debug(message: string, ...files: string[]): void;
    /**
     * 对文本文件或文件夹过滤，需要文件为空
     *
     * 文本文件为空： 文件不存在，或者文件内容为空
     * 文件夹为空：   文件不存在，或者文件夹内无其它文件
     *
     * @param filePaths   相对于根目录的文件路径
     * @param isDirectory 是要过滤文本文件还是目录
     */
    protected filter(filePaths: string[], isDirectory: boolean): string[];
    protected inject(tpl: Template): Promise<void>;
    protected createFileAsync(file: string, content: string): Promise<void>;
    protected setFileContentAsync(file: string, newContent: string, oldContent: string): Promise<boolean>;
    protected unlinkFileAsync(file: string, fileContent: string): Promise<void>;
    /**
     * 命令是否可运行
     *
     * @readonly
     * @type {boolean}
     */
    /**
     * 运行命令
     * @param {boolean} forward true 表示 execute， false 表示 rollback
     */
    run(forward: boolean): Promise<boolean>;
    /**
     *
     * 执行当前命令
     *
     * @abstract
     * @returns {Promise<boolean>} 命令是否执行成功
     *
     *  - true：表示执行正常，会将命令打入历史记录
     *  - false: 表示执行不正常，不会将命令打入历史记录
     *
     * @throws 抛出异常的话，命令也不会打入历史记录
     *
     * @memberof Command
     */
    protected abstract execute(): Promise<boolean>;
    /**
     *
     * 回滚当前命令
     *
     * @abstract
     * @returns {Promise<boolean>}
     *
     *  - true：表示执行正常，会将命令打入历史记录
     *  - false: 表示执行不正常，不会将命令打入历史记录
     *
     * @throws 抛出异常的话，命令也不会打入历史记录
     *
     * @memberof Command
     */
    protected abstract rollback(): Promise<boolean>;
}
