
import test from 'ava';
import { NameHelper } from './name-helper';

test('#isAbbr', t => {
    t.is(NameHelper.isAbbr('ABBR'), true, 'ABBR is an abbreviation')
    t.is(NameHelper.isAbbr('aBBR'), false, 'aBBR is not an abbreviation')
    t.is(NameHelper.isAbbr('A Abbr'), false, 'A Abbr is not an abbreviation')
    t.is(NameHelper.isAbbr('A ABBR'), true, 'A ABBR is an abbreviation')
    t.is(NameHelper.isAbbr('189 & 9'), false, '189 & 9 not abbreviation')
})

test('#findAbbr', t => {
    t.is(NameHelper.findAbbr(['ABBR', 'Abbr', 'ABBR a', 'ABB', 'ABB B', 'AB', 'A.B']), 'ABB')
    t.is(NameHelper.findAbbr(['ABBR', 'Abbr', 'ABBR a', 'A', 'AB BR']), 'ABBR')
    t.is(NameHelper.findAbbr(['PD', 'PDM', 'PDRM', 'PD RM']), 'PDM')
    t.is(NameHelper.findAbbr(['US', 'USA', 'U.S', 'U.S.', 'U.S.A']), 'USA')
})

test('#endsWithNumberWord', t => {
    t.is(NameHelper.endsWithNumberWord('iPhone6'), false, 'iPhone6 is not ending with a number word')
    t.is(NameHelper.endsWithNumberWord('iPhone 6'), true, 'iPhone 6 is ending with a number word')
})

test('#removeSymbols', t => {
    t.is(NameHelper.removeSymbols('Async (node)'), 'Async node')
    t.is(NameHelper.removeSymbols('iPhone #5'), 'iPhone 5')
    t.is(NameHelper.removeSymbols('iPhone & -= &&'), 'iPhone')
    t.is(NameHelper.removeSymbols('iPhone $^@^%*#^*(#()*#_*_)(@_)(@ &+-iPad'), 'iPhone&iPad')
})

test('#formatUniqueName', t => {
    t.is(NameHelper.formatUniqueName('Async (node)', 'en'), 'async node')
    t.is(NameHelper.formatUniqueName('iPhone #5', '5'), 'iphone 5')
    t.is(NameHelper.formatUniqueName('Ștefan Trăiește', 'ro'), 'stefan traieste')
})

test('#isIrregular', t => {
    t.is(NameHelper.isIrregular('Async (node)'), false)
    t.is(NameHelper.isIrregular('iPhone alfa'), true)
    t.is(NameHelper.isIrregular('Ștefan Trăiește'), false)
})

test('#countWords', t => {
    t.is(NameHelper.countWords('Async (node)'), 2)
    t.is(NameHelper.countWords('iPhone alfa'), 2)
    t.is(NameHelper.countWords('Ștefan'), 1)
    t.is(NameHelper.countWords('iPhone 2'), 2)
    t.is(NameHelper.countWords(''), 0)
})
