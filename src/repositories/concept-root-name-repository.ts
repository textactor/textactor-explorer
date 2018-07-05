import { IWriteRepository, IReadRepository } from './repository';
import { RootName } from '../entities/root-name';

export interface IConceptRootNameWriteRepository extends IWriteRepository<string, RootName> {
    deleteUnpopular(containerId: string, popularity: number): Promise<number>
    deleteUnpopularAbbreviations(containerId: string, popularity: number): Promise<number>
    deleteUnpopularOneWorlds(containerId: string, popularity: number): Promise<number>
    deleteAll(containerId: string): Promise<number>
    deleteIds(ids: string[]): Promise<number>
    createOrUpdate(name: RootName): Promise<RootName>
}

export type RootNamePopularIdsOptions = {
    minCountWords?: number
    maxCountWords?: number
}

export interface IConceptRootNameReadRepository extends IReadRepository<string, RootName> {
    getMostPopularIds(containerId: string, limit: number, skip: number, options?: RootNamePopularIdsOptions): Promise<string[]>
}

export interface IConceptRootNameRepository extends IConceptRootNameReadRepository, IConceptRootNameWriteRepository {

}
