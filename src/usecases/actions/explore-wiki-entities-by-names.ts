
const debug = require('debug')('textactor-explorer');

import { ILocale } from '../../types';
import { IWikiEntityRepository } from '../../repositories/wiki-entity-repository';
import { FindWikiEntitiesByTitles } from './find-wiki-entities-by-titles';
import { SaveWikiEntities } from './save-wiki-entities';
import { FindWikiTitles, ICountryTagsService } from './find-wiki-titles';
import { IWikiSearchNameRepository } from '../../repositories/wiki-search-name-repository';
import { WikiSearchNameHelper } from '../../entities/wiki-search-name';
import { IWikiTitleRepository } from '../../repositories/wiki-title-repository';
import { WikiTitleHelper } from '../../entities/wiki-title';
import { IKnownNameService } from '../../services/known-names-service';
import { UseCase } from '../usecase';
import { uniq } from '../../utils';
import ms = require('ms');

export class ExploreWikiEntitiesByNames extends UseCase<string[], void, void> {
    private exploreWikiEntitiesByTitles: FindWikiEntitiesByTitles;
    private saveWikiEntities: SaveWikiEntities;
    private findWikiTitles: FindWikiTitles;

    constructor(private locale: ILocale,
        entityRep: IWikiEntityRepository,
        private wikiSearchNameRep: IWikiSearchNameRepository,
        private wikiTitleRep: IWikiTitleRepository,
        countryTags: ICountryTagsService,
        knownNames: IKnownNameService) {
        super();

        this.exploreWikiEntitiesByTitles = new FindWikiEntitiesByTitles(locale, knownNames);
        this.saveWikiEntities = new SaveWikiEntities(entityRep);
        this.findWikiTitles = new FindWikiTitles(locale, countryTags);
    }

    protected async innerExecute(names: string[]): Promise<void> {
        const lang = this.locale.lang;
        const country = this.locale.country;

        const unknownNames: string[] = []

        for (let name of names) {
            const searchName = await this.wikiSearchNameRep.getById(WikiSearchNameHelper.createId(name, lang, country));
            if (searchName && searchName.updatedAt && searchName.updatedAt * 1000 > Date.now() - ms('7days')) {
                debug(`WikiSearchName=${name} exists!`);
                return;
            }

            unknownNames.push(name);

            await this.wikiSearchNameRep.createOrUpdate(WikiSearchNameHelper.build({
                name,
                lang,
                country,
            }));
        }

        if (unknownNames.length === 0) {
            return;
        }

        let initalTitles = await this.findWikiTitles.execute(unknownNames);
        if (!initalTitles.length) {
            return;
        }

        initalTitles = uniq(initalTitles);
        const titles: string[] = [];

        for (let title of initalTitles) {
            const wikiTitle = await this.wikiTitleRep.getById(WikiTitleHelper.createId(title, lang));
            if (wikiTitle && wikiTitle.updatedAt && wikiTitle.updatedAt * 1000 > Date.now() - ms('10days')) {
                debug(`WikiTitle=${title} exists!`);
                return;
            }
            titles.push(title);
        }

        if (titles.length === 0) {
            return;
        }

        const wikiEntities = await this.exploreWikiEntitiesByTitles.execute(titles);

        if (wikiEntities.length) {
            debug(`found wiki entities for ${names[0]}==${wikiEntities.length}`);
            await this.saveWikiEntities.execute(wikiEntities);
        } else {
            debug(`Not found wiki entities for ${names[0]}`);
        }

        for (let title of titles) {
            await this.wikiTitleRep.createOrUpdate(WikiTitleHelper.create({ title, lang, }))
        }
    }
}
