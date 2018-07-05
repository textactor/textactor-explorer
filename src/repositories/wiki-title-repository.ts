
import { IWriteRepository, IReadRepository } from './repository';
import { WikiTitle } from '../entities/wiki-title';

export interface IWikiTitleWriteRepository extends IWriteRepository<string, WikiTitle> {
    createOrUpdate(data: WikiTitle): Promise<WikiTitle>
}

export interface IWikiTitleReadRepository extends IReadRepository<string, WikiTitle> {

}

export interface IWikiTitleRepository extends IWikiTitleReadRepository, IWikiTitleWriteRepository {

}
