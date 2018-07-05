import { Connection } from "mongoose";
import { IContainerExplorer, ContainerExplorer } from "./container-explorer";

export interface IDataExplorerApi {
    newExplorer(containerId: string): IContainerExplorer
}

export function createDataExplorerApi(connection: Connection): IDataExplorerApi {
    return {
        newExplorer(containerId: string) {
            return new ContainerExplorer(containerId, connection);
        }
    }
}
