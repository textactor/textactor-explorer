
const debug = require('debug')('textactor-explorer');

import { IWikiEntityRepository } from '../../repositories/wiki-entity-repository';
import { ICountryTagsService } from './find-wiki-titles';
import { IWikiSearchNameRepository } from '../../repositories/wiki-search-name-repository';
import { IWikiTitleRepository } from '../../repositories/wiki-title-repository';
import { INamesEnumerator } from '../../services/names-enumerator';
import { ExploreWikiEntitiesByNames } from './explore-wiki-entities-by-names';
import { IKnownNameService } from '../../services/known-names-service';
import { UseCase } from '../usecase';
import { ILocale } from '../../types';


export class ExploreWikiEntities extends UseCase<void, void, void> {
    private exploreByNames: ExploreWikiEntitiesByNames;

    constructor(locale: ILocale,
        private namesEnumerator: INamesEnumerator,
        entityRep: IWikiEntityRepository,
        wikiSearchNameRep: IWikiSearchNameRepository,
        wikiTitleRep: IWikiTitleRepository,
        countryTags: ICountryTagsService,
        knownNames: IKnownNameService) {
        super()

        this.exploreByNames = new ExploreWikiEntitiesByNames(locale, entityRep, wikiSearchNameRep, wikiTitleRep, countryTags, knownNames);
    }

    protected async innerExecute(): Promise<void> {
        while (!this.namesEnumerator.atEnd()) {
            const names = await this.namesEnumerator.next();
            if (names && names.length) {
                debug(`exploring wiki entity by names: ${names}`);

                await this.exploreByNames.execute(names);
            } else {
                debug(`ExploreWikiEntities: no names!`);
            }
        }
    }
}
