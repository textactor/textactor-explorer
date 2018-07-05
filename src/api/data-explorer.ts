import { Connection } from "mongoose";
import { IContainerExplorer, ContainerExplorer } from "./container-explorer";

export interface IDataExplorer {
    newExplorer(containerId: string): IContainerExplorer
}

export function createDataExplorerApi(connection: Connection): IDataExplorer {
    return {
        newExplorer(containerId: string) {
            return new ContainerExplorer(containerId, connection);
        }
    }
}
