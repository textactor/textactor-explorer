
import { IWriteRepository, IReadRepository } from './repository';
import { Concept } from '../entities/concept';

export interface IConceptWriteRepository extends IWriteRepository<string, Concept> {
    deleteUnpopular(containerId: string, popularity: number): Promise<number>
    deleteUnpopularAbbreviations(containerId: string, popularity: number): Promise<number>
    deleteUnpopularOneWorlds(containerId: string, popularity: number): Promise<number>
    deleteAll(containerId: string): Promise<number>
    deleteIds(ids: string[]): Promise<number>
    deleteByRootNameIds(ids: string[]): Promise<number>
    /**
     * Create a new concept or update existing with new fields and increment popularity
     * @param concept Concept to process
     */
    createOrUpdate(concept: Concept): Promise<Concept>
}

export interface IConceptReadRepository extends IReadRepository<string, Concept> {
    getByRootNameId(id: string): Promise<Concept[]>
    getByRootNameIds(ids: string[]): Promise<Concept[]>
    getConceptsWithAbbr(containerId: string): Promise<Concept[]>
    getBySameIds(ids: string[]): Promise<Concept[]>
}

export interface IConceptRepository extends IConceptReadRepository, IConceptWriteRepository {

}
