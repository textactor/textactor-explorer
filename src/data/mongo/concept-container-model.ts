import { Schema, Connection } from "mongoose";
import { LANG_REG, COUNTRY_REG, unixTimestamp } from "../../utils";
import { MongoModel, MongoUpdateData } from "./mongo-model";
import { ConceptContainer } from "../../entities/concept-container";

export class ConceptContainerModel extends MongoModel<ConceptContainer> {
    constructor(connection: Connection) {
        super(connection.model('ConceptContainer', ModelSchema));
    }

    protected transformItem(item: any): ConceptContainer {
        const data = super.transformItem(item);

        if (data) {
            if (data.createdAt) {
                data.createdAt = Math.round(new Date(data.createdAt).getTime() / 1000);
            }
        }
        return data;
    }
    protected beforeCreating(data: ConceptContainer) {
        data.createdAt = data.createdAt || unixTimestamp();
        data.updatedAt = data.updatedAt || data.createdAt;
        (<any>data).createdAt = new Date(data.createdAt * 1000);
        (<any>data).updatedAt = new Date(data.updatedAt * 1000);
        return super.beforeCreating(data);
    }

    protected beforeUpdating(data: MongoUpdateData<ConceptContainer>) {
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
    country: {
        type: String,
        match: COUNTRY_REG,
        required: true,
        index: true,
    },
    name: {
        type: String,
        minlength: 2,
        maxlength: 200,
        required: true,
    },
    uniqueName: {
        type: String,
        minlength: 2,
        maxlength: 200,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        minlength: 1,
        maxlength: 50,
        required: true,
        index: true,
    },
    ownerId: {
        type: String,
        minlength: 1,
        maxlength: 50,
        index: true,
        required: true,
    },
    lastError: {
        type: String,
        maxlength: 800,
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
        collection: 'textactor_conceptContainers'
    });

ModelSchema.set('toObject', {
    getters: true
});
