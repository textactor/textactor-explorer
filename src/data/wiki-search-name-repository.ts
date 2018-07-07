
import { MongoRepository } from './mongo/mongo-repository';
import { WikiSearchName } from '../entities/wiki-search-name';
import { IWikiSearchNameRepository } from '../repositories/wiki-search-name-repository';

export class WikiSearchNameRepository extends MongoRepository<WikiSearchName> implements IWikiSearchNameRepository {
    
}
