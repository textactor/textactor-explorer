
import { IConceptWriteRepository } from '../../repositories/concept-repository';
import { Concept } from '../../entities/concept';
import { ConceptHelper } from '../../entities/concept-helper';
import { IConceptRootNameRepository } from '../../repositories/concept-root-name-repository';
import { RootNameHelper, KnownRootNameData } from '../../entities/root-name-helper';
import { UseCase } from '../usecase';

export class PushContextConcepts extends UseCase<Concept[], Concept[], void> {
    constructor(private conceptRep: IConceptWriteRepository, private rootNameRep: IConceptRootNameRepository) {
        super()
    }

    protected innerExecute(concepts: Concept[]): Promise<Concept[]> {
        concepts = concepts.filter(concept => ConceptHelper.isValid(concept));
        return Promise.all(concepts.map(concept => this.pushConcept(concept)));
    }

    private async pushConcept(concept: Concept): Promise<Concept> {
        let data: KnownRootNameData = { name: concept.name, lang: concept.lang, country: concept.country, containerId: concept.containerId };
        const rootName = RootNameHelper.build(data);

        await this.rootNameRep.createOrUpdate(rootName);

        if (concept.knownName) {
            data.name = concept.knownName
            const knownRootName = RootNameHelper.build(data);
            if (knownRootName.id !== rootName.id) {
                await this.rootNameRep.createOrUpdate(knownRootName);
            }
        }

        return await this.conceptRep.createOrUpdate(concept);
    }
}
