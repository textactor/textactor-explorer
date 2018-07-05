import { Connection } from "mongoose";
import { Actor } from "../entities/actor";
import { ConceptContainerModel } from "../data/mongo/concept-container-model";
import { ConceptModel } from "../data/mongo/concept-model";
import { ConceptRootNameModel } from "../data/mongo/concept-root-name-model";
import { ConceptRepository } from "../data/concept-repository";
import { ConceptRootNameRepository } from "../data/concept-root-name-repository";
import { ConceptContainerRepository } from "../data/concept-container-repository";
import { notFound } from "boom";
import { WikiEntityRepository } from "../data/wiki-entity-repository";
import { WikiEntityModel } from "../data/mongo/wiki-entity-model";
import { WikiSearchNameRepository } from "../data/wiki-search-name-repository";
import { WikiSearchNameModel } from "../data/mongo/wiki-search-name-model";
import { WikiTitleRepository } from "../data/wiki-title-tepository";
import { WikiTitleModel } from "../data/mongo/wiki-title-model";
import { ExploreContainer, ExploreContainerOptions } from "../usecases/explore-container";
import { CountryTagsService } from "./country-tags-service";
import { KnownNameService } from "@textactor/known-names";

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

    constructor(private containerId: string, private options: ContainerExplorerOptions, private connection: Connection) {

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
        const containerRepository = new ConceptContainerRepository(new ConceptContainerModel(this.connection));
        const container = await containerRepository.getById(this.containerId);

        if (!container) {
            throw notFound(`Not found container id=${this.containerId}`);
        }

        const conceptRepository = new ConceptRepository(new ConceptModel(this.connection));
        const rootNameRepository = new ConceptRootNameRepository(new ConceptRootNameModel(this.connection));
        const wikiEntityRepository = new WikiEntityRepository(new WikiEntityModel(this.connection));
        const searchNameRepository = new WikiSearchNameRepository(new WikiSearchNameModel(this.connection));
        const wikiTitleRepository = new WikiTitleRepository(new WikiTitleModel(this.connection));

        const processConcepts = new ExploreContainer(
            container,
            containerRepository,
            conceptRepository,
            rootNameRepository,
            wikiEntityRepository,
            searchNameRepository,
            wikiTitleRepository,
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
