
import { SimpleEntityType, SimpleEntity } from 'wiki-entity';
import { WikiEntityType, WikiEntity } from './wiki-entity';
import { partialName } from 'partial-name';
import { RootNameHelper } from './root-name-helper';
import { ConceptHelper } from './concept-helper';
import { NameHelper } from '../name-helper';
import { md5, uniq } from '../utils';

export class WikiEntityHelper {

    static getPartialName(name: string, lang: string, entityName: string): string | null {
        if (!name || NameHelper.countWords(name) < 2) {
            return null;
        }

        const exResult = /\(([^)]+)\)$/.exec(name);
        let partial: string | null = null;
        if (exResult) {
            partial = name.substr(0, exResult.index).trim();
            if (NameHelper.countWords(partial) < 2) {
                partial = null;
            }
        }

        if (!partial) {
            partial = partialName(name, { lang });
            if (partial && NameHelper.countWords(partial) < 2) {
                partial = null;
            }
        }

        if (partial) {
            const partialWords = partial.split(/\s+/g);
            const entityNameWords = entityName.split(/\s+/g);
            if (partialWords.length >= entityNameWords.length) {
                return partial;
            }
            const partialFirstWord = NameHelper.atonic(partial.split(/\s+/)[0].toLowerCase());
            const entityNameFirstWord = NameHelper.atonic(entityName.split(/\s+/)[0].toLowerCase());

            if (partialFirstWord !== entityNameFirstWord) {
                return null;
            }
        }

        return partial;
    }

    static getName(entity: SimpleEntity): string {
        if (!entity.wikiPageTitle) {
            throw new Error(`wikiPageTitle is required!`);
        }
        return entity.wikiPageTitle as string;
    }

    static isValidName(name: string | null | undefined, lang: string) {
        return ConceptHelper.isValidName(name, lang);
    }

    static nameHash(name: string, lang: string) {
        lang = lang.trim().toLowerCase();

        name = name.trim();
        name = NameHelper.normalizeName(name, lang);
        name = NameHelper.atonic(name);

        return md5([lang, name].join('_'));
    }

    static namesHashes(names: string[], lang: string) {
        names = names.filter(name => WikiEntityHelper.isValidName(name, lang));
        const hashes = uniq(names.map(name => WikiEntityHelper.nameHash(name, lang)));

        return hashes;
    }

    static rootName(name: string, lang: string) {
        return RootNameHelper.rootName(name, lang);
    }

    static rootNameHash(name: string, lang: string) {
        return WikiEntityHelper.nameHash(WikiEntityHelper.rootName(name, lang), lang);
    }

    static convertSimpleEntityType(type: SimpleEntityType): WikiEntityType {
        switch (type) {
            case SimpleEntityType.EVENT: return WikiEntityType.EVENT;
            case SimpleEntityType.ORG: return WikiEntityType.ORG;
            case SimpleEntityType.PERSON: return WikiEntityType.PERSON;
            case SimpleEntityType.PLACE: return WikiEntityType.PLACE;
            case SimpleEntityType.PRODUCT: return WikiEntityType.PRODUCT;
            case SimpleEntityType.WORK: return WikiEntityType.WORK;
        }
    }

    static splitName(name: string): { simple: string, special: string } | null {
        const firstIndex = name.indexOf('(');
        if (firstIndex < 3) {
            return null;
        }
        const lastIndex = name.indexOf(')');
        if (lastIndex !== name.length - 1) {
            return null;
        }

        return {
            simple: name.substr(0, firstIndex).trim(),
            special: name.substring(firstIndex + 1, lastIndex)
        }
    }

    static getSimpleName(name: string): string | undefined {
        const splitName = WikiEntityHelper.splitName(name);
        if (splitName) {
            return splitName.simple;
        }
    }

    static isDisambiguation(entity: WikiEntity) {
        return entity && entity.data && entity.data.P31 && entity.data.P31.indexOf('Q4167410') > -1;
    }

    static getPopularity(rank: number): EntityPopularity {
        if (!rank || rank < 0) {
            return EntityPopularity.UNKNOWN;
        }
        const r = rank / 10;
        if (r < 2) {
            return EntityPopularity.UNKNOWN;
        }
        if (r < 4) {
            return EntityPopularity.LOW;
        }
        if (r < 6) {
            return EntityPopularity.NORMAL;
        }
        if (r < 9) {
            return EntityPopularity.HIGH;
        }

        return EntityPopularity.POPULAR;
    }

    static isNotActual(entity: WikiEntity): boolean | undefined {
        if (!entity.data) {
            return undefined;
        }
        const notActualProps = ['P457', 'P20', 'P576'];
        const props = Object.keys(entity.data);
        for (let prop of notActualProps) {
            if (~props.indexOf(prop)) {
                return true;
            }
        }

        return undefined;
    }
}

export enum EntityPopularity {
    UNKNOWN = 1,
    LOW = 2,
    NORMAL = 3,
    HIGH = 4,
    POPULAR = 5,
}
