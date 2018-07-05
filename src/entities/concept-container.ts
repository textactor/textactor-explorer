
export enum ConceptContainerStatus {
    NEW = 'NEW',
    COLLECTING = 'COLLECTING',
    COLLECT_DONE = 'COLLECT_DONE',
    COLLECT_ERROR = 'COLLECT_ERROR',
    GENERATING = 'GENERATING',
    GENERATE_ERROR = 'GENERATE_ERROR',
    EMPTY = 'EMPTY',
}

export const ConceptContainerStatusKeys = [
    ConceptContainerStatus.NEW,
    ConceptContainerStatus.COLLECT_DONE,
    ConceptContainerStatus.COLLECT_ERROR,
    ConceptContainerStatus.COLLECTING,
    ConceptContainerStatus.EMPTY,
    ConceptContainerStatus.GENERATE_ERROR,
    ConceptContainerStatus.GENERATING,
    ConceptContainerStatus.NEW,
];

export type ConceptContainer = {
    id: string
    lang: string
    country: string

    name: string
    uniqueName: string

    ownerId: string

    status: ConceptContainerStatus

    lastError?: string

    createdAt?: number
    updatedAt?: number
}
