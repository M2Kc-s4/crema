import type { Ingredient } from "domain/ingridient"
import type { Mutable } from "domain/lib"
import type { Order } from "domain/order"
import type { Product } from "domain/product"
import type { Session } from "domain/session"
import type { ID } from "domain/shared"
import type { Email, User } from "domain/user"
import type { TEnumValue } from "elysia/type-system/types"


export type EntityWithID = { id: ID<EntityWithID> }


export interface IWriteRepository<Tentity extends EntityWithID, TID = ID<Tentity>> {
    save(...entities: Array<Mutable<Tentity>>): Promise<void>
    create(entity: Tentity): Promise<Mutable<Tentity>>

    getByIDForUpdate(id: TID): Promise<Mutable<Tentity> | null>
    getByID(id: TID): Promise<Tentity | null>
}


export interface IUserRepository extends IWriteRepository<User> {
    existsByEmail(email: Email): Promise<boolean>
    getByEmail(email: Email): Promise<User | null>
}

export interface ISessionRepository extends IWriteRepository<Session> {}

export interface IProductRepository extends IWriteRepository<Product> {}

export interface IOrderRepository extends IWriteRepository<Order> {
    hasOpenedByUser(user: User): Promise<boolean>
    getOpenedByUserForUpdate(user: User): Promise<Mutable<Order> | null>
}

export interface IIngredientRepository extends IWriteRepository<Ingredient> {}


export type ITransactionWorkUnit = {
    user: IUserRepository
    session: ISessionRepository
    product: IProductRepository
    order: IOrderRepository
    ingredient: IIngredientRepository
}

export interface ITransactionManager {
    begin<T>(func: (ctx: ITransactionWorkUnit) => Promise<T>): Promise<T>
}


export interface IReadRepository<Tentity extends EntityWithID, TID = ID<Tentity>> {
    getByID(id: TID): Promise<Tentity | null>
    getByIds(ids: TID[]): Promise<Tentity[]>
    getAll(): Promise<Tentity[]>
}

export interface IUserReadPerository extends IReadRepository<User> {}

export interface ISessionReadPerository extends IReadRepository<Session> {}

export interface IProductReadPerository extends IReadRepository<Product> {}

export interface IOrderReadPerository extends IReadRepository<Order> {
    getAllOpened(): Promise<Order[]>
    getOpenedByUser(user: User): Promise<Order | null>
}

export interface IIngredientReadPerository extends IReadRepository<Ingredient> {}

export interface IReader {
    users: IUserReadPerository
    products: IProductReadPerository
    ingreduents: IIngredientReadPerository
    sessions: ISessionReadPerository
    orders: IOrderReadPerository
}

