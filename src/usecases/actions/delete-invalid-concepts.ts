
const debug = require('debug')('textactor-explorer');

import { IConceptRepository } from "../../repositories/concept-repository";
import { IWikiEntityRepository } from "../../repositories/wiki-entity-repository";
import { ConceptHelper } from '../../entities/concept-helper';
import { ConceptContainer } from "../../entities/concept-container";
import { UseCase } from "../usecase";

export class DeleteInvalidConcepts extends UseCase<void, void, void> {

    constructor(private container: ConceptContainer,
        private conceptRep: IConceptRepository,
        private wikiEntityRep: IWikiEntityRepository) {
        super()
    }

    protected async innerExecute(): Promise<void> {
        const lang = this.container.lang;
        const country = this.container.country;
        const containerId = this.container.id;
        const invalidNames = await this.wikiEntityRep.getInvalidPartialNames(lang);
        debug(`Deleting invalid names: ${JSON.stringify(invalidNames)}`);

        const invalidNamesIds = ConceptHelper.ids(invalidNames, lang, country, containerId);
        const invalidNamesRootIds = ConceptHelper.rootIds(invalidNames, lang, country, containerId);

        await this.conceptRep.deleteIds(invalidNamesIds);
        await this.conceptRep.deleteByRootNameIds(invalidNamesRootIds);
    }
}
