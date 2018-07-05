
const debug = require('debug')('textactor-explorer');

import { ILocale } from "../../types";
import { WikiEntity } from "../../entities/wiki-entity";
import { getEntities, WikiEntitiesParams, WikiEntity as ExternWikiEntity } from 'wiki-entity';
import { WikiEntityHelper } from "../../entities/wiki-entity-helper";
import { isTimeoutError, delay } from "../../utils";
import { IKnownNameService } from "../../services/known-names-service";
import { IWikiEntityBuilder, WikiEntityBuilder } from "./wiki-entity-builder";
import { UseCase } from "../usecase";

export class FindWikiEntitiesByTitles extends UseCase<string[], WikiEntity[], null> {
    private wikiEntityBuilder: IWikiEntityBuilder

    constructor(private locale: ILocale, knownNames: IKnownNameService) {
        super()
        this.wikiEntityBuilder = new WikiEntityBuilder(locale, knownNames);
    }

    protected async innerExecute(titles: string[]): Promise<WikiEntity[]> {

        debug(`exploring wiki entities for ${titles.join('|')}`);

        const findOptions: WikiEntitiesParams = {
            titles: titles,
            claims: 'item',
            categories: true,
            extract: 3,
            language: this.locale.lang,
            redirects: true,
            types: true,
        };

        let wikiEntities: ExternWikiEntity[] = [];
        try {
            wikiEntities = await getEntities(findOptions);
        } catch (e) {
            if (isTimeoutError(e)) {
                debug(`ETIMEDOUT retring after 3 sec...`);
                await delay(1000 * 3);
                wikiEntities = await getEntities(findOptions);
            }
        }
        wikiEntities = wikiEntities || [];
        wikiEntities = wikiEntities.filter(item => !!item);

        if (wikiEntities.length === 0) {
            debug(`NO wiki entities found for ${titles.join('|')}`);
            return []
        } else {
            debug(`Found wiki entities for ${titles.join('|')}: ${wikiEntities.map(item => item.label)}`);
        }

        let entities = wikiEntities.map(wikiEntity => this.wikiEntityBuilder.build({ wikiEntity }));

        entities = entities.filter(item => !WikiEntityHelper.isDisambiguation(item));

        return entities;
    }
}
