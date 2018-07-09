
export enum WikiEntityType {
    EVENT = 'E',
    ORG = 'O',
    PERSON = 'H',
    PLACE = 'P',
    PRODUCT = 'R',
    WORK = 'W',
}

export type WikiEntityData = { [prop: string]: string[] }

export type WikiEntity = {
    id: string
    lang: string
    name: string
    simpleName?: string
    specialName?: string
    names: string[]
    namesHashes: string[]
    partialNames: string[]
    partialNamesHashes: string[]
    // secondaryNames: string[]
    abbr?: string
    description?: string
    aliases: string[]
    about?: string
    wikiDataId: string
    wikiPageId: number
    wikiPageTitle: string
    type?: WikiEntityType
    types?: string[]
    countryCodes: string[]
    rank: number
    links: { [lang: string]: string }
    data?: WikiEntityData
    categories?: string[]

    createdAt?: number
    updatedAt?: number

    /**
     * Permanent redirect to entity id
     */
    redirectId?: string
}
