
export type Concept = {
    id: string
    lang: string
    country: string

    containerId: string

    name: string
    nameLength: number
    rootNameIds: string[]

    abbr?: string

    popularity: number
    countWords: number
    endsWithNumber: boolean
    isIrregular: boolean
    isAbbr: boolean
    createdAt?: number
    updatedAt?: number

    knownName?: string

    context?: string
}
