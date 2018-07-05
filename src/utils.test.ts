
import test from 'ava';
import { unixTimestamp } from './utils';

test('unixTimestamp', t => {
    t.is(unixTimestamp(), Math.round(Date.now() / 1000));
})
