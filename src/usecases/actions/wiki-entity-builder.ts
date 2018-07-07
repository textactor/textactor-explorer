
const debug = require('debug')('textactor-explorer');

import { WikiEntity } from "../../entities/wiki-entity";
import { IKnownNameService } from "../../services/known-names-service";
import { WikiEntity as ExternWikiEntity, convertToSimpleEntity } from 'wiki-entity';
import { WikiEntityHelper } from "../../entities/wiki-entity-helper";
import textCountry from 'text-country';
import { RootNameHelper } from "../../entities/root-name-helper";
import { ILocale } from "../../types";
import { uniq, filterStrings } from "../../utils";
import { NameHelper } from "../../name-helper";

export type WikiEntityBuilderData = {
    wikiEntity: ExternWikiEntity
}

export interface IWikiEntityBuilder {
    build(data: WikiEntityBuilderData): WikiEntity
}

export class WikiEntityBuilder implements IWikiEntityBuilder {
    constructor(private locale: ILocale, private knownNamesService: IKnownNameService) { }

    build({ wikiEntity }: WikiEntityBuilderData): WikiEntity {
        const lang = this.locale.lang.trim().toLowerCase();
        const country = this.locale.country.trim().toLowerCase();
        const simpleEntity = convertToSimpleEntity(wikiEntity, lang);
        const name = WikiEntityHelper.getName(simpleEntity);

        if (!name) {
            throw new Error(`Entity has no name! ${simpleEntity.wikiDataId}`);
        }

        const entity: WikiEntity = {
            id: `${lang.trim().toUpperCase()}${simpleEntity.wikiDataId}`,
            name: name,
            names: [],
            namesHashes: [],
            partialNames: [],
            partialNamesHashes: [],
            // nameHash: WikiEntityHelper.nameHash(name, lang),
            lang: lang,
            description: simpleEntity.description,
            aliases: uniq(wikiEntity.aliases || []),
            about: simpleEntity.about,
            wikiDataId: simpleEntity.wikiDataId as string,
            wikiPageId: simpleEntity.wikiPageId as number,
            wikiPageTitle: simpleEntity.wikiPageTitle as string,
            types: simpleEntity.types,
            countryCodes: simpleEntity.countryCodes || [],
            data: simpleEntity.data,
            categories: simpleEntity.categories,
            rank: 1,
            secondaryNames: [],
            links: {},
        };

        if (!entity.countryCodes.length) {
            const code = getCountryByTitle(filterStrings([entity.wikiPageTitle, entity.name]), lang);
            if (code) {
                entity.countryCodes = [code];
            }
        }

        const knownName = this.knownNamesService.getKnownName(name, lang, country);
        if (knownName && knownName.countryCodes) {
            debug(`Adding countryCodes for a known name: ${name}`);
            entity.countryCodes = uniq((entity.countryCodes || []).concat(knownName.countryCodes));
        }

        if (simpleEntity.type) {
            entity.type = WikiEntityHelper.convertSimpleEntityType(simpleEntity.type);
        }

        if (simpleEntity.abbr) {
            entity.abbr = simpleEntity.abbr;
        }

        entity.rank += entity.aliases.length;
        if (wikiEntity.sitelinks) {
            entity.rank += Object.keys(wikiEntity.sitelinks).length * 5;
            entity.links = wikiEntity.sitelinks;
        }
        if (entity.data) {
            entity.rank += Object.keys(entity.data).length;
        }

        let splittedName = WikiEntityHelper.splitName(entity.name);
        if (splittedName) {
            entity.specialName = splittedName.special;
            entity.simpleName = splittedName.simple;
        } else if (entity.wikiPageTitle) {
            splittedName = WikiEntityHelper.splitName(entity.wikiPageTitle);
            if (splittedName) {
                entity.specialName = splittedName.special;
                entity.simpleName = splittedName.simple;
            }
        }

        entity.names = [entity.name, entity.wikiPageTitle]
            .filter(name => WikiEntityHelper.isValidName(name, lang)) as string[];

        if (wikiEntity.redirects && wikiEntity.redirects.length) {
            entity.names = entity.names.concat(wikiEntity.redirects);
            if (!entity.abbr) {
                const abbr = NameHelper.findAbbr(wikiEntity.redirects);
                if (abbr) {
                    entity.abbr = abbr;
                }
            }
        }

        entity.names = entity.names.map(name => NameHelper.standardText(name, lang));
        entity.names = entity.names.filter(name => WikiEntityHelper.isValidName(name, lang));
        entity.names = uniq(entity.names);

        entity.names.forEach(name => {
            let nname = WikiEntityHelper.rootName(name, lang);
            if (entity.names.indexOf(nname) < 0 && WikiEntityHelper.isValidName(nname, lang)) {
                entity.secondaryNames.push(nname);
            }
        });

        entity.namesHashes = WikiEntityHelper.namesHashes(entity.names.concat(entity.secondaryNames), lang);

        let partialNames = entity.names.map(name => WikiEntityHelper.getPartialName(name, lang, entity.name))
            .filter(name => name && NameHelper.countWords(name) > 1 && entity.names.indexOf(name) < 0) as string[];

        partialNames = uniq(partialNames);
        if (partialNames.length) {
            entity.partialNames = partialNames;

            entity.partialNamesHashes = WikiEntityHelper.namesHashes(entity.partialNames, lang);

            const partialNamesRoot = partialNames.map(name => RootNameHelper.rootName(name, lang));
            const partialNamesRootHashes = WikiEntityHelper.namesHashes(partialNamesRoot, lang);

            entity.partialNamesHashes = uniq(entity.partialNamesHashes.concat(partialNamesRootHashes));
        }

        for (let name of Object.keys(entity)) {
            if (~[null, undefined, ''].indexOf((<any>entity)[name])) {
                delete (<any>entity)[name];
            }
        }

        return entity;
    }
}

function getCountryByTitle(titles: string[], lang: string): string | null {
    const title = titles.filter(item => !!item).join('; ');
    const result = textCountry(title, lang);
    if (result && result.length) {
        return result[0].country.trim().toLowerCase();
    }
    return null;
}
