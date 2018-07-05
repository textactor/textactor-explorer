import { Schema, Connection } from "mongoose";
import { LANG_REG, unixTimestamp } from "../../utils";
import { MongoModel, MongoUpdateData } from "./mongo-model";
import { WikiTitle } from "../../entities/wiki-title";

export class WikiTitleModel extends MongoModel<WikiTitle> {
    constructor(connection: Connection) {
        super(connection.model('WikiTitle', ModelSchema));
    }

    protected transformItem(item: any): WikiTitle {
        const data = super.transformItem(item);

        if (data) {
            if (data.createdAt) {
                data.createdAt = Math.round(new Date(data.createdAt).getTime() / 1000);
            }
            if (data.updatedAt) {
                data.updatedAt = Math.round(new Date(data.updatedAt).getTime() / 1000);
            }
        }

        return data;
    }
    protected beforeCreating(data: WikiTitle) {
        data.createdAt = data.createdAt || unixTimestamp();
        data.updatedAt = data.updatedAt || data.createdAt;
        (<any>data).createdAt = new Date(data.createdAt * 1000);
        (<any>data).updatedAt = new Date(data.updatedAt * 1000);
        return super.beforeCreating(data);
    }

    protected beforeUpdating(data: MongoUpdateData<WikiTitle>) {
        if (data.set) {
            const updatedAt = data.set.updatedAt || unixTimestamp();
            data.set = <Partial<WikiTitle>>{ updatedAt };
            if (typeof data.set.updatedAt === 'number') {
                (<any>data.set).updatedAt = new Date(data.set.updatedAt * 1000);
            }
        }
        return super.beforeUpdating(data);
    }
}

const ModelSchema = new Schema({
    _id: String,
    lang: {
        type: String,
        match: LANG_REG,
        required: true,
    },
    title: {
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 500,
        required: true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
        expires: '5 days',
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
}, {
        collection: 'textactor_wikiTitles'
    });

ModelSchema.set('toObject', {
    getters: true
});
