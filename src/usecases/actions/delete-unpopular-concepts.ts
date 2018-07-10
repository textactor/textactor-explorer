
const debug = require('debug')('textactor-explorer');

import { IConceptRepository } from "../../repositories/concept-repository";
import { ConceptContainer } from "../../entities/concept-container";
import { UseCase } from "../usecase";

export interface DeleteUnpopularConceptsOptions {
    minConceptPopularity: number
    minAbbrConceptPopularity: number
    minOneWordConceptPopularity: number

    minRootConceptPopularity: number
    minRootAbbrConceptPopularity: number
    minRootOneWordConceptPopularity: number
}

export class DeleteUnpopularConcepts extends UseCase<DeleteUnpopularConceptsOptions, void, void> {

    constructor(private container: ConceptContainer, private conceptRep: IConceptRepository) {
        super()
    }

    protected async innerExecute(options: DeleteUnpopularConceptsOptions): Promise<void> {
        debug(`Deleting unpopular concepts: ${JSON.stringify(options)}`);

        await this.conceptRep.deleteUnpopular(this.container.id, options.minConceptPopularity);
        await this.conceptRep.deleteUnpopularAbbreviations(this.container.id, options.minAbbrConceptPopularity);
        await this.conceptRep.deleteUnpopularOneWorlds(this.container.id, options.minOneWordConceptPopularity);
    }
}
