
import { BuildActor } from './build-actor';
import test from 'ava';
import { ExploreWikiEntities } from './explore-wiki-entities';
import { ConceptContainer, ConceptContainerStatus } from '../../entities/concept-container';
import { PopularConceptNamesEnumerator } from '../../services/popular-concept-names-enumerator';
import { ILocale } from '../../types';
import { MemoryWikiEntityRepository } from '../../repositories/test/memory-wiki-entity-repository';
import { MemoryConceptRepository } from '../../repositories/test/memory-concept-repository';
import { MemoryRootNameRepository } from '../../repositories/test/memory-root-name-repository';
import { PushContextConcepts } from './push-context-concepts';
import { ConceptHelper } from '../../entities/concept-helper';
import { MemoryWikiTitleRepository } from '../../repositories/test/memory-wiki-title-repository';
import { MemoryWikiSearchNameRepository } from '../../repositories/test/memory-wiki-search-name-repository';
import { WikiEntityHelper } from '../../entities/wiki-entity-helper';
import { ICountryTagsService } from './find-wiki-titles';
import { IKnownNameService } from '../../services/known-names-service';

test('ro-md: partial name: Biblioteca Națională', async t => {
    const locale: ILocale = { lang: 'ro', country: 'md' };

    const entityRep = new MemoryWikiEntityRepository();
    const conceptRep = new MemoryConceptRepository();
    const rootConceptRep = new MemoryRootNameRepository();
    const pushConcepts = new PushContextConcepts(conceptRep, rootConceptRep);
    const container: ConceptContainer = {
        id: '1',
        ...locale,
        name: 'test',
        uniqueName: 'test',
        ownerId: 'test',
        status: ConceptContainerStatus.NEW,
    };
    const popularNamesEnumerator = new PopularConceptNamesEnumerator({ rootNames: true }, container, conceptRep, rootConceptRep);

    const bibliotecaNationala = ConceptHelper.build({ lang: locale.lang, country: locale.country, name: 'Biblioteca Națională', containerId: container.id });

    await pushConcepts.execute([bibliotecaNationala]);

    const exploreEntities = new ExploreWikiEntities(container, popularNamesEnumerator, entityRep,
        new MemoryWikiSearchNameRepository(), new MemoryWikiTitleRepository(), new CountryTags(), new KnownNamesService());

    await exploreEntities.execute(undefined);

    const exploredEntities = await entityRep
        .getByNameHash(WikiEntityHelper.nameHash('Biblioteca Națională a Republicii Moldova', locale.lang));

    t.is(exploredEntities.length, 1, 'Explored `Biblioteca Națională a Republicii Moldova`');

    const buildActor = new BuildActor(container, entityRep, conceptRep);

    const actor = await buildActor.execute(bibliotecaNationala.rootNameIds[0]);

    t.is(!!actor, true, 'Actor exists');

    t.is(actor && actor.name, 'Biblioteca Națională a Republicii Moldova');
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
        return [];
    }
}

class KnownNamesService implements IKnownNameService {
    getKnownName(_name: string, _lang: string, _country: string): { name: string; countryCodes?: string[]; } | null {
        return null;
    }
}
