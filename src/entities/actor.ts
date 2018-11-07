
import { WikiEntity } from "./wiki-entity";

export type Actor = {
    lang: string
    country: string
    name: string
    names: ActorName[]
    commonName?: string
    abbr?: string

    wikiEntity?: WikiEntity
}

export type ActorName = {
    name: string
    popularity: number
    isAbbr: boolean
    type: ActorNameType
}

export type ActorNameType = 'WIKI' | 'SAME';
