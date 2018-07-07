
import { IWriteRepository, IReadRepository } from './repository';
import { ConceptContainer, ConceptContainerStatus } from '../entities/concept-container';
import { ILocale } from '../types';

export interface IConceptContainerWriteRepository extends IWriteRepository<string, ConceptContainer> {

}

export type ContainerListFilters = {
    lang: string
    country: string
    status?: ConceptContainerStatus[]
    ownerId?: string
    uniqueName?: string
    limit: number
    skip?: number
}

export interface IConceptContainerReadRepository extends IReadRepository<string, ConceptContainer> {
    getByStatus(locale: ILocale, status: ConceptContainerStatus[]): Promise<ConceptContainer[]>
    list(filters: ContainerListFilters): Promise<ConceptContainer[]>
    count(locale: ILocale): Promise<number>
    getByUniqueName(uniqueName: string): Promise<ConceptContainer | null>
}

export interface IConceptContainerRepository extends IConceptContainerReadRepository, IConceptContainerWriteRepository {

}
