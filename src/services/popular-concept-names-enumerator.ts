
const debug = require('debug')('textactor-explorer');

import { INamesEnumerator } from "./names-enumerator";
import { ConceptContainer } from "../entities/concept-container";
import { IConceptReadRepository } from "../repositories/concept-repository";
import { IConceptRootNameRepository } from "../repositories/concept-root-name-repository";
import { ConceptHelper } from "../entities/concept-helper";
import { uniq, uniqByProp } from "../utils";

const START_MIN_COUNT_WORDS = 2;

export type PopularConceptNamesEnumeratorOptions = {
    mutable: boolean
}

export class PopularConceptNamesEnumerator implements INamesEnumerator {
    private skip = 0;
    private limit = 10;
    private currentIndex = -1;
    private currentRootIds: string[] | null = null;
    private end = false;
    private minCountWords = START_MIN_COUNT_WORDS;
    private maxCountWords: number | undefined
    private pagesize: number = 10

    constructor(
        private options: PopularConceptNamesEnumeratorOptions,
        private container: ConceptContainer,
        private conceptRep: IConceptReadRepository,
        private rootNameRep: IConceptRootNameRepository) {
        if (options.mutable) {
            this.limit = this.pagesize = 1;
        }
    }

    private reset() {
        this.skip = 0;
        this.limit = this.pagesize;
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
        if (!this.options.mutable) {
            this.skip += this.limit;
        }

        this.currentRootIds = rootIds;
        this.currentIndex = 0;

        return await this.getConceptNames(this.currentRootIds[this.currentIndex++]);
    }

    async getConceptNames(rootId: string): Promise<string[]> {
        let concepts = await this.conceptRep.getByRootNameId(rootId);
        const rootIds = uniq(concepts.reduce<string[]>((ids, current) => ids.concat(current.rootNameIds), []));
        const index = rootIds.indexOf(rootId);
        if (index > -1) {
            rootIds.splice(index, 1);
        }
        if (rootIds.length) {
            concepts = uniqByProp(concepts.concat(await this.conceptRep.getByRootNameIds(rootIds)), 'id');
            debug(`Found more concepts by rootId: ${JSON.stringify(concepts.map(item => item.name))}`);
        }

        const names = ConceptHelper.getConceptsNames(concepts);

        return names;
    }
}
