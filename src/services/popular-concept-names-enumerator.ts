
// const debug = require('debug')('textactor-explorer');

import { INamesEnumerator } from "./names-enumerator";
import { ConceptContainer } from "../entities/concept-container";
import { IConceptReadRepository } from "../repositories/concept-repository";
import { IConceptRootNameRepository } from "../repositories/concept-root-name-repository";
import { ConceptHelper } from "../entities/concept-helper";

const START_MIN_COUNT_WORDS = 2;

export type PopularConceptNamesEnumeratorOptions = {
    rootNames: boolean
}

export class PopularConceptNamesEnumerator implements INamesEnumerator {
    private skip = 0;
    private limit = 10;
    private currentIndex = -1;
    private currentRootIds: string[] | null = null;
    private end = false;
    private minCountWords = START_MIN_COUNT_WORDS;
    private maxCountWords: number | undefined

    constructor(
        private container: ConceptContainer,
        private conceptRep: IConceptReadRepository,
        private rootNameRep: IConceptRootNameRepository) { }

    private reset() {
        this.skip = 0;
        this.limit = 10;
        this.currentIndex = -1;
        this.currentRootIds = null;
    }

    atEnd(): boolean {
        return this.end;
    }

    async next(): Promise<string[]> {
        if (this.end) {
            return [];
        }
        if (this.currentRootIds && this.currentIndex < this.currentRootIds.length) {
            return await this.getConceptNames(this.currentRootIds[this.currentIndex++]);
        }
        const rootIds = await this.rootNameRep.getMostPopularIds(this.container.id, this.limit, this.skip,
            { minCountWords: this.minCountWords, maxCountWords: this.maxCountWords });

        if (rootIds.length === 0) {
            if (this.minCountWords === START_MIN_COUNT_WORDS) {
                this.minCountWords = 0;
                this.maxCountWords = 1;
                this.reset();
                return this.next();
            }
            this.end = true;
            return [];
        }
        this.skip += this.limit;

        this.currentRootIds = rootIds;
        this.currentIndex = 0;

        return await this.getConceptNames(this.currentRootIds[this.currentIndex++]);
    }

    async getConceptNames(rootId: string): Promise<string[]> {
        const concepts = await this.conceptRep.getByRootNameId(rootId);
        const names = ConceptHelper.getConceptsNames(concepts);

        return names;
    }
}
