
const debug = require('debug')('textactor-explorer');

import { IWikiEntityRepository } from '../../repositories/wiki-entity-repository';
import { Actor } from '../../entities/actor';
import { INamesEnumerator } from '../../services/names-enumerator';
import { BuildActorByNames } from './build-actor-by-names';
import { UseCase, IUseCase } from '../usecase';
import { ILocale } from '../../types';

export interface OnGenerateActorCallback {
    (actor: Actor): Promise<any>
}

export class GenerateActors extends UseCase<OnGenerateActorCallback, void, void> {
    private buildActor: BuildActorByNames

    constructor(locale: ILocale,
        private namesEnumerator: INamesEnumerator,
        private postNamesProcess: IUseCase<string[], void, void>,
        wikiEntityRep: IWikiEntityRepository) {
        super()

        this.buildActor = new BuildActorByNames(locale, wikiEntityRep);
    }

    protected async innerExecute(callback: OnGenerateActorCallback): Promise<void> {
        let actor: Actor;

        while (!this.namesEnumerator.atEnd()) {
            try {
                const names = await this.namesEnumerator.next();
                if (!names || !names.length) {
                    debug(`GenerateActors: no names!`);
                    continue;
                }

                actor = await this.buildActor.execute(names);
                if (this.postNamesProcess) {
                    await this.postNamesProcess.execute(names);
                }
                if (actor) {
                    if (this.postNamesProcess) {
                        await this.postNamesProcess.execute(actor.names);
                    }
                }
            } catch (e) {
                return Promise.reject(e);
            }

            if (callback && actor) {
                await callback(actor);
            }
        }
    }
}
