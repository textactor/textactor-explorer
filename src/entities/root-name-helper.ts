
import formatRootName from 'root-name';
import { RootName } from './root-name';
import { NameHelper } from '../name-helper';
import { md5, uniq } from '../utils';

export type KnownRootNameData = {
    lang: string
    country: string
    name: string
    containerId: string
}

export class RootNameHelper {

    static build(data: KnownRootNameData): RootName {

        const lang = data.lang.trim().toLowerCase();
        const country = data.country.trim().toLowerCase();
        const name = data.name.trim();
        const containerId = data.containerId.trim();

        const id = RootNameHelper.id(name, lang, country, containerId);

        const isAbbr = NameHelper.isAbbr(name);
        const countWords = NameHelper.countWords(name);

        const rootName = RootNameHelper.rootName(name, lang);

        const popularity = 1;

        const concept: RootName = {
            id,
            country,
            lang,
            containerId,
            name,
            isAbbr,
            countWords,
            rootName,
            popularity,
        };

        return concept;
    }

    public static rootName(name: string, lang: string) {
        lang = lang.trim();
        name = name.trim();

        const isAbbr = NameHelper.isAbbr(name);

        if (isAbbr) {
            return name;
        }

        if (NameHelper.countWords(name) < 2) {
            if (name.length < 7) {
                return name;
            }
            return formatRootName(name, lang, { accuracy: 2 });
        }

        return formatRootName(name, lang);
    }

    public static id(name: string, lang: string, country: string, containerId: string) {
        name = RootNameHelper.rootName(name, lang);
        name = NameHelper.normalizeName(name, lang);
        name = NameHelper.atonic(name);

        return md5([lang.trim().toLowerCase(), country.trim().toLowerCase(), containerId.trim(), name.trim()].join('_'));
    }

    static ids(names: (string | undefined | null)[], lang: string, country: string, containerId: string) {
        const filteredNames = names.filter(name => name && name.trim().length > 1) as string[];
        return uniq(filteredNames.map(name => RootNameHelper.id(name, lang, country, containerId)));
    }
}
