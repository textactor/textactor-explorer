
import { MongoRepository } from './mongo/mongo-repository';
import { Concept } from '../entities/concept';
import { IConceptRepository, PopularConceptsOptions } from '../repositories/concept-repository';
import { ILocale } from '../types';
import { uniq } from '../utils';
import { MongoParamsWhere } from './mongo/mongo-model';

export class ConceptRepository extends MongoRepository<Concept> implements IConceptRepository {

    getMostPopular(containerId: string, limit: number, skip: number, options?: PopularConceptsOptions): Promise<Concept[]> {
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
        });
    }
    getByRootNameId(id: string): Promise<Concept[]> {
        return this.model.list({
            where: {
                rootNameIds: id
            },
            limit: 500,
        })
    }
    getByRootNameIds(ids: string[]): Promise<Concept[]> {
        return this.model.list({
            where: {
                rootNameIds: { $in: ids }
            },
            limit: 500,
        });
    }
    list(locale: ILocale, limit: number, skip?: number): Promise<Concept[]> {
        return this.model.list({
            where: {
                lang: locale.lang,
                country: locale.country,
            },
            limit,
            offset: skip || 0,
        });
    }
    getConceptsWithAbbr(containerId: string): Promise<Concept[]> {
        return this.model.list({
            where: {
                containerId,
                abbr: { $exists: true },
                limit: 500,
            }
        });
    }
    count(locale: ILocale): Promise<number> {
        return this.model.count({
            lang: locale.lang,
            count: locale.country,
        });
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
                isAbbr: false,
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
    deleteByRootNameIds(ids: string[]): Promise<number> {
        return this.model.remove({
            where: {
                rootNameIds: { $in: ids }
            }
        });
    }
    createOrUpdate(item: Concept): Promise<Concept> {
        return this.create(item).catch(error => {
            if (error.code && error.code === 11000) {
                return this.getById(item.id).then(dbItem => {
                    if (dbItem) {
                        item.popularity = dbItem.popularity + 1;
                        if (item.rootNameIds) {
                            item.rootNameIds = uniq(dbItem.rootNameIds.concat(item.rootNameIds));
                        }
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
