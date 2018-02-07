import { Command, ICommandInitOptions } from './Command';
import { Application } from '../Application';
export declare class CreateDirectoriesCommand extends Command {
    private folders;
    private exists;
    constructor(folders: string[], noInitError: boolean, app: Application, options: ICommandInitOptions);
    execute(): Promise<boolean>;
    rollback(): Promise<boolean>;
    remove(dir: string, removeCurrent?: boolean): Promise<void>;
}
