
const debug = require('debug')('textactor-explorer');

import { IConceptRepository } from "../../repositories/concept-repository";
import { IWikiEntityRepository } from "../../repositories/wiki-entity-repository";
import { ConceptHelper } from '../../entities/concept-helper';
import { ConceptContainer } from "../../entities/concept-container";
import { UseCase } from "../usecase";
import { IConceptRootNameRepository } from "../../repositories/concept-root-name-repository";
import { uniq } from "../../utils";
import { RootNameHelper } from "../../entities/root-name-helper";

export class DeleteInvalidConcepts extends UseCase<void, void, void> {

    constructor(private container: ConceptContainer,
        private conceptRep: IConceptRepository,
        private rootNameRep: IConceptRootNameRepository,
        private wikiEntityRep: IWikiEntityRepository) {
        super()
    }

    protected async innerExecute(): Promise<void> {
        const lang = this.container.lang;
        const country = this.container.country;
        const containerId = this.container.id;
        const invalidNames = await this.wikiEntityRep.getInvalidPartialNames(lang);
        debug(`Deleting invalid names: ${JSON.stringify(invalidNames)}`);

        const invalidNamesIds = uniq(invalidNames.map(item => ConceptHelper.id(item, lang, country, containerId)));
        const invalidNamesRootIds = uniq(invalidNames.map(item => RootNameHelper.id(item, lang, country, containerId)));

        await this.conceptRep.deleteIds(invalidNamesIds);
        await this.conceptRep.deleteByRootNameIds(invalidNamesRootIds);
        await this.rootNameRep.deleteIds(invalidNamesRootIds);
    }
}
