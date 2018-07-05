
import test from 'ava';
import { ConceptHelper } from './concept-helper';
import { NameHelper } from '../name-helper';

test('#nameHash', t => {
    let hash1 = ConceptHelper.nameHash('text 1', 'en', 'us', '1');
    let hash2 = ConceptHelper.nameHash('text 2', 'en', 'us', '1');
    t.not(hash1, hash2)

    hash1 = ConceptHelper.nameHash('text 1', 'en', 'us', '1');
    hash2 = ConceptHelper.nameHash('text 1', 'en', 'gb', '1');
    t.not(hash1, hash2)

    hash1 = ConceptHelper.nameHash('text 1', 'en', 'us', '1');
    hash2 = ConceptHelper.nameHash('text 1', 'en', 'us', '1');
    t.is(hash1, hash2)
})

test('#normalizeName', t => {
    t.is(NameHelper.normalizeName('iPhone 5', 'en'), 'iphone 5');
    t.is(NameHelper.normalizeName('iPHone 5', 'en'), 'iphone 5');
    t.is(NameHelper.normalizeName('PLDM', 'ro'), 'PLDM');
    t.is(NameHelper.normalizeName('Chișinău', 'ro'), 'chișinău');
})

test('#create', t => {
    const c1 = ConceptHelper.build({ name: 'Moldova 1', lang: 'ro', country: 'md', abbr: 'M1', containerId: '1' });
    t.is(c1.name, 'Moldova 1')
    t.is(c1.lang, 'ro')
    t.is(c1.country, 'md')
    t.is(c1.abbr, 'M1')
    t.is(c1.countWords, 2)
    t.is(c1.isAbbr, false)
    t.is(c1.isIrregular, false)
})
