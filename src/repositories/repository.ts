
export interface RepAccessOptions<T> {
    /**
     * Fields to return separated by spaces
     */
    fields?: (keyof T)[]
}

export interface RepUpdateOptions<T> extends RepAccessOptions<T> {

}

export interface RepUpdateData<ID extends string | number,T> {
    id: ID,
    set?: Partial<T>
    delete?: (keyof T)[]
}

export interface IReadRepository<ID extends string | number, T> {
    getById(id: ID): Promise<T | null>
    getByIds(ids: ID[]): Promise<T[]>
    exists(id: ID): Promise<boolean>
}

export interface IWriteRepository<ID extends string | number, T> {
    delete(id: ID): Promise<boolean>
    create(data: T): Promise<T>
    update(data: RepUpdateData<ID, T>): Promise<T>
}

export interface IRepository<ID extends string | number, T> extends IReadRepository<ID, T>, IWriteRepository<ID, T> {

}