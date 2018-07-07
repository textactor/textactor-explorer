
import { MemoryConceptRepository } from './memory-concept-repository';
import test from 'ava';
import { ConceptHelper } from '../../entities/concept-helper';

test('#create', async t => {
    const repository = new MemoryConceptRepository();
    const concept = ConceptHelper.build({ name: 'New York', abbr: 'NY', country: 'us', lang: 'en', containerId: '1' });

    const createdConcept = await repository.create(concept);

    await t.throws(repository.create(concept), /Item already exists/i);

    t.is(createdConcept.name, concept.name);
    t.is(createdConcept.abbr, concept.abbr);

    concept.name = 'New Name';

    t.not(createdConcept.name, concept.name);
})

test('#getById', async t => {
    const repository = new MemoryConceptRepository();
    const concept = ConceptHelper.build({ name: 'New York', abbr: 'NY', country: 'us', lang: 'en', containerId: '1' });
    await repository.create(concept);
    const concept1 = await repository.getById(concept.id);
    t.true(!!concept1);

    const concept2 = await repository.getById('fake');
    t.false(!!concept2);
})

test('#getByIds', async t => {
    const repository = new MemoryConceptRepository();
    const concept1 = ConceptHelper.build({ name: 'New York', abbr: 'NY', country: 'us', lang: 'en', containerId: '1' });
    await repository.create(concept1);
    const concept2 = ConceptHelper.build({ name: 'New York City', abbr: 'NY', country: 'us', lang: 'en', containerId: '1' });
    await repository.create(concept2);
    const concepts = await repository.getByIds([concept1.id, concept2.id]);

    t.is(concepts.length, 2);
    t.is(concepts[0].id, concept1.id);
    t.is(concepts[1].id, concept2.id);
})
