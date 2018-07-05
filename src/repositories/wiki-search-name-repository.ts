
import { IWriteRepository, IReadRepository } from './repository';
import { WikiSearchName } from '../entities/wiki-eearch-name';

export interface IWikiSearchNameWriteRepository extends IWriteRepository<string, WikiSearchName> {
    createOrUpdate(data: WikiSearchName): Promise<WikiSearchName>
}

export interface IWikiSearchNameReadRepository extends IReadRepository<string, WikiSearchName> {

}

export interface IWikiSearchNameRepository extends IWikiSearchNameReadRepository, IWikiSearchNameWriteRepository {

}
