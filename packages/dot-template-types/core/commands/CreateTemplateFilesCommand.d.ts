import { Command, ICommandInitOptions } from './Command';
import { Application } from '../Application';
/**
 * 创建文件并注入模板的命令
 *
 * **注意：**
 *
 * - 文件之前是不存在的
 * - 可以指定多个文件
 *
 */
export declare class CreateTemplateFilesCommand extends Command {
    private open;
    files: string[];
    /**
     * 对应文件的创建前的信和，在撤消命令时，要判断内容是否改过了，改过了要弹出确认框
     */
    private infos;
    /**
     * @param {string[]} files 所有要创建的文件绝对路径，一定要确保文件不存在
     * @param {boolean} [open] 是否要打开这些创建好的文件
     * @param {boolean} [noInitError] 初始化时不要报错，主要 emitNewFile 时可能是因为用户修改了文件夹的名称
     * @memberof CreateFilesCommand
     */
    constructor(files: string[], open: boolean, noInitError: boolean, app: Application, options: ICommandInitOptions);
    execute(): Promise<boolean>;
    rollback(): Promise<boolean>;
}
