
import { IConceptWriteRepository } from "../../repositories/concept-repository";
import { ConceptContainer } from "../../entities/concept-container";
import { ConceptHelper } from "../../entities/concept-helper";
import { UseCase } from "../usecase";

export class DeleteActorConcepts extends UseCase<string[], void, void> {

    constructor(
        private container: ConceptContainer,
        private conceptRep: IConceptWriteRepository) {
        super()
    }

    protected async innerExecute(names: string[]): Promise<void> {

        const lang = this.container.lang;
        const country = this.container.country;
        const containerId = this.container.id;

        const conceptIds = ConceptHelper.ids(names, lang, country, containerId);
        const rootIds = ConceptHelper.rootIds(names, lang, country, containerId);

        await this.conceptRep.deleteIds(conceptIds);
        await this.conceptRep.deleteByRootNameIds(rootIds);
    }
}
