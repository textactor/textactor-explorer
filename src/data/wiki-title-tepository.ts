
import { MongoRepository } from './mongo/mongo-repository';
import { WikiTitle } from '../entities/wiki-title';
import { IWikiTitleRepository } from '../repositories/wiki-title-repository';

export class WikiTitleRepository extends MongoRepository<WikiTitle> implements IWikiTitleRepository {
    
}
