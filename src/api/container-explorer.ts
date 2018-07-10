
import { Actor } from "../entities/actor";
import { notFound } from "boom";
import { ExploreContainer, ExploreContainerOptions } from "../usecases/explore-container";
import { CountryTagsService } from "./country-tags-service";
import { KnownNameService } from "@textactor/known-names";
import { IConceptContainerRepository } from "../repositories/concept-container-repository";
import { IConceptRepository } from "../repositories/concept-repository";
import { IWikiEntityRepository } from "../repositories/wiki-entity-repository";
import { IWikiSearchNameRepository } from "../repositories/wiki-search-name-repository";
import { IWikiTitleRepository } from "../repositories/wiki-title-repository";

export type OnDataCallback = (data: Actor) => Promise<void>;
export type OnErrorCallback = (error: Error) => void;
export type OnEndCallback = () => void;

export interface IContainerExplorer {
    onData(callback: OnDataCallback): void
    onError(callback: OnErrorCallback): void
    onEnd(callback: OnEndCallback): void
    start(): IContainerExplorer
}

export interface ContainerExplorerOptions extends ExploreContainerOptions {

}

export class ContainerExplorer implements IContainerExplorer {
    private started = false
    // private ended = false;
    private dataCallbacks: OnDataCallback[] = []
    private errorCallbacks: OnErrorCallback[] = []
    private endCallbacks: OnEndCallback[] = []

    constructor(private containerId: string,
        private options: ContainerExplorerOptions,
        private containerRep: IConceptContainerRepository,
        private conceptRep: IConceptRepository,
        private entityRep: IWikiEntityRepository,
        private searchNameRep: IWikiSearchNameRepository,
        private wikiTitleRep: IWikiTitleRepository,
    ) {

    }

    start() {
        if (this.started) {
            throw new Error(`Already started!`);
        }
        this.started = true;

        this.internalStart()
            .catch(error => this.emitError(error))
            .then(() => this.emitEnd());

        return this;
    }

    private async internalStart() {
        const container = await this.containerRep.getById(this.containerId);

        if (!container) {
            throw notFound(`Not found container id=${this.containerId}`);
        }

        const processConcepts = new ExploreContainer(
            container,
            this.containerRep,
            this.conceptRep,
            this.entityRep,
            this.searchNameRep,
            this.wikiTitleRep,
            new CountryTagsService(),
            new KnownNameService()
        );

        await processConcepts.execute((actor: Actor) => this.emitData(actor), this.options);
    }

    onData(callback: OnDataCallback) {
        this.dataCallbacks.push(callback);
    }
    private async emitData(data: Actor): Promise<void> {
        await Promise.all(this.dataCallbacks.map(callback => callback(data)));
    }
    onError(callback: OnErrorCallback) {
        this.errorCallbacks.push(callback);
    }
    private emitError(error: Error): void {
        this.errorCallbacks.map(callback => callback(error));
    }
    onEnd(callback: OnEndCallback) {
        this.endCallbacks.push(callback);
    }
    private emitEnd(): void {
        // this.ended = true;
        this.endCallbacks.map(callback => callback());
    }
}
