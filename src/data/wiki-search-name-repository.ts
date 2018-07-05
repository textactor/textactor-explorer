
import { MongoRepository } from './mongo/mongo-repository';
import { WikiSearchName } from '../entities/wiki-eearch-name';
import { IWikiSearchNameRepository } from '../repositories/wiki-search-name-repository';

export class WikiSearchNameRepository extends MongoRepository<WikiSearchName> implements IWikiSearchNameRepository {
    
}
