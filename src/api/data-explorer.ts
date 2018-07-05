import { Connection } from "mongoose";
import { IContainerExplorer, ContainerExplorer, ContainerExplorerOptions } from "./container-explorer";

export interface IDataExplorerApi {
    newExplorer(containerId: string, options: ContainerExplorerOptions): IContainerExplorer
}

export function createDataExplorerApi(connection: Connection): IDataExplorerApi {
    return {
        newExplorer(containerId: string, options: ContainerExplorerOptions) {
            return new ContainerExplorer(containerId, options, connection);
        }
    }
}
