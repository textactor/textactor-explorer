
const debug = require('debug')('textactor-explorer');

import { IWikiEntityReadRepository } from "../../repositories/wiki-entity-repository";
import { IConceptReadRepository } from "../../repositories/concept-repository";
import { Actor } from "../../entities/actor";
import { ActorHelper } from "../../entities/actor-helper";
import { ConceptHelper } from "../../entities/concept-helper";
import { ConceptContainer } from "../../entities/concept-container";
import { SelectWikiEntity } from "./select-wiki-entity";
import { UseCase } from "../usecase";


export class BuildActor extends UseCase<string, Actor | null, void> {
    private selectWikiEntity: SelectWikiEntity;

    constructor(private container: ConceptContainer,
        wikiEntityRepository: IWikiEntityReadRepository,
        private conceptRepository: IConceptReadRepository) {
        super()

        this.selectWikiEntity = new SelectWikiEntity(container, wikiEntityRepository);
    }

    protected async innerExecute(rootId: string): Promise<Actor | null> {

        const lang = this.container.lang;
        const country = this.container.country;

        const rootIdConcepts = await this.conceptRepository.getByRootNameId(rootId);
        if (rootIdConcepts.length === 0) {
            debug(`NO root concepts for ${rootId}`);
            return null;
        }
        const conceptNames = ConceptHelper.getConceptsNames(rootIdConcepts, true);
        const wikiEntity = await this.selectWikiEntity.execute(conceptNames);

        if (!wikiEntity) {
            debug(`Not found wikiEntity by concept names for ${rootId}`);
            return null;
        }

        let names: string[] = ConceptHelper.getConceptsNames(rootIdConcepts, false);

        const actor = ActorHelper.build({ lang, country }, names, wikiEntity);

        debug(`Created actor(${actor.name}): concepts:${JSON.stringify(names)}, wikiEntity: ${wikiEntity && wikiEntity.name}`);

        return actor;
    }
}
