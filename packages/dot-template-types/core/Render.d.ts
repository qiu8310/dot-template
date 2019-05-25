import { Application } from './Application';
import { IObject } from './common';
export declare enum Engine {
    dtpl = 1,
    ejs = 2,
    njk = 3
}
export declare class Render {
    private app;
    constructor(app: Application);
    judgeEngineByFileExtension(file: string): Engine | null;
    removeFileEngineExtension(file: string): string;
    renderFile(file: string, data: IObject): string;
    renderContent(content: string, data: IObject, engine: Engine | null): string;
    renderDtplContent(content: string, data: IObject): string;
    renderEjsContent(content: string, data: IObject): string;
    renderNjkContent(content: string, data: IObject): string;
}
