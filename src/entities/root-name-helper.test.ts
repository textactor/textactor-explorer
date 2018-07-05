
import test from 'ava';
import { RootNameHelper } from './root-name-helper';

test('#rootName', t => {
    t.is(RootNameHelper.rootName('iPhone 5', 'ro'), 'iPhon 5');
    t.is(RootNameHelper.rootName('Ana Balan', 'ro'), 'An Balan');
    t.is(RootNameHelper.rootName('Anei Balan', 'ro'), 'An Balan');
    t.is(RootNameHelper.rootName('PLDM', 'ro'), 'PLDM');
    t.is(RootNameHelper.rootName('Владимира Путина', 'ru'), 'Владимир Путин');
})
