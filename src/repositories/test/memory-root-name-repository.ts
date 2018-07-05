
import { RepUpdateData } from '../repository';
import { IConceptRootNameRepository, RootNamePopularIdsOptions } from '../concept-root-name-repository';
import { RootName } from '../../entities/root-name';

export class MemoryRootNameRepository implements IConceptRootNameRepository {
    private db: Map<string, RootName> = new Map()

    getMostPopularIds(containerId: string, limit: number, skip: number, options?: RootNamePopularIdsOptions): Promise<string[]> {
        options = { ...options };
        const list: string[] = [];
        for (let item of this.db.values()) {
            if (item.containerId !== containerId) {
                continue;
            }
            if (options.minCountWords && item.countWords < options.minCountWords) {
                continue;
            }
            if (options.maxCountWords && item.countWords > options.maxCountWords) {
                continue;
            }
            list.push(item.id);
        }
        return Promise.resolve(list.slice(skip, skip + limit));
    }

    getById(id: string): Promise<RootName | null> {
        return Promise.resolve(this.db.get(id) || null);
    }
    getByIds(ids: string[]): Promise<RootName[]> {
        const list: RootName[] = [];
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
    async create(data: RootName): Promise<RootName> {
        if (!!this.db.get(data.id)) {
            return Promise.reject(new Error(`Item already exists!`));
        }
        this.db.set(data.id, { ...{ popularity: 1, createdAt: Date.now() }, ...data });

        const entity = await this.getById(data.id);
        if (!entity) {
            throw new Error(`Entity not found!`)
        }
        return entity;
    }
    update(data: RepUpdateData<string, RootName>): Promise<RootName> {
        const item = this.db.get(data.id);
        if (!item) {
            return Promise.reject(new Error(`Item not found! id=${data.id}`));
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

    deleteUnpopular(containerId: string, popularity: number): Promise<number> {
        let count = 0;
        for (let item of this.db.values()) {
            if (item.containerId !== containerId) {
                continue;
            }
            if (item.popularity <= popularity) {
                this.db.delete(item.id) && count++;
            }
        }

        return Promise.resolve(count);
    }
    deleteUnpopularAbbreviations(containerId: string, popularity: number): Promise<number> {
        let count = 0;
        for (let item of this.db.values()) {
            if (item.containerId !== containerId) {
                continue;
            }
            if (item.isAbbr && item.popularity <= popularity) {
                this.db.delete(item.id) && count++;
            }
        }

        return Promise.resolve(count);
    }
    deleteUnpopularOneWorlds(containerId: string, popularity: number): Promise<number> {
        let count = 0;
        for (let item of this.db.values()) {
            if (item.containerId !== containerId) {
                continue;
            }
            if (item.countWords === 1 && item.popularity <= popularity) {
                this.db.delete(item.id) && count++;
            }
        }

        return Promise.resolve(count);
    }
    deleteAll(containerId: string): Promise<number> {
        let count = 0;
        for (let item of this.db.values()) {
            if (item.containerId !== containerId) {
                continue;
            }

            this.db.delete(item.id) && count++;
        }

        return Promise.resolve(count);
    }
    deleteIds(ids: string[]): Promise<number> {
        let count = 0;
        for (let id of ids) {
            this.db.delete(id) && count++;
        }

        return Promise.resolve(count);
    }
    incrementPopularity(id: string): Promise<number> {
        const item = this.db.get(id);

        if (!item) {
            return Promise.resolve(0);
        }
        item.popularity++;

        return Promise.resolve(item.popularity);
    }
    async createOrUpdate(data: RootName): Promise<RootName> {
        data = { ...data };
        const id = data.id;
        let item = this.db.get(id);
        if (!item) {
            item = await this.create(data);
        } else {
            item.popularity++;
        }

        return Promise.resolve(item);
    }

    all(): Promise<RootName[]> {
        const array: RootName[] = []
        for (let item of this.db.values()) {
            array.push(item);
        }

        return Promise.resolve(array);
    }
}
