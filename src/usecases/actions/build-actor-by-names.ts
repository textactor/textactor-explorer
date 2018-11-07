
// const debug = require('debug')('textactor-explorer');

import { IWikiEntityReadRepository } from "../../repositories/wiki-entity-repository";
import { Actor } from "../../entities/actor";
import { ActorHelper } from "../../entities/actor-helper";
import { SelectWikiEntity } from "./select-wiki-entity";
import { UseCase } from "../usecase";
import { ILocale } from "../../types";
import { ActorNameCollection } from "../../entities/actor-name-collection";


export class BuildActorByNames extends UseCase<ActorNameCollection, Actor, void> {
    private selectWikiEntity: SelectWikiEntity;

    constructor(private locale: ILocale,
        wikiEntityRepository: IWikiEntityReadRepository) {
        super()

        this.selectWikiEntity = new SelectWikiEntity(locale, wikiEntityRepository);
    }

    protected async innerExecute(names: ActorNameCollection): Promise<Actor> {

        const wikiEntity = await this.selectWikiEntity.execute(names.nameList());

        const actor = ActorHelper.build(this.locale, names, wikiEntity || undefined);

        return actor;
    }
}
