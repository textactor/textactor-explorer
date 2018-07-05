
import { IWriteRepository, IReadRepository } from './repository';
import { WikiEntity } from '../entities/wiki-entity';

export interface IWikiEntityWriteRepository extends IWriteRepository<string, WikiEntity> {
    createOrUpdate(data: WikiEntity): Promise<WikiEntity>
}

export interface IWikiEntityReadRepository extends IReadRepository<string, WikiEntity> {
    getByNameHash(hash: string): Promise<WikiEntity[]>
    getByPartialNameHash(hash: string): Promise<WikiEntity[]>
    getInvalidPartialNames(lang: string): Promise<string[]>
    count(): Promise<number>
}

export interface IWikiEntityRepository extends IWikiEntityReadRepository, IWikiEntityWriteRepository {

}
