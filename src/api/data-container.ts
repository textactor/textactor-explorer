
// const debug = require('debug')('textactor-explorer');

import { ConceptContainerStatus } from "../entities/concept-container";
import { ConceptContainerHelper } from "../entities/concept-container-helper";
import { parse } from 'concepts-parser';
import { KnownConceptData, ConceptHelper } from "../entities/concept-helper";
import { PushContextConcepts } from "../usecases/actions/push-context-concepts";
import { KnownNameService } from "@textactor/known-names";
import { IConceptContainerRepository } from "../repositories/concept-container-repository";
import { IConceptRepository } from "../repositories/concept-repository";
import { IConceptRootNameRepository } from "../repositories/concept-root-name-repository";

export interface IDataContainerApi {
    newDataContainer(data: NewDataContainer): Promise<INewDataContainer>
    findDataContainer(data: FindDataContainer): Promise<DataContainer[]>
}

export function createDataContainerApi(
    containerRep: IConceptContainerRepository,
    conceptRep: IConceptRepository,
    rootNameRep: IConceptRootNameRepository): IDataContainerApi {

    const knownNames = new KnownNameService();

    const pushConcepts = new PushContextConcepts(conceptRep, rootNameRep, knownNames);

    return {
        async newDataContainer(data: NewDataContainer): Promise<INewDataContainer> {
            const container = await containerRep.create(ConceptContainerHelper.build(data));

            return {
                container() { return container },
                async pushText(text: string): Promise<void> {
                    if (container.status === ConceptContainerStatus.NEW) {
                        await containerRep.update({ id: container.id, set: { status: ConceptContainerStatus.COLLECTING } });
                    }
                    const context = {
                        text,
                        lang: container.lang,
                        country: container.country,
                    };

                    const items = parse(context, { mode: 'collect' });
                    if (!items || !items.length) {
                        return;
                    }

                    const concepts = items.map(item => {
                        const conceptData: KnownConceptData = {
                            name: item.value, abbr: item.abbr, lang: context.lang,
                            country: context.country,
                            containerId: container.id,
                        };

                        return ConceptHelper.build(conceptData);
                    }).filter(item => ConceptHelper.isValid(item));

                    await pushConcepts.execute(concepts);
                },
                async pushTextNames(names: string[]): Promise<void> {
                    const concepts = names.map(name => {
                        const conceptData: KnownConceptData = {
                            name, lang: container.lang,
                            country: container.country,
                            containerId: container.id,
                        };

                        return ConceptHelper.build(conceptData);
                    }).filter(item => ConceptHelper.isValid(item));

                    await pushConcepts.execute(concepts);

                },
                async end(): Promise<void> {
                    container.status = ConceptContainerStatus.COLLECT_DONE;
                    await containerRep.update({ id: container.id, set: { status: ConceptContainerStatus.COLLECT_DONE } });
                }
            }
        },
        findDataContainer(data: FindDataContainer): Promise<DataContainer[]> {
            return containerRep.list(data);
        }
    }
}

//--------- Find Data Container

export type FindDataContainer = {
    lang: string
    country: string
    limit: number
    offset?: number
    status?: ConceptContainerStatus[]
    ownerId?: string
    uniqueName?: string
}

export type DataContainer = {
    id: string
    lang: string
    country: string

    name: string
    uniqueName: string

    ownerId: string

    status: ConceptContainerStatus

    lastError?: string

    createdAt?: number
    updatedAt?: number
}

//--------- New Data Container

export type NewDataContainer = {
    name: string
    uniqueName: string
    ownerId: string
    lang: string
    country: string
}

export interface INewDataContainer {
    pushText(text: string): Promise<void>
    pushTextNames(names: string[]): Promise<void>
    end(): Promise<void>
    container(): DataContainer
}
