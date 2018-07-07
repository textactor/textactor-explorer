
import { MongoRepository } from './mongo/mongo-repository';
import { ConceptContainer, ConceptContainerStatus } from '../entities/concept-container';
import { IConceptContainerRepository, ContainerListFilters } from '../repositories/concept-container-repository';
import { ILocale } from '../types';
import { MongoParams } from './mongo/mongo-model';

export class ConceptContainerRepository extends MongoRepository<ConceptContainer> implements IConceptContainerRepository {

    getByStatus(locale: ILocale, status: ConceptContainerStatus[]): Promise<ConceptContainer[]> {
        return this.model.list({
            where: {
                lang: locale.lang,
                country: locale.country,
                status: { $in: status },
            },
            limit: 100,
        });
    }

    getByUniqueName(uniqueName: string): Promise<ConceptContainer | null> {
        return this.model.one({ where: { uniqueName } });
    }

    list(filters: ContainerListFilters): Promise<ConceptContainer[]> {
        const selector: MongoParams = {
            where: {
                lang: filters.lang,
                country: filters.country,
            },
            limit: filters.limit,
            offset: filters.skip,
            sort: '-createdAt',
        };

        if (filters.ownerId) {
            selector.where.ownerId = filters.ownerId;
        }
        if (filters.uniqueName) {
            selector.where.uniqueName = filters.uniqueName;
        }
        if (filters.status) {
            selector.where.status = { $in: filters.status };
        }

        return this.model.list(selector);
    }

    count(locale: ILocale): Promise<number> {
        return this.model.count({
            lang: locale.lang,
            count: locale.country,
        });
    }

    deleteIds(ids: string[]): Promise<number> {
        return this.model.remove({
            where: {
                _id: { $in: ids }
            }
        });
    }

    createOrUpdate(item: ConceptContainer): Promise<ConceptContainer> {
        return this.create(item).catch(error => {
            if (error.code && error.code === 11000) {
                return this.getById(item.id).then(dbItem => {
                    if (dbItem) {
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
