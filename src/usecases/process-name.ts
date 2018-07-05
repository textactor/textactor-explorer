
const debug = require('debug')('textactor-explorer');

import { UseCase } from './usecase';
import { IWikiEntityRepository } from '../repositories/wiki-entity-repository';
import { IWikiSearchNameRepository } from '../repositories/wiki-search-name-repository';
import { IWikiTitleRepository } from '../repositories/wiki-title-repository';
import { ConceptContainer } from '../entities/concept-container';
import { ExploreWikiEntitiesByNames } from './actions/explore-wiki-entities-by-names';
import { BuildActorByNames } from './actions/build-actor-by-names';
import { IKnownNameService } from '../services/known-names-service';
import { Actor } from '../entities/actor';
import { ICountryTagsService } from './actions/find-wiki-titles';

export class ProcessName extends UseCase<string, Actor | null, void> {

    constructor(private container: ConceptContainer,
        private entityRep: IWikiEntityRepository,
        private wikiSearchNameRep: IWikiSearchNameRepository,
        private wikiTitleRep: IWikiTitleRepository,
        private countryTags: ICountryTagsService,
        private knownNames: IKnownNameService) {
        super()

        if (!container.lang || !container.country) {
            throw new Error(`ConceptContainer is not valid: ${container.lang}-${container.country}`);
        }
    }

    protected async innerExecute(name: string): Promise<Actor | null> {
        const container = this.container;

        debug(`Start processing name: ${name}`);

        const exploreWikiEntities = new ExploreWikiEntitiesByNames(container,
            this.entityRep,
            this.wikiSearchNameRep,
            this.wikiTitleRep,
            this.countryTags,
            this.knownNames);
        const buildActor = new BuildActorByNames(this.container, this.entityRep);

        debug(`=====> Start exploreWikiEntities`);
        await exploreWikiEntities.execute([name]);
        debug(`<===== End exploreWikiEntities`);

        debug(`=====> Start generateActors`);
        const actor = await buildActor.execute([name]);
        debug(`<===== End generateActors`);

        debug(`End processing name: ${name}`);

        return actor;
    }
}
