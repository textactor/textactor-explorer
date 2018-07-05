
export type PlainObject<T> = {
    [index: string]: T
}


export type AnyPlainObject = PlainObject<any>
export type StringPlainObject = PlainObject<string>

export interface IContextName {
    name: string
    lang: string
    country: string
}
