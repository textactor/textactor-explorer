
const debug = require('debug')('textactor-explorer');

import { IWikiEntityRepository } from '../../repositories/wiki-entity-repository';
import { ICountryTagsService } from './find-wiki-titles';
import { IWikiSearchNameRepository } from '../../repositories/wiki-search-name-repository';
import { IWikiTitleRepository } from '../../repositories/wiki-title-repository';
import { ConceptContainer } from '../../entities/concept-container';
import { INamesEnumerator } from '../../services/names-enumerator';
import { ExploreWikiEntitiesByNames } from './explore-wiki-entities-by-names';
import { IKnownNameService } from '../../services/known-names-service';
import { UseCase } from '../usecase';


export class ExploreWikiEntities extends UseCase<void, void, void> {
    private exploreByNames: ExploreWikiEntitiesByNames;

    constructor(container: ConceptContainer,
        private namesEnumerator: INamesEnumerator,
        entityRep: IWikiEntityRepository,
        wikiSearchNameRep: IWikiSearchNameRepository,
        wikiTitleRep: IWikiTitleRepository,
        countryTags: ICountryTagsService,
        knownNames: IKnownNameService) {
        super()

        this.exploreByNames = new ExploreWikiEntitiesByNames(container, entityRep, wikiSearchNameRep, wikiTitleRep, countryTags, knownNames);
    }

    protected async innerExecute(): Promise<void> {
        const self = this;

        while (!this.namesEnumerator.atEnd()) {
            const names = await self.namesEnumerator.next();
            if (names && names.length) {
                debug(`exploring wiki entity by names: ${names}`);

                await self.exploreByNames.execute(names);
            }
        }
    }
}
