
import test from 'ava';
import { MemoryConceptRepository } from '../../repositories/test/memory-concept-repository';
import { MemoryWikiEntityRepository } from '../../repositories/test/memory-wiki-entity-repository';
import { ILocale } from '../../types';
import { ExploreWikiEntities } from './explore-wiki-entities';
import { ConceptHelper } from '../../entities/concept-helper';
import { PushContextConcepts } from './push-context-concepts';
import { MemoryWikiSearchNameRepository } from '../../repositories/test/memory-wiki-search-name-repository';
import { MemoryWikiTitleRepository } from '../../repositories/test/memory-wiki-title-repository';
import { MemoryRootNameRepository } from '../../repositories//test/memory-root-name-repository';
import { ICountryTagsService } from './find-wiki-titles';
import { ConceptContainer, ConceptContainerStatus } from '../../entities/concept-container';
import { PopularConceptNamesEnumerator } from '../../services/popular-concept-names-enumerator';
import { IKnownNameService } from '../../services/known-names-service';

test('ro-md', async t => {
    const conceptRepository = new MemoryConceptRepository();
    const wikiEntityRepository = new MemoryWikiEntityRepository();
    const wikiSearchNameRepository = new MemoryWikiSearchNameRepository();
    const wikiTitleRepository = new MemoryWikiTitleRepository();
    const rootNameRep = new MemoryRootNameRepository();
    const pushConcepts = new PushContextConcepts(conceptRepository, rootNameRep);
    const locale: ILocale = { lang: 'ro', country: 'md' };
    const container: ConceptContainer = {
        id: '1',
        ...locale,
        name: 'test',
        uniqueName: 'test',
        ownerId: 'test',
        status: ConceptContainerStatus.NEW,
    };
    const namesEnumerator = new PopularConceptNamesEnumerator({ rootNames: true }, container, conceptRepository, rootNameRep);
    const exploreWikiEntities = new ExploreWikiEntities(container,
        namesEnumerator,
        wikiEntityRepository,
        wikiSearchNameRepository,
        wikiTitleRepository,
        new CountryTags(),
        new KnownNamesService());

    const conceptTexts: string[] = ['R. Moldova', 'Chișinău', 'Chisinau', 'Republica Moldova', 'Moldova', 'Chisinau'];

    const concepts = conceptTexts
        .map(name => ConceptHelper.build({ name, containerId: container.id, ...locale }));

    await pushConcepts.execute(concepts);

    t.is(await wikiEntityRepository.count(), 0, 'no wiki entities in DB');

    await exploreWikiEntities.execute(undefined);

    let countEntities = await wikiEntityRepository.count();

    t.log(`count entities=${countEntities}`);

    t.true(countEntities > 0, 'many wiki entities in DB');
});

class CountryTags implements ICountryTagsService {
    getTags(country: string, lang: string): string[] {

        const LOCALE_COUNTRY_TAGS: { [country: string]: { [lang: string]: string[] } } = {
            md: {
                ro: ['republica moldova', 'moldova'],
            },
            ro: {
                ro: ['românia', 'româniei'],
            },
            ru: {
                ru: ['Россия', 'РФ', 'России', 'Российской'],
            },
        }

        if (LOCALE_COUNTRY_TAGS[country]) {
            return LOCALE_COUNTRY_TAGS[country][lang];
        }

        return []
    }
}

class KnownNamesService implements IKnownNameService {
    getKnownName(_name: string, _lang: string, _country: string): { name: string; countryCodes?: string[]; }|null {
        return null;
    }
}
