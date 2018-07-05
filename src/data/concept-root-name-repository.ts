
import { MongoRepository } from './mongo/mongo-repository';
import { MongoParamsWhere } from './mongo/mongo-model';
import { RootName } from '../entities/root-name';
import { IConceptRootNameRepository, RootNamePopularIdsOptions } from '../repositories/concept-root-name-repository';

export class ConceptRootNameRepository extends MongoRepository<RootName> implements IConceptRootNameRepository {
    getMostPopularIds(containerId: string, limit: number, skip: number, options?: RootNamePopularIdsOptions): Promise<string[]> {
        options = options || {};

        const where: MongoParamsWhere = { containerId };
        if (options.minCountWords) {
            where.countWords = where.countWords || {};
            where.countWords.$gte = options.minCountWords;
        }
        if (options.maxCountWords) {
            where.countWords = where.countWords || {};
            where.countWords.$lte = options.maxCountWords;
        }

        return this.model.list({
            where,
            limit,
            offset: skip,
            sort: '-popularity,createdAt',
            select: '_id',
        }).then(list => list && list.map(item => item.id));
    }
    deleteUnpopular(containerId: string, popularity: number): Promise<number> {
        return this.model.remove({
            where: {
                containerId,
                popularity: { $lt: popularity },
            }
        });
    }
    deleteUnpopularAbbreviations(containerId: string, popularity: number): Promise<number> {
        return this.model.remove({
            where: {
                containerId,
                isAbbr: true,
                popularity: { $lt: popularity },
            }
        });
    }
    deleteUnpopularOneWorlds(containerId: string, popularity: number): Promise<number> {
        return this.model.remove({
            where: {
                containerId,
                countWords: 1,
                popularity: { $lt: popularity },
            }
        });
    }
    deleteAll(containerId: string): Promise<number> {
        return this.model.remove({
            where: { containerId }
        });
    }
    deleteIds(ids: string[]): Promise<number> {
        return this.model.remove({
            where: {
                _id: { $in: ids }
            }
        });
    }

    createOrUpdate(item: RootName): Promise<RootName> {
        return this.create(item).catch(error => {
            if (error.code && error.code === 11000) {
                return this.getById(item.id).then(dbItem => {
                    if (dbItem) {
                        item.popularity = dbItem.popularity + 1;
                        return this.update({ id: item.id, set: item });
                    } else {
                        throw new Error(`!NOT found concept on updating: ${item.name}`);
                    }
                });
            }
            return Promise.reject(error);
        });
    }
}
