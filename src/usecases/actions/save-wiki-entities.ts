
// const debug = require('debug')('textactor-explorer');

import { WikiEntity } from "../../entities/wiki-entity";
import { IWikiEntityRepository } from "../../repositories/wiki-entity-repository";
import { UseCase } from "../usecase";

export class SaveWikiEntities extends UseCase<WikiEntity[], boolean, null> {

    constructor(private wikiEntityRepository: IWikiEntityRepository) {
        super()
    }

    protected async innerExecute(entities: WikiEntity[]): Promise<boolean> {
        for (let entity of entities) {
            await this.wikiEntityRepository.createOrUpdate(entity);
        }
        return true;
    }
}
