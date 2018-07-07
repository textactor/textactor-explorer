
import { ILocale } from '../../types';
import { RepUpdateData } from '../repository';
import { IConceptContainerRepository, ContainerListFilters } from '../concept-container-repository';
import { ConceptContainer, ConceptContainerStatus } from '../../entities/concept-container';

export class MemoryConceptContainerRepository implements IConceptContainerRepository {

    private db: Map<string, ConceptContainer> = new Map()

    count(locale: ILocale): Promise<number> {
        let count = 0;
        for (let item of this.db.values()) {
            if (item.country !== locale.country || item.lang !== locale.lang) {
                continue;
            }

            count++;
        }

        return Promise.resolve(count);
    }

    getByStatus(locale: ILocale, status: ConceptContainerStatus[]): Promise<ConceptContainer[]> {
        const list: ConceptContainer[] = []
        for (let item of this.db.values()) {
            if (item.country !== locale.country || item.lang !== locale.lang || status.indexOf(item.status) < 0) {
                continue;
            }
            list.push(item)
        }

        return Promise.resolve(list);
    }
    getByUniqueName(uniqueName: string): Promise<ConceptContainer | null> {
        for (let item of this.db.values()) {
            if (item.uniqueName === uniqueName) {
                return Promise.resolve(item);
            }
        }
        return Promise.resolve(null);
    }

    list(filters: ContainerListFilters): Promise<ConceptContainer[]> {
        const skip = filters.skip || 0;
        const list: ConceptContainer[] = []
        for (let item of this.db.values()) {
            if (item.country !== filters.country || item.lang !== filters.lang) {
                continue;
            }
            if (filters.ownerId && filters.ownerId !== item.ownerId) {
                continue;
            }
            if (filters.uniqueName && filters.uniqueName !== item.uniqueName) {
                continue;
            }
            if (filters.status && filters.status.indexOf(item.status) < 0) {
                continue;
            }
            list.push(item)
        }

        return Promise.resolve(list.slice(skip, skip + filters.limit));
    }

    getById(id: string): Promise<ConceptContainer | null> {
        return Promise.resolve(this.db.get(id) || null);
    }

    getByIds(ids: string[]): Promise<ConceptContainer[]> {
        const list: ConceptContainer[] = [];
        for (let id of ids) {
            const item = this.db.get(id);
            if (item) {
                list.push(item);
            }
        }
        return Promise.resolve(list);
    }
    exists(id: string): Promise<boolean> {
        return Promise.resolve(!!this.db.get(id));
    }
    delete(id: string): Promise<boolean> {
        return Promise.resolve(this.db.delete(id));
    }
    async create(data: ConceptContainer): Promise<ConceptContainer> {
        if (!!this.db.get(data.id)) {
            return Promise.reject(new Error(`Item already exists!`));
        }
        this.db.set(data.id, { ...{ createdAt: Date.now() }, ...data });

        const entity = await this.getById(data.id);
        if (!entity) {
            throw new Error(`Entity not found!`)
        }
        return entity;
    }
    update(data: RepUpdateData<string, ConceptContainer>): Promise<ConceptContainer> {
        const item = this.db.get(data.id);
        if (!item) {
            return Promise.reject(new Error(`Item not found! id=${data.id}`));
        }
        if (!data.set && !data.delete) {
            return Promise.reject(new Error(`'set' or 'delete' must exist`));
        }

        if (data.set) {
            for (let prop in data.set) {
                if ([null, undefined].indexOf((<any>data.set)[prop]) < 0) {
                    (<any>item)[prop] = (<any>data.set)[prop];
                }
            }
        }

        if (data.delete) {
            for (let prop of data.delete) {
                delete (<any>item)[prop];
            }
        }

        return Promise.resolve(item);
    }

    deleteIds(ids: string[]): Promise<number> {
        let count = 0;
        for (let id of ids) {
            this.db.delete(id) && count++;
        }

        return Promise.resolve(count);
    }

    all(): Promise<ConceptContainer[]> {
        const array: ConceptContainer[] = []
        for (let item of this.db.values()) {
            array.push(item);
        }

        return Promise.resolve(array);
    }
}
