import { Editor } from './Editor';
import { Render } from './Render';
import { Source } from './file/';
export declare class Application {
    editor: Editor;
    private event;
    private cmder;
    render: Render;
    rootPath: string;
    dotTemplateRootPath: string;
    constructor(editor: Editor);
    createRelatedFiles: (textFile: string) => Promise<boolean>;
    createDirectories: (folders: string[], noInitError?: boolean) => Promise<boolean>;
    createTemplateFiles: (textFile: string[], open: boolean, noInitError?: boolean) => Promise<boolean>;
    undoOrRedo: () => Promise<boolean>;
    runUserFunction<T>(name: string, fn: (...args: any[]) => T, args?: any[], context?: any): T | undefined;
    createSource(filePath: string): Source;
    /**
     * 将 message 中的 %f 用 files 的相对路径来替换
     */
    format(message: string, ...files: string[]): string;
    debug(message: string, ...files: string[]): void;
    info(message: string, ...files: string[]): void;
    warning(message: string, ...files: string[]): void;
    error(message: string, e?: any): void;
    dispose(): void;
    emitNewFile: (filePath: string) => void;
    emitCreatedFile: (filePath: string, content: string) => void;
    emitDeletedFile: (filePath: string, content: string) => void;
    emitUpdatedFile: (filePath: string, newContent: string, oldContent: string) => void;
    onCreatedFile: (listener: (filePath: string, content: string) => void) => void;
    onDeletedFile: (listener: (filePath: string, content: string) => void) => void;
    onUpdatedFile: (listener: (filePath: string, newContent: string, oldContent: string) => void) => void;
}
