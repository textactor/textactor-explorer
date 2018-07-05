
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

export class ProcessName extends UseCase<string, Actor | null, void> {
    private actorBuilder: BuildActorByNames;

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

        this.actorBuilder = new BuildActorByNames(locale, entityRep);
    }

    protected async innerExecute(name: string): Promise<Actor | null> {
        const locale = this.locale;

        debug(`Start processing name: ${name}`);

        const exploreWikiEntities = new ExploreWikiEntitiesByNames(locale,
            this.entityRep,
            this.wikiSearchNameRep,
            this.wikiTitleRep,
            this.countryTags,
            this.knownNames);

        const names = [name];

        debug(`=====> Start exploreWikiEntities`);
        await exploreWikiEntities.execute(names);
        debug(`<===== End exploreWikiEntities`);

        debug(`=====> Start generateActors`);
        const actor = await this.actorBuilder.execute(names);
        debug(`<===== End generateActors`);

        debug(`End processing name: ${name}`);

        return actor;
    }
}
