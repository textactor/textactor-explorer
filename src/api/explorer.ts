import { IDataContainerApi, createDataContainerApi } from "./data-container";
import { createConnection } from "mongoose";
import { IDataExplorerApi, createDataExplorerApi } from "./data-explorer";

export type ExplorerOptions = {
    dbConnectionString: string
}

export interface IExplorerApi extends IDataContainerApi, IDataExplorerApi {

}

export function explorer(options: ExplorerOptions): IExplorerApi {
    const { dbConnectionString } = options;
    const connection = createConnection(dbConnectionString);

    const api: IExplorerApi = {
        ...createDataContainerApi(connection),
        ...createDataExplorerApi(connection),
    }

    return api;
}
