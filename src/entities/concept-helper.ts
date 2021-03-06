
import { Concept } from './concept';
import { NameHelper } from '../name-helper';
import { md5, uniq } from '../utils';
import { ActorNameCollection } from './actor-name-collection';

export type KnownConceptData = {
    lang: string
    country: string
    name: string
    containerId: string
    abbr?: string
    knownName?: string
    context?: string
    popularity?: number
}

export class ConceptHelper {

    static build(data: KnownConceptData): Concept {

        const lang = data.lang.trim().toLowerCase();
        const country = data.country.trim().toLowerCase();
        const containerId = data.containerId.trim();
        const name = data.name.trim();
        const nameLength = name.length;

        const normalName = NameHelper.normalizeName(name, lang);
        const id = ConceptHelper.id(normalName, lang, country, containerId);

        const isAbbr = NameHelper.isAbbr(name);
        const countWords = NameHelper.countWords(name);
        const isIrregular = NameHelper.isIrregular(name);
        const endsWithNumber = NameHelper.endsWithNumberWord(name);
        const rootNameIds = ConceptHelper.rootIds([data.knownName, name], lang, country, containerId);

        const popularity = data.popularity || 1;

        const concept: Concept = {
            id,
            country,
            lang,
            containerId,
            name,
            nameLength,
            isAbbr,
            countWords,
            isIrregular,
            endsWithNumber,
            abbr: data.abbr,
            rootNameIds,
            popularity,
            context: data.context,
        };

        if (data.knownName && ConceptHelper.isValidName(data.knownName, lang)) {
            concept.knownName = data.knownName.trim();
        }

        return concept;
    }

    public static nameHash(name: string, lang: string, country: string, containerId: string) {
        name = name.trim();
        name = NameHelper.normalizeName(name, lang);
        name = NameHelper.atonic(name);

        return ConceptHelper.hash(name, lang, country, containerId);
    }

    public static hash(name: string, lang: string, country: string, containerId: string) {
        return md5([lang.trim().toLowerCase(), country.trim().toLowerCase(), containerId.trim(), name.trim()].join('_'))
    }

    public static id(name: string, lang: string, country: string, containerId: string) {
        name = NameHelper.normalizeName(name, lang);
        return ConceptHelper.hash(name, lang, country, containerId);
    }

    public static ids(names: string[], lang: string, country: string, containerId: string) {
        return uniq(names.map(name => ConceptHelper.id(name, lang, country, containerId)));
    }

    public static rootName(name: string, lang: string) {
        lang = lang.trim();
        name = name.trim();

        name = NameHelper.normalizeName(name, lang);
        name = NameHelper.atonic(name);

        return name;
    }

    public static rootId(name: string, lang: string, country: string, containerId: string) {
        name = ConceptHelper.rootName(name, lang);

        return ConceptHelper.id(name, lang, country, containerId);
    }

    static rootIds(names: (string | undefined | null)[], lang: string, country: string, containerId: string) {
        const filteredNames = names.filter(name => name && name.trim().length > 1) as string[];
        return uniq(filteredNames.map(name => ConceptHelper.rootId(name, lang, country, containerId)));
    }

    public static setRootIds(concept: Concept) {
        concept.rootNameIds = uniq(concept.rootNameIds.concat(ConceptHelper.rootIds([concept.knownName, concept.name], concept.lang, concept.country, concept.containerId)));
    }

    public static getConceptsNames(concepts: Concept[]) {
        if (concepts.length === 0) {
            throw new Error(`No concepts!`);
        }
        const { lang } = concepts[0];
        concepts = concepts.sort((a, b) => b.popularity - a.popularity);

        return ActorNameCollection.fromConcepts(lang, concepts);
    }

    static isValidName(name: string | null | undefined, lang: string): boolean {
        return typeof name === 'string' && name.trim().length > 1 && NameHelper.normalizeName(name, lang).length > 1;
    }

    static isValid(concept: Concept) {
        return ConceptHelper.isValidName(concept.name, concept.lang);
    }
}
