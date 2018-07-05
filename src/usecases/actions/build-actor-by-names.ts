
// const debug = require('debug')('textactor-explorer');

import { IWikiEntityReadRepository } from "../../repositories/wiki-entity-repository";
import { Actor } from "../../entities/actor";
import { ActorHelper } from "../../entities/actor-helper";
import { SelectWikiEntity } from "./select-wiki-entity";
import { UseCase } from "../usecase";
import { ILocale } from "../../types";


export class BuildActorByNames extends UseCase<string[], Actor, void> {
    private selectWikiEntity: SelectWikiEntity;

    constructor(private locale: ILocale,
        wikiEntityRepository: IWikiEntityReadRepository) {
        super()

        this.selectWikiEntity = new SelectWikiEntity(locale, wikiEntityRepository);
    }

    protected async innerExecute(names: string[]): Promise<Actor> {

        const wikiEntity = await this.selectWikiEntity.execute(names);

        const actor = ActorHelper.build(this.locale, names, wikiEntity || undefined);

        return actor;
    }
}
