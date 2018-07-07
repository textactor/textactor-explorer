
import { IWikiSearchNameRepository } from '../wiki-search-name-repository';
import { WikiSearchName } from '../../entities/wiki-eearch-name';
import { RepUpdateData } from '../repository';


export class MemoryWikiSearchNameRepository implements IWikiSearchNameRepository {

    private db: Map<string, WikiSearchName> = new Map()

    createOrUpdate(data: WikiSearchName): Promise<WikiSearchName> {
        const item = this.db.get(data.id);
        if (item) {
            return this.update({ id: data.id, set: data });
        }
        return this.create(data);
    }

    getById(id: string): Promise<WikiSearchName | null> {
        return Promise.resolve(this.db.get(id) || null);
    }
    getByIds(ids: string[]): Promise<WikiSearchName[]> {
        const list: WikiSearchName[] = [];
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
    async create(data: WikiSearchName): Promise<WikiSearchName> {
        if (!!this.db.get(data.id)) {
            return Promise.reject(new Error(`Item already exists!`));
        }
        this.db.set(data.id, Object.assign({ createdAt: new Date(), lastSearchAt: new Date() }, data));

        const entity = await this.getById(data.id);
        if (!entity) {
            throw new Error(`Entity not found!`)
        }
        return entity;
    }
    update(data: RepUpdateData<string, WikiSearchName>): Promise<WikiSearchName> {

        const item = this.db.get(data.id);
        if (!item) {
            return Promise.reject(new Error(`Item not found! id=${data.id}`));
        }

        if (data.set) {
            delete (<any>data.set).createdAt;

            for (let prop in data.set) {
                (<any>item)[prop] = (<any>data.set)[prop]
            }
        }

        if (data.delete) {
            for (let prop of data.delete) {
                delete (<any>item)[prop];
            }
        }

        return Promise.resolve(item);
    }
}
