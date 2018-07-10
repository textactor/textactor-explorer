import { Schema, Connection } from "mongoose";
import { LANG_REG, unixTimestamp } from "../../utils";
import { MongoModel, MongoUpdateData } from "./mongo-model";
import { WikiEntity } from "../../entities/wiki-entity";

export class WikiEntityModel extends MongoModel<WikiEntity> {
    constructor(connection: Connection) {
        super(connection.model('WikiEntity', ModelSchema));
    }

    protected transformItem(item: any): WikiEntity {
        const data = super.transformItem(item);

        if (data) {
            if (data.createdAt) {
                data.createdAt = Math.round(new Date(data.createdAt).getTime() / 1000);
            }
        }

        return data;
    }
    protected beforeCreating(data: WikiEntity) {
        data.createdAt = data.createdAt || unixTimestamp();
        data.updatedAt = data.updatedAt || data.createdAt;
        (<any>data).createdAt = new Date(data.createdAt * 1000);
        (<any>data).updatedAt = new Date(data.updatedAt * 1000);
        return super.beforeCreating(data);
    }

    protected beforeUpdating(data: MongoUpdateData<WikiEntity>) {
        if (data.set) {
            delete data.set.createdAt;
            data.set.updatedAt = data.set.updatedAt || unixTimestamp();
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
        index: true,
    },
    name: {
        type: String,
        minlength: 2,
        maxlength: 200,
        required: true,
    },
    simpleName: {
        type: String,
        minlength: 2,
        maxlength: 200,
    },
    specialName: {
        type: String,
        minlength: 1,
        maxlength: 200,
    },
    names: {
        type: [String],
        required: true,
    },
    namesHashes: {
        type: [String],
        index: true,
        required: true,
    },
    partialNames: {
        type: [String],
        required: true,
    },
    partialNamesHashes: {
        type: [String],
        index: true,
        required: true,
    },
    abbr: {
        type: String,
    },
    description: {
        type: String
    },
    aliases: {
        type: [String]
    },
    about: {
        type: String
    },
    wikiDataId: {
        type: String
    },
    wikiPageId: {
        type: Number
    },
    wikiPageTitle: {
        type: String
    },
    type: {
        type: String
    },
    types: {
        type: [String]
    },
    countryCodes: {
        type: [String]
    },
    rank: {
        type: Number
    },
    categories: {
        type: [String]
    },
    data: {
        type: Schema.Types.Mixed
    },
    links: {
        type: Schema.Types.Mixed
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        required: true,
        expires: '15 days',
    },
}, {
        collection: 'textactor_wikiEntities'
    });

ModelSchema.set('toObject', {
    getters: true
});
