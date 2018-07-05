
const debug = require('debug')('textactor-explorer');

import { Connection } from "mongoose";
import { MongoParams } from "../data/mongo/mongo-model";
import { ConceptContainerModel } from "../data/mongo/concept-container-model";
import { ConceptContainerStatus } from "../entities/concept-container";
import { ConceptContainerHelper } from "../entities/concept-container-helper";
import { parse } from 'concepts-parser';
import { KnownConceptData, ConceptHelper } from "../entities/concept-helper";
import { PushContextConcepts } from "../usecases/actions/push-context-concepts";
import { ConceptModel } from "../data/mongo/concept-model";
import { ConceptRepository } from "../data/concept-repository";
import { ConceptRootNameModel } from "../data/mongo/concept-root-name-model";
import { ConceptRootNameRepository } from "../data/concept-root-name-repository";
import { KnownNameService } from "@textactor/known-names";

export interface IDataContainerApi {
    newDataContainer(data: NewDataContainer): INewDataContainer
    findDataContainer(data: FindDataContainer): Promise<DataContainer[]>
}

export function createDataContainerApi(connection: Connection): IDataContainerApi {
    const knownNames = new KnownNameService();
    const containerModel = new ConceptContainerModel(connection);
    const conceptModel = new ConceptModel(connection);
    const rootNameModel = new ConceptRootNameModel(connection);

    const conceptRepository = new ConceptRepository(conceptModel);
    const rootNameRepository = new ConceptRootNameRepository(rootNameModel);

    const pushConcepts = new PushContextConcepts(conceptRepository, rootNameRepository);

    return {
        newDataContainer(data: NewDataContainer): INewDataContainer {
            const container = ConceptContainerHelper.build(data);

            return {
                async pushText(text: string): Promise<void> {
                    if (container.status === ConceptContainerStatus.NEW) {
                        await containerModel.update({ id: container.id, set: { status: ConceptContainerStatus.COLLECTING } });
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
                        const knownName = knownNames.getKnownName(conceptData.name, conceptData.lang, conceptData.country);
                        if (knownName && knownName.name) {
                            conceptData.knownName = knownName.name;
                            debug(`set concept known name: ${conceptData.name}=>${conceptData.knownName}`);
                        }

                        return ConceptHelper.build(conceptData);
                    }).filter(item => ConceptHelper.isValid(item));

                    await pushConcepts.execute(concepts);
                },
                // async pushName(name: string): Promise<void> {

                // },
                async end(): Promise<void> {
                    container.status = ConceptContainerStatus.COLLECT_DONE;
                    await containerModel.update({ id: container.id, set: { status: ConceptContainerStatus.COLLECT_DONE } });
                }
            }
        },
        findDataContainer(data: FindDataContainer): Promise<DataContainer[]> {
            const selector: MongoParams = {
                where: {
                    lang: data.lang,
                    country: data.country,
                },
                limit: data.limit,
                offset: data.offset,
                sort: '-createdAt',
            };

            if (data.ownerId) {
                selector.where.ownerId = data.ownerId;
            }
            if (data.uniqueName) {
                selector.where.uniqueName = data.uniqueName;
            }
            if (data.status) {
                selector.where.status = { $in: data.status };
            }

            return containerModel.list(selector);
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
    // pushName(name: string): Promise<void>
    end(): Promise<void>
}
