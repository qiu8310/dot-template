import { ICopySource, ICopyFilterResult, ICopiedFiles, IUserTemplate, IData, IRelated, IInject } from '../common';
import { Source } from './Source';
import { Application } from '../Application';
export declare class Template {
    source: Source;
    filePath: string;
    data: IData;
    custom: IUserTemplate;
    app: Application;
    constructor(source: Source, filePath: string, data: IData, custom: IUserTemplate);
    filter(copySource: ICopySource): boolean | ICopyFilterResult;
    afterFilter(fromDir: string, toDir: string, result: ICopiedFiles): void;
    getRelatedSources(): IRelated[];
    getInjects(): IInject[];
}
