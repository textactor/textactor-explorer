
const debug = require('debug')('textactor-explorer');

import { IWikiEntityReadRepository } from "../../repositories/wiki-entity-repository";
import { WikiEntityHelper, EntityPopularity } from "../../entities/wiki-entity-helper";
import { uniqByProp } from "../../utils";
import { WikiEntity } from "../../entities/wiki-entity";
import { ConceptContainer } from "../../entities/concept-container";
import { UseCase } from "../usecase";


export class SelectWikiEntity extends UseCase<string[], WikiEntity | null, void> {
    constructor(private container: ConceptContainer,
        private wikiEntityRepository: IWikiEntityReadRepository) {
        super()
    }

    protected async innerExecute(names: string[]): Promise<WikiEntity | null> {
        const nameHashes = WikiEntityHelper.namesHashes(names, this.container.lang);

        let entities: WikiEntity[] = []
        for (let nameHash of nameHashes) {
            const list = await this.wikiEntityRepository.getByNameHash(nameHash);
            entities = entities.concat(list);
        }
        if (entities.length) {
            debug(`Found wikientity by names: ${JSON.stringify(names)}`);
        } else {
            debug(`NOT Found wikientity by names: ${JSON.stringify(names)}`);
        }

        if (entities.length === 0 || this.countryWikiEntities(entities).length === 0) {
            let entitiesByPartialNames: WikiEntity[] = []
            for (let nameHash of nameHashes) {
                const list = await this.wikiEntityRepository.getByPartialNameHash(nameHash);
                entitiesByPartialNames = entitiesByPartialNames.concat(list)
            }

            entitiesByPartialNames = this.countryWikiEntities(entitiesByPartialNames);
            if (entitiesByPartialNames.length) {
                debug(`found locale entities by partial name: ${entitiesByPartialNames.map(item => item.name)}`);
                entities = entities.concat(entitiesByPartialNames);
            }

            if (entities.length === 0) {
                debug(`NOT Found wikientity by partial names: ${JSON.stringify(names)}`);
                return null;
            }
        }

        entities = uniqByProp(entities, 'id');

        entities = this.sortWikiEntities(entities);

        const entity = entities[0];

        return entity;
    }

    private sortWikiEntities(entities: WikiEntity[]): WikiEntity[] {
        if (!entities.length) {
            return entities;
        }

        entities = sortEntities(entities);

        const topEntity = entities[0];

        if (topEntity.countryCodes && topEntity.countryCodes.indexOf(this.container.country) > -1) {
            debug(`Top entity has country=${this.container.country}: ${topEntity.name}`);
            return uniqByProp(entities, 'id');
        }


        const countryEntities = this.countryWikiEntities(entities);
        if (countryEntities.length) {
            let useCountryEntity = false;
            const topEntityPopularity = WikiEntityHelper.getPopularity(topEntity.rank);
            const countryEntityPopularity = WikiEntityHelper.getPopularity(countryEntities[0].rank);

            if (topEntityPopularity < EntityPopularity.POPULAR || countryEntityPopularity > EntityPopularity.LOW) {
                useCountryEntity = true;
            }
            else {
                debug(`using POPULAR entity: ${topEntity.name}(${topEntity.rank}-${topEntityPopularity})>${countryEntities[0].rank}-(${countryEntityPopularity})`);
            }

            if (useCountryEntity) {
                entities = countryEntities.concat(entities);
                debug(`using country entity: ${entities[0].name}`);
            }
        }

        entities = uniqByProp(entities, 'id');

        return entities;
    }

    private countryWikiEntities(entities: WikiEntity[]): WikiEntity[] {
        if (!entities.length) {
            return entities;
        }
        return entities.filter(item => item.countryCodes && item.countryCodes.indexOf(this.container.country) > -1);
    }
}

function sortEntities(entities: WikiEntity[]) {
    if (!entities.length) {
        return entities;
    }

    entities = entities.sort((a, b) => b.rank - a.rank);

    return entities;
    // const typeEntities = entities.filter(item => !!item.type);
    // const notTypeEntities = entities.filter(item => !item.type);

    // return typeEntities.concat(notTypeEntities);
}
