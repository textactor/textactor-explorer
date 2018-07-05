
import { WikiEntity } from "./wiki-entity";

export type Actor = {
    lang: string
    country: string
    name: string
    names: string[]
    
    wikiEntity?: WikiEntity
}
