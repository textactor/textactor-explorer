
import { IConceptWriteRepository } from "../../repositories/concept-repository";
import { IConceptRootNameWriteRepository } from "../../repositories/concept-root-name-repository";
import { ConceptContainer } from "../../entities/concept-container";
import { UseCase } from "../usecase";

export class CleanConceptContainer extends UseCase<ConceptContainer, void, void> {

    constructor(
        private conceptRep: IConceptWriteRepository,
        private rootNameRep: IConceptRootNameWriteRepository) {
        super()
    }

    protected async innerExecute(container: ConceptContainer): Promise<void> {
        await this.conceptRep.deleteAll(container.id);
        await this.rootNameRep.deleteAll(container.id);
    }
}
