import { NameHelper } from "../name-helper";
import { md5 } from "../utils";

export type WikiSearchName = {
    id: string
    lang: string
    country: string
    name: string
    createdAt?: number
    updatedAt?: number
}

export type KnownWikiSearchNameData = {
    lang: string
    country: string
    name: string
    updatedAt?: number
}

export class WikiSearchNameHelper {
    static build(data: KnownWikiSearchNameData) {

        const name = data.name.trim();
        const lang = data.lang.trim().toLowerCase();
        const country = data.country.trim().toLowerCase();
        const id = WikiSearchNameHelper.createId(name, lang, country);

        const searchName: WikiSearchName = {
            id,
            name,
            lang,
            country,
            createdAt: Math.round(Date.now() / 1000),
            updatedAt: data.updatedAt || Math.round(Date.now() / 1000),
        };

        return searchName;
    }

    static createId(name: string, lang: string, country: string) {
        name = name.trim();
        lang = lang.trim().toLowerCase();
        country = country.trim().toLowerCase();

        const normalName = NameHelper.normalizeName(name, lang);

        if (normalName.length < 2) {
            throw new Error(`Invalid name: ${name}`);
        }

        const hash = md5(normalName);

        return [lang, country, hash].join('');
    }
}
