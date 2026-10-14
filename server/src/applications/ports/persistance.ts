import type { Ingredient } from "domain/ingridient"
import type { Mutable } from "domain/lib"
import type { Order } from "domain/order"
import type { Product } from "domain/product"
import type { Session } from "domain/session"
import type { ID } from "domain/shared"
import type { Email, User } from "domain/user"

export interface IRepository<Tentity extends { id: string }, TID = ID<Tentity>> {
    save(...entities: Array<Mutable<Tentity>>): Promise<void>
    create(entity: Tentity): Promise<Mutable<Tentity>>

    getByIDForUpdate(id: TID): Promise<Mutable<Tentity> | null>
    getByID(id: TID): Promise<Tentity | null>
}

export interface IUserRepository extends IRepository<User> {
    existsByEmail(email: Email): Promise<boolean>
    getByEmail(email: Email): Promise<User | null>
}


export interface ISessionRepository extends IRepository<Session> {}

export interface IProductRepository extends IRepository<Product> {}

export interface IOrderRepository extends IRepository<Order> {}

export interface IIngredientRepository extends IRepository<Ingredient> {}


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