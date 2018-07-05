import { Model, Document } from 'mongoose';
import { notFound } from 'boom';

export class MongoModel<T> {
    constructor(private model: Model<Document>) { }

    create(data: T): Promise<T> {
        if (!data) {
            return Promise.reject(Error('`data` is required'));
        }
        try {
            data = this.beforeCreating(data);
        } catch (e) {
            return Promise.reject(e);
        }
        return new Promise<T>((resolve, reject) => {
            this.model.create(data).then(item => resolve(item && this.transformItem(item)), reject);
        });
    }

    async update(data: MongoUpdateData<T>): Promise<T> {

        data = this.beforeUpdating(data);

        const updateData: any = {};
        if (data.set && Object.keys(data.set).length) {
            updateData['$set'] = data.set;
        }
        if (data.unset && Object.keys(data.unset).length) {
            updateData['$unset'] = data.unset;
        }

        const document = await this.model.findByIdAndUpdate(data.id, updateData);

        if (document) {
            return this.transformItem(document);
        } else {
            throw notFound(`Not found object id=${data.id}`, data);
        }
    }

    // updateMongo(condition: any, data: any, options?: any) {
    //     return new Promise<T>((resolve, reject) => {
    //         this.model.update(condition, data, options).then(get, reject).then(resolve);
    //     });
    // }

    remove(params: MongoParams): Promise<number> {
        if (!params) {
            return Promise.reject(Error('`params` is required'));
        }

        return new Promise((resolve, reject) => {
            this.model.remove(params.where)
                .then(item => resolve(item), reject);
        });
    }

    async one(params: MongoParams): Promise<T | null> {
        if (!params) {
            return Promise.reject(Error('`params` is required'));
        }

        const document = await this.model.findOne(params.where, params.select);
        if (document) {
            return this.transformItem(document);
        } else {
            return null;
        }
    }

    count(where: MongoParamsWhere): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.model.count(where).then(item => resolve(item), reject);
        });
    }

    list(params: MongoParams): Promise<T[]> {
        if (!params) {
            return Promise.reject(Error('`params` is required'));
        }

        return new Promise<T[]>((resolve, reject) => {
            this.model
                .find(params.where)
                .select(params.select)
                .sort(params.sort)
                .skip(params.offset || 0)
                .limit(params.limit || 10)
                .exec()
                .then(items => resolve(items && items.map(item => this.transformItem(item))), reject);
        });
    }


    protected beforeCreating(data: T) {
        const ndata: any = data;
        for (let prop of Object.keys(ndata)) {
            if (~[null, undefined].indexOf(ndata[prop])) {
                delete ndata[prop];
            }
        }
        ndata._id = ndata._id || ndata.id;
        return data;
    }

    protected beforeUpdating(data: MongoUpdateData<T>) {
        return data;
    }

    protected transformItem(item: Document): T {
        return item.toJSON();
    }
}

export type MongoParamsWhere = { [index: string]: any };
export type MongoParams = {
    where: MongoParamsWhere
    select?: string
    offset?: number
    limit?: number
    sort?: string
}

export type MongoUpdateData<T> = {
    id: string
    set?: Partial<T>
    unset?: { [index: string]: string }
}

export type MongoOptions = {
    select?: string
}