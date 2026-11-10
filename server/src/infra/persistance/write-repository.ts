import type { Mutable } from "domain/lib";
import type { IIngredientRepository, IOrderRepository, IProductRepository, IWriteRepository, ISessionRepository, IUserRepository, EntityWithID } from "../../applications/ports/ipersistance";
import type { ID } from "domain/shared";
import { Connection, Pool, sql } from "@m2k-5f/pgtx"
import type { Email, User } from "domain/user";
import type { Session } from "domain/session";
import type { Ingredient } from "domain/ingridient";
import type { Product } from "domain/product";
import type { Order } from "domain/order";

export type DataRow<T> = { data: T }

type Row<T extends EntityWithID> = { id: T['id'] } & DataRow<T>

export abstract class Repository<T extends EntityWithID> implements IWriteRepository<T> {
    abstract table: string

    constructor(
        protected tx: Connection
    ) {}

    save(...entities: Mutable<T>[]): Promise<void> {
        const data: Row<T>[] =  entities.map(e => ({id: e.id, data: e}))

        return this.tx.execute`
            insert into ${sql.ident(this.table)} ${sql.insert<Row<T>>(...data)} 
            on conflict (id) 
            do update set ${sql.excluded(['data'])}`
    }

    async create(entity: T): Promise<Mutable<T>> {
        const data = { id: entity.id, data: entity }

        await this.tx.execute`insert into ${sql.ident(this.table)} ${sql.insert<Row<T>>(data)}`

        return entity as Mutable<T>
    }

    async getByID(id: ID<T>): Promise<T | null> {
        const [row] = await this.tx.query<DataRow<T>>`select data from ${sql.ident(this.table)} where id = ${id}`

        return row?.data ?? null
    }

    async getByIDForUpdate(id: ID<T>): Promise<Mutable<T> | null> {
        const [ row ] = await this.tx.query<DataRow<T>>`
            select data from ${sql.ident(this.table)} 
            where id = ${id} for update`

        return row?.data as Mutable<T> ?? null
    }
}


export class UserRepository extends Repository<User> implements IUserRepository {
    override table: string = 'users'

    async existsByEmail(email: Email): Promise<boolean> {
        const [ row ] = await this.tx.query`select 1 from users where data->>'email' = ${email}`

        return !!row
    }

    async getByEmail(email: Email): Promise<User | null> {
        const [ row ] = await this.tx.query<DataRow<User>>`select data from users where data->>'email' = ${email}`

        return row?.data ?? null
    }
}

export class SessionRepository extends Repository<Session> implements ISessionRepository {
    override table: string = "sessions"
}

export class IngredientRepository extends Repository<Ingredient> implements IIngredientRepository {
    override table: string = "ingredients"
}

export class ProductRepository extends Repository<Product> implements IProductRepository {
    override table: string = "products"
}

export class OrderRepository extends Repository<Order> implements IOrderRepository {
    override table: string = "orders"

    async hasOpenedByUser(user: User): Promise<boolean> {
        const [ row ] = await this.tx.query`
            select 1 from orders 
            where data->>'userId' = ${user.id} 
            and data->>'closed' = 'false'` 

        return !!row
    }

    async getOpenedByUserForUpdate(user: User): Promise<Mutable<Order> | null> {
        const [ row ] = await this.tx.query<DataRow<Order>>`
            select data from orders 
            where data->>'userId' = ${user.id} 
            and data->>'closed' = 'false'
            for update` 

        return row?.data as Mutable<Order> ?? null
    }
}