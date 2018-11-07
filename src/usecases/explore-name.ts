
const debug = require('debug')('textactor-explorer');

import { UseCase } from './usecase';
import { IWikiEntityRepository } from '../repositories/wiki-entity-repository';
import { IWikiSearchNameRepository } from '../repositories/wiki-search-name-repository';
import { IWikiTitleRepository } from '../repositories/wiki-title-repository';
import { ExploreWikiEntitiesByNames } from './actions/explore-wiki-entities-by-names';
import { BuildActorByNames } from './actions/build-actor-by-names';
import { IKnownNameService } from '../services/known-names-service';
import { Actor } from '../entities/actor';
import { ICountryTagsService } from './actions/find-wiki-titles';
import { ILocale } from '../types';
import { ActorNameCollection } from '../entities/actor-name-collection';

export class ExploreName extends UseCase<string | string[], Actor | null, void> {
    private actorBuilder: BuildActorByNames;
    private exploreWikiEntities: ExploreWikiEntitiesByNames;

    constructor(private locale: ILocale,
        private entityRep: IWikiEntityRepository,
        private wikiSearchNameRep: IWikiSearchNameRepository,
        private wikiTitleRep: IWikiTitleRepository,
        private countryTags: ICountryTagsService,
        private knownNames: IKnownNameService) {
        super()

        if (!locale.lang || !locale.country) {
            throw new Error(`Locale is not valid: ${locale.lang}-${locale.country}`);
        }

        this.actorBuilder = new BuildActorByNames(locale,
            entityRep);
        this.exploreWikiEntities = new ExploreWikiEntitiesByNames(locale,
            this.entityRep,
            this.wikiSearchNameRep,
            this.wikiTitleRep,
            this.countryTags,
            this.knownNames);
    }

    protected async innerExecute(name: string | string[]): Promise<Actor | null> {

        name = Array.isArray(name) ? name : [name];

        const lang = this.locale.lang;

        debug(`Start processing: ${name}`);

        debug(`=====> Start exploreWikiEntities`);
        await this.exploreWikiEntities.execute(name);
        debug(`<===== End exploreWikiEntities`);

        debug(`=====> Start generateActors`);
        const actor = await this.actorBuilder.execute(ActorNameCollection.fromArray(name, lang));
        debug(`<===== End generateActors`);

        debug(`End processing name: ${name}`);

        return actor;
    }
}
