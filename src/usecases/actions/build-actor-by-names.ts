
// const debug = require('debug')('textactor-explorer');

import { IWikiEntityReadRepository } from "../../repositories/wiki-entity-repository";
import { Actor } from "../../entities/actor";
import { ActorHelper } from "../../entities/actor-helper";
import { ConceptContainer } from "../../entities/concept-container";
import { SelectWikiEntity } from "./select-wiki-entity";
import { UseCase } from "../usecase";


export class BuildActorByNames extends UseCase<string[], Actor | null, void> {
    private selectWikiEntity: SelectWikiEntity;

    constructor(private container: ConceptContainer,
        wikiEntityRepository: IWikiEntityReadRepository) {
        super()

        this.selectWikiEntity = new SelectWikiEntity(container, wikiEntityRepository);
    }

    protected async innerExecute(names: string[]): Promise<Actor | null> {

        const wikiEntity = await this.selectWikiEntity.execute(names);

        if (!wikiEntity) {
            return null;
        }

        const actor = ActorHelper.build({ lang: this.container.lang, country: this.container.country }, names, wikiEntity);

        return actor;
    }
}
