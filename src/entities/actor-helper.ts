
import { WikiEntity } from "./wiki-entity";
import { Actor } from "./actor";
import { ConceptHelper } from "./concept-helper";
import { ILocale } from "../types";
import { uniq } from "../utils";
import { NameHelper } from "../name-helper";

export class ActorHelper {
    static build(locale: ILocale, names: string[], wikiEntity?: WikiEntity): Actor {

        const lang = locale.lang.trim().toLowerCase();
        const country = locale.country.trim().toLowerCase();
        const initialNames = names;
        names = ActorHelper.buildNames(lang, names, wikiEntity && wikiEntity.names);

        // if (wikiEntity && wikiEntity.countryCodes && wikiEntity.countryCodes.indexOf(country) > -1) {
        //     names = names.concat(wikiEntity.partialNames || []);
        // }

        // names = uniq(names).filter(name => ConceptHelper.isValidName(name, lang));

        if (!names.length) {
            throw new Error(`Invalid ConceptActor: no names!`);
        }

        const name = wikiEntity && wikiEntity.name || names[0];

        const actor: Actor = {
            lang,
            country,
            name,
            wikiEntity,
            names,
        };

        if (wikiEntity && !ActorHelper.isValidCommonName(name)) {
            const wikiNames = wikiEntity.names;
            if (wikiEntity.simpleName && NameHelper.countWords(wikiEntity.simpleName) > 1) {
                wikiNames.push(wikiEntity.simpleName);
            }
            const commonNames = wikiNames.reduce<string[]>((result, name) => {
                initialNames.forEach(sameName => {
                    if (name === sameName && ActorHelper.isValidCommonName(sameName)) {
                        result.push(name);
                    }
                });
                return result;
            }, []);

            if (commonNames.length) {
                actor.commonName = commonNames[0];
            }
        }

        return actor;
    }

    static buildNames(lang: string, names: string[], entityNames?: string[]) {
        names = (entityNames || []).concat(names || []);
        names = names.filter(name => ConceptHelper.isValidName(name, lang));
        return uniq(names);
    }

    static validate(entity: Partial<Actor>) {
        if (!entity) {
            throw new Error(`Invalid ConceptActor: null or undefined`);
        }
        if (!entity.lang) {
            throw new Error(`Invalid ConceptActor: invalid lang`);
        }
        if (!entity.country) {
            throw new Error(`Invalid ConceptActor: invalid country`);
        }
        if (!ConceptHelper.isValidName(entity.name, entity.lang)) {
            throw new Error(`Invalid ConceptActor: invalid name: ${entity.name}`);
        }
        if (!entity.names || !entity.names.length) {
            throw new Error(`Invalid ConceptActor: no names`);
        }
        const invalidName = entity.names.find(item => !ConceptHelper.isValidName(item, entity.lang as string));
        if (invalidName) {
            throw new Error(`Invalid ConceptActor: names contains invalid names: ${invalidName}`);
        }
    }

    static isValidCommonName(name: string) {
        return !/[,(‒–—―«»"“”‘’;:]/.test(name);
    }
}
