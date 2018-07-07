
import { IWikiTitleRepository } from '../wiki-title-repository';
import { WikiTitle } from '../../entities/wiki-title';
import { RepUpdateData } from '../repository';


export class MemoryWikiTitleRepository implements IWikiTitleRepository {

    private db: Map<string, WikiTitle> = new Map()

    createOrUpdate(data: WikiTitle): Promise<WikiTitle> {
        const item = this.db.get(data.id);
        if (item) {
            return this.update({ id: data.id, set: data });
        }
        return this.create(data);
    }

    getById(id: string): Promise<WikiTitle | null> {
        return Promise.resolve(this.db.get(id) || null);
    }
    getByIds(ids: string[]): Promise<WikiTitle[]> {
        const list: WikiTitle[] = [];
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
    async create(data: WikiTitle): Promise<WikiTitle> {
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
    update(data: RepUpdateData<string, WikiTitle>): Promise<WikiTitle> {

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
