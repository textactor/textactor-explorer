
import { IWriteRepository, IReadRepository } from './repository';
import { ConceptContainer, ConceptContainerStatus } from '../entities/concept-container';
import { ILocale } from '../types';

export interface IConceptContainerWriteRepository extends IWriteRepository<string, ConceptContainer> {

}

export interface IConceptContainerReadRepository extends IReadRepository<string, ConceptContainer> {
    getByStatus(locale: ILocale, status: ConceptContainerStatus[]): Promise<ConceptContainer[]>
    list(locale: ILocale, limit: number, skip?: number): Promise<ConceptContainer[]>
    count(locale: ILocale): Promise<number>
    getByUniqueName(uniqueName: string): Promise<ConceptContainer | null>
}

export interface IConceptContainerRepository extends IConceptContainerReadRepository, IConceptContainerWriteRepository {

}
