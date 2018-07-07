
import { Concept } from '../../entities/concept';
import { ILocale } from '../../types';
import { IConceptRepository } from '../concept-repository';
import { RepUpdateData } from '../repository';
import { uniqByProp, uniq } from '../../utils';

export class MemoryConceptRepository implements IConceptRepository {
    private db: Map<string, Concept> = new Map()

    async getBySameIds(ids: string[]): Promise<Concept[]> {
        let list: Concept[] = [];
        for (let item of this.db.values()) {
            if (~ids.indexOf(item.id)) {
                list.push(item);
                continue;
            }
            for (let id of ids) {
                if (~item.sameIds.indexOf(id)) {
                    list.push(item);
                    continue;
                }
            }
        }
        return uniqByProp(list, 'id');
    }

    async getByRootNameIds(ids: string[]): Promise<Concept[]> {
        let list: Concept[] = [];

        for (let id of ids) {
            const concepts = await this.getByRootNameId(id);
            list = list.concat(concepts);
        }

        return uniqByProp(list, 'id');
    }

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

    getConceptsWithAbbr(containerId: string): Promise<Concept[]> {
        const list: Concept[] = []
        for (let item of this.db.values()) {
            if (item.containerId === containerId && !item.isAbbr && item.abbr) {
                list.push(item);
            }
        }

        return Promise.resolve(list);
    }

    async deleteByRootNameIds(ids: string[]): Promise<number> {

        const list = await this.getByRootNameIds(ids);
        let count = list.length;
        for (let item of list) {
            this.db.delete(item.id);
        }

        return Promise.resolve(count);
    }

    list(locale: ILocale, limit: number, skip?: number): Promise<Concept[]> {
        skip = skip || 0;
        const list: Concept[] = []
        for (let item of this.db.values()) {
            if (item.country !== locale.country || item.lang !== locale.lang) {
                continue;
            }
            list.push(item)
        }

        return Promise.resolve(list.slice(skip, skip + limit));
    }

    getById(id: string): Promise<Concept | null> {
        return Promise.resolve(this.db.get(id) || null);
    }
    getByIds(ids: string[]): Promise<Concept[]> {
        const list: Concept[] = [];
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
    async create(data: Concept): Promise<Concept> {
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
    update(data: RepUpdateData<string, Concept>): Promise<Concept> {
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

    getByRootNameId(id: string): Promise<Concept[]> {
        const list: Concept[] = []
        for (let item of this.db.values()) {
            if (~item.rootNameIds.indexOf(id)) {
                list.push(item)
            }
        }

        return Promise.resolve(list);
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
    async createOrUpdate(concept: Concept): Promise<Concept> {
        concept = { ...concept };
        const id = concept.id;
        let item = this.db.get(id);
        if (!item) {
            item = await this.create(concept);
        } else {
            item.popularity++;
            item.sameIds = item.sameIds.concat(concept.sameIds);
            item.sameIds = uniq(item.sameIds);
        }

        return Promise.resolve(item);
    }

    all(): Promise<Concept[]> {
        const array: Concept[] = []
        for (let item of this.db.values()) {
            array.push(item);
        }

        return Promise.resolve(array);
    }
}
