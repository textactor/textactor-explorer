
import { MongoModel } from './mongo-model';
import { IRepository, RepUpdateData } from '../../repositories/repository';

export class MongoRepository<T> implements IRepository<string, T> {
    constructor(protected model: MongoModel<T>) { }

    getById(id: string): Promise<T | null> {
        return this.model.one({ where: { _id: id } });
    }
    getByIds(ids: string[]): Promise<T[]> {
        return this.model.list({ where: { _id: { $in: ids } }, limit: ids.length });
    }
    exists(id: string): Promise<boolean> {
        return this.model.one({ where: { _id: id }, select: '_id' }).then(item => !!item);
    }
    delete(id: string): Promise<boolean> {
        return this.model.remove({ where: { _id: id } }).then(item => !!item);
    }
    create(data: T): Promise<T> {
        return this.model.create(data);
    }
    update(data: RepUpdateData<string, T>): Promise<T> {
        const id = data.id;
        const set: { [index: string]: any } = {};
        if (data.set) {
            for (let prop of Object.keys(data.set)) {
                if (['id', 'createdAt', '_id'].indexOf(prop) > -1) {
                    continue;
                }
                if ([null, undefined, ''].indexOf((<any>data.set)[prop]) > -1) {
                    continue;
                }
                set[prop] = (<any>data.set)[prop];
            }
        }
        const unset: { [index: string]: string } = {};
        if (data.delete) {
            for (let prop of data.delete) {
                if (['id', 'createdAt', '_id'].indexOf(prop as string) > -1) {
                    continue;
                }
                unset[prop as string] = "";
            }
        }
        return this.model.update({
            id: id,
            set: set as Partial<T>,
            unset
        });
    }

    createOrUpdate(item: T): Promise<T> {
        return this.create(item).catch(error => {
            if (error.code && error.code === 11000) {
                return this.update({ id: (<any>item).id, set: item });
            }
            return Promise.reject(error);
        });
    }
}
