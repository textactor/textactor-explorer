
import { Concept } from './concept';
import { RootNameHelper } from './root-name-helper';
import { NameHelper } from '../name-helper';
import { md5, uniq, filterStrings } from '../utils';

export type KnownConceptData = {
    lang: string
    country: string
    name: string
    containerId: string
    abbr?: string
    knownName?: string
    context?: string
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
        const rootNameIds = RootNameHelper.ids([data.knownName, name], lang, country, containerId);

        const popularity = 1;

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

    public static getConceptsNames(concepts: Concept[], rootNames: boolean): string[] {
        if (concepts.length === 0) {
            return [];
        }
        const { lang } = concepts[0];
        let conceptNames = filterStrings(concepts.map(item => item.knownName));
        conceptNames = conceptNames.concat(concepts.map(item => item.name));

        conceptNames = conceptNames.filter(name => ConceptHelper.isValidName(name, lang));

        if (rootNames) {
            conceptNames = conceptNames.concat(conceptNames.map(name => RootNameHelper.rootName(name, lang)));
            conceptNames = conceptNames.filter(name => ConceptHelper.isValidName(name, lang));
        }

        conceptNames = uniq(conceptNames);

        return conceptNames;
    }

    static isValidName(name: string | null | undefined, lang: string): boolean {
        return typeof name === 'string' && name.trim().length > 1 && NameHelper.normalizeName(name, lang).length > 1;
    }

    static isValid(concept: Concept) {
        return ConceptHelper.isValidName(concept.name, concept.lang);
    }
}
