
import { IContainerExplorer, ContainerExplorer, ContainerExplorerOptions } from "./container-explorer";
import { IConceptContainerRepository } from "../repositories/concept-container-repository";
import { IConceptRepository } from "../repositories/concept-repository";
import { IWikiEntityRepository } from "../repositories/wiki-entity-repository";
import { IWikiSearchNameRepository } from "../repositories/wiki-search-name-repository";
import { IWikiTitleRepository } from "../repositories/wiki-title-repository";

export interface IDataExplorerApi {
    newExplorer(containerId: string, options: ContainerExplorerOptions): IContainerExplorer
}

export function createDataExplorerApi(
    containerRep: IConceptContainerRepository,
    conceptRep: IConceptRepository,
    entityRep: IWikiEntityRepository,
    searchNameRep: IWikiSearchNameRepository,
    wikiTitleRep: IWikiTitleRepository,
): IDataExplorerApi {
    return {
        newExplorer(containerId: string, options: ContainerExplorerOptions) {
            return new ContainerExplorer(containerId, options,
                containerRep,
                conceptRep,
                entityRep,
                searchNameRep,
                wikiTitleRep);
        }
    }
}
