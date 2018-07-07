
import test from 'ava';
import { RootNameHelper } from './root-name-helper';

test('#rootName', t => {
    t.is(RootNameHelper.rootName('iPhone 5', 'ro'), 'iphone 5');
    t.is(RootNameHelper.rootName('Ana Balan', 'ro'), 'ana balan');
    t.is(RootNameHelper.rootName('Anei Balan', 'ro'), 'anei balan');
    t.is(RootNameHelper.rootName('PLDM', 'ro'), 'PLDM');
    t.is(RootNameHelper.rootName('Владимира Путина', 'ru'), 'владимира путина');
})
