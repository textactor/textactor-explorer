
import { IConceptWriteRepository } from "../../repositories/concept-repository";
import { ConceptContainer } from "../../entities/concept-container";
import { UseCase } from "../usecase";

export class CleanConceptContainer extends UseCase<ConceptContainer, void, void> {

    constructor(
        private conceptRep: IConceptWriteRepository) {
        super()
    }

    protected async innerExecute(container: ConceptContainer): Promise<void> {
        await this.conceptRep.deleteAll(container.id);
    }
}
