import { IDataContainerApi, createDataContainerApi } from "./data-container";
import { createConnection } from "mongoose";
import { IDataExplorerApi, createDataExplorerApi } from "./data-explorer";
import { ConceptContainerRepository } from "../data/concept-container-repository";
import { ConceptContainerModel } from "../data/mongo/concept-container-model";
import { ConceptModel } from "../data/mongo/concept-model";
import { ConceptRepository } from "../data/concept-repository";
import { ConceptRootNameModel } from "../data/mongo/concept-root-name-model";
import { ConceptRootNameRepository } from "../data/concept-root-name-repository";
import { WikiEntityModel } from "../data/mongo/wiki-entity-model";
import { WikiSearchNameModel } from "../data/mongo/wiki-search-name-model";
import { WikiEntityRepository } from "../data/wiki-entity-repository";
import { WikiSearchNameRepository } from "../data/wiki-search-name-repository";
import { WikiTitleRepository } from "../data/wiki-title-tepository";
import { WikiTitleModel } from "../data/mongo/wiki-title-model";
import { IConceptContainerRepository } from "../repositories/concept-container-repository";
import { IConceptRepository } from "../repositories/concept-repository";
import { IConceptRootNameRepository } from "../repositories/concept-root-name-repository";
import { IWikiEntityRepository } from "../repositories/wiki-entity-repository";
import { IWikiSearchNameRepository } from "../repositories/wiki-search-name-repository";
import { IWikiTitleRepository } from "../repositories/wiki-title-repository";

export type ExplorerOptions = {
    dbConnectionString: string
}

export interface IExplorerApi extends IDataContainerApi, IDataExplorerApi {
    closeDatabase(): Promise<void>
}

export function explorer(options: ExplorerOptions): IExplorerApi {
    const { dbConnectionString } = options;
    const connection = createConnection(dbConnectionString);

    const containerRep = new ConceptContainerRepository(new ConceptContainerModel(connection));
    const conceptRep = new ConceptRepository(new ConceptModel(connection));
    const rootNameRep = new ConceptRootNameRepository(new ConceptRootNameModel(connection));
    const entityRep = new WikiEntityRepository(new WikiEntityModel(connection));
    const searchNameRep = new WikiSearchNameRepository(new WikiSearchNameModel(connection));
    const wikiTitleRep = new WikiTitleRepository(new WikiTitleModel(connection));

    const api: IExplorerApi = {
        ...createDataContainerApi(containerRep, conceptRep, rootNameRep),
        ...createDataExplorerApi(containerRep, conceptRep, rootNameRep, entityRep, searchNameRep, wikiTitleRep),
        closeDatabase() {
            return connection.close();
        }
    }

    return api;
}

export type CustomExplorerOptions = {
    containerRep: IConceptContainerRepository
    conceptRep: IConceptRepository
    rootNameRep: IConceptRootNameRepository
    entityRep: IWikiEntityRepository
    searchNameRep: IWikiSearchNameRepository
    wikiTitleRep: IWikiTitleRepository
}

export function customExplorer(options: CustomExplorerOptions): IExplorerApi {
    const api: IExplorerApi = {
        ...createDataContainerApi(options.containerRep, options.conceptRep, options.rootNameRep),
        ...createDataExplorerApi(
            options.containerRep,
            options.conceptRep,
            options.rootNameRep,
            options.entityRep,
            options.searchNameRep,
            options.wikiTitleRep),
        closeDatabase() {
            return Promise.resolve();
        }
    }

    return api;
}
