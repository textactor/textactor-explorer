
import test from 'ava';
import { ActorHelper } from './actor-helper';
import { getEntities } from 'wiki-entity';
import { ILocale } from '../types';
import { IKnownNameService } from '../services/known-names-service';
import { WikiEntityBuilder } from '../usecases/actions/wiki-entity-builder';


test('#buildNames', t => {
    const lang = 'ro';
    t.deepEqual(ActorHelper.buildNames(lang, []), [], 'Empty names');
    const names = ['Name 1'];
    const wikiNames = ['Long Name 1'];
    t.deepEqual(ActorHelper.buildNames(lang, names, wikiNames), ['Long Name 1', 'Name 1'], 'Concat names');
    t.is(names.length, 1);
});

test('#build', t => {
    const locale: ILocale = { lang: 'ro', country: 'ro' };
    let names = ['Name 1', 'Name frst'];
    let actor = ActorHelper.build(locale, names);
    t.is(actor.name, 'Name 1');
    t.is(actor.country, locale.country);
    t.is(actor.lang, locale.lang);
    t.deepEqual(actor.names, names);
    t.is(actor.wikiEntity, undefined);
});

test('#build Valeriu Munteanu ro-md', async t => {
    const locale: ILocale = { lang: 'ro', country: 'ro' };
    const title = 'Valeriu Munteanu (politician)';
    const webWikiEntity = (await getEntities({ language: locale.lang, titles: [title], redirects: true, types: true }))[0];
    const builder = new WikiEntityBuilder(locale, new KnownNamesService());
    const wikiEntity = builder.build({ wikiEntity: webWikiEntity });
    t.is(wikiEntity.name, title, 'wiki entity name===title');
    t.is(wikiEntity.wikiPageTitle, title, 'wiki entity page title===title');
    const actor = ActorHelper.build(locale, ['Valeriu Munteanu'], wikiEntity);
    t.is(actor.name, title, 'actor name===title');
    t.is(actor.commonName, 'Valeriu Munteanu');
});

test('#validate', t => {
    // t.throws(() => ActorHelper.validate(null), /null or undefined/);
    t.throws(() => ActorHelper.validate({}), /invalid lang/);
    t.throws(() => ActorHelper.validate({ name: 'n', lang: 'ro', country: 'ro' }), /invalid name:/);
    t.throws(() => ActorHelper.validate({ name: 'name', lang: 'ro', country: 'ro' }), /no names/);
    t.throws(() => ActorHelper.validate({ name: 'name', names: ['n'], lang: 'ro', country: 'ro' }), /names contains invalid names/);
});


class KnownNamesService implements IKnownNameService {
    getKnownName(_name: string, _lang: string, _country: string): { name: string; countryCodes?: string[]; } | null {
        return null;
    }
}
