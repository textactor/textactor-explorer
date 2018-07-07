import { Schema, Connection } from "mongoose";
import { LANG_REG, COUNTRY_REG, unixTimestamp } from "../../utils";
import { MongoModel, MongoUpdateData } from "./mongo-model";
import { RootName } from "../../entities/root-name";

export class ConceptRootNameModel extends MongoModel<RootName> {
    constructor(connection: Connection) {
        super(connection.model('ConceptRootName', ModelSchema));
    }

    protected transformItem(item: any): RootName {
        const data = super.transformItem(item);

        if (data) {
            if (data.createdAt) {
                data.createdAt = Math.round(new Date(data.createdAt).getTime() / 1000);
            }
        }

        return data;
    }
    protected beforeCreating(data: RootName) {
        data.createdAt = data.createdAt || unixTimestamp();
        data.updatedAt = data.updatedAt || data.createdAt;
        (<any>data).createdAt = new Date(data.createdAt * 1000);
        (<any>data).updatedAt = new Date(data.updatedAt * 1000);
        return super.beforeCreating(data);
    }

    protected beforeUpdating(data: MongoUpdateData<RootName>) {
        if (data.set) {
            delete data.set.createdAt;
            delete data.set.containerId;
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
    country: {
        type: String,
        match: COUNTRY_REG,
        required: true,
        index: true,
    },
    containerId: {
        type: String,
        required: true,
        index: true,
    },
    name: {
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 500,
        required: true,
    },
    popularity: {
        type: Number,
        required: true,
        index: true,
    },
    countWords: {
        type: Number,
        required: true,
        index: true,
    },
    isAbbr: {
        type: Boolean,
        required: true,
        index: true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
        expires: '15 days',
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
}, {
        collection: 'textactor_conceptRootNames'
    });

ModelSchema.set('toObject', {
    getters: true
});
