import { IDataContainer, createDataContainerApi } from "./data-container";
import { createConnection } from "mongoose";
import { IDataExplorer, createDataExplorerApi } from "./data-explorer";

export type ExplorerOptions = {
    dbConnectionString: string
}

export interface IExplorer extends IDataContainer, IDataExplorer {

}

export function explorer(options: ExplorerOptions): IExplorer {
    const { dbConnectionString } = options;
    const connection = createConnection(dbConnectionString);

    const dataContainer: IExplorer = {
        ...createDataContainerApi(connection),
        ...createDataExplorerApi(connection),
    }

    return dataContainer;
}
