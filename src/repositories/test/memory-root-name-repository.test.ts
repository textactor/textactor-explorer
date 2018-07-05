
import test from 'ava';
import { MemoryRootNameRepository } from './memory-root-name-repository';
import { RootNameHelper } from '../../entities/root-name-helper';

test('#create', async t => {
    const repository = new MemoryRootNameRepository();
    const rootName = RootNameHelper.build({ name: 'New York', country: 'us', lang: 'en', containerId: '1' });

    const createdConcept = await repository.create(rootName);

    await t.throws(repository.create(rootName), /Item already exists/i);

    t.is(createdConcept.name, rootName.name);

    rootName.name = 'New Name';

    t.not(createdConcept.name, rootName.name);
})

test('#getById', async t => {
    const repository = new MemoryRootNameRepository();
    const rootName = RootNameHelper.build({ name: 'New York', country: 'us', lang: 'en', containerId: '1' });
    await repository.create(rootName);
    const concept1 = await repository.getById(rootName.id);
    t.true(!!concept1);

    const concept2 = await repository.getById('fake');
    t.false(!!concept2);
})

test('#getByIds', async t => {
    const repository = new MemoryRootNameRepository();
    const concept1 = RootNameHelper.build({ name: 'New York', country: 'us', lang: 'en', containerId: '1' });
    await repository.create(concept1);
    const concept2 = RootNameHelper.build({ name: 'New York City', country: 'us', lang: 'en', containerId: '1' });
    await repository.create(concept2);
    const concepts = await repository.getByIds([concept1.id, concept2.id]);

    t.is(concepts.length, 2);
    t.is(concepts[0].id, concept1.id);
    t.is(concepts[1].id, concept2.id);
})

test('#getPopularRootNameHashes', async t => {
    const repository = new MemoryRootNameRepository();

    const concept1 = RootNameHelper.build({ name: 'Владимир Путин', country: 'ru', lang: 'ru', containerId: '1' });
    await repository.createOrUpdate(concept1);

    const concept2 = RootNameHelper.build({ name: 'Владимира Путина', country: 'ru', lang: 'ru', containerId: '1' });
    await repository.createOrUpdate(concept2);

    const concept3 = RootNameHelper.build({ name: 'Виктор Зубков', country: 'ru', lang: 'ru', containerId: '1' });
    await repository.createOrUpdate(concept3);

    const popularIds = await repository.getMostPopularIds('1', 2, 0);
    const popularRootNames = await repository.getByIds(popularIds);

    t.is(popularRootNames.length, 2);
    t.is(popularRootNames[0].popularity, 2);
    t.is(popularRootNames[1].popularity, 1);
})


test('#deleteUnpopular', async t => {
    const repository = new MemoryRootNameRepository();

    const concept1 = RootNameHelper.build({ name: 'Владимир Путин', country: 'ru', lang: 'ru', containerId: '1' });
    await repository.createOrUpdate(concept1);
    await repository.createOrUpdate(concept1);

    const concept2 = RootNameHelper.build({ name: 'Владимира Путина', country: 'ru', lang: 'ru', containerId: '1' });
    await repository.createOrUpdate(concept2);

    const concept3 = RootNameHelper.build({ name: 'Виктор Зубков', country: 'ru', lang: 'ru', containerId: '1' });
    await repository.createOrUpdate(concept3);

    await repository.deleteUnpopular('1', 1);

    const popularIds = await repository.getMostPopularIds('1', 2, 0);
    const popularRootNames = await repository.getByIds(popularIds);

    t.is(popularRootNames.length, 1);
    t.is(popularRootNames[0].popularity, 3);
})
