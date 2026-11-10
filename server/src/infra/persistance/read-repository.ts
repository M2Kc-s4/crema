import { ID } from "domain/shared";
import type { EntityWithID, IIngredientReadPerository, IOrderReadPerository, IProductReadPerository, IReader, IReadRepository, ISessionReadPerository, IUserReadPerository } from "../../applications/ports/ipersistance";
import { sql, type Pool } from "@m2k-5f/pgtx";
import type { DataRow } from "./write-repository";
import type { User } from "domain/user";
import type { Session } from "domain/session";
import type { Product } from "domain/product";
import { Ingredient } from "domain/ingridient";
import type { Order } from "domain/order";

abstract class ReadRepository<TEntity extends EntityWithID> implements IReadRepository<TEntity> {
    abstract table: string

    constructor(protected pool: Pool) {}

    async getByID(id: ID<TEntity>): Promise<TEntity | null> {
        const [ row ] = await this.pool.query<DataRow<TEntity>>`
            select data from ${sql.ident(this.table)} where id = ${id}`

        return row ? row.data : null
    }

    async getByIds(ids: ID<TEntity>[]): Promise<TEntity[]> {
        const rows = await this.pool.query<DataRow<TEntity>>`
            select data from ${sql.ident(this.table)} where id = any(${ids})`

        return rows.map(r => r.data)
    }

    async getAll(): Promise<TEntity[]> {
        const rows = await this.pool.query<DataRow<TEntity>>`
            select data from ${sql.ident(this.table)}`

        return rows.map(r => r.data)
    }
}

class UserReadRepository extends ReadRepository<User> implements IUserReadPerository {
    table = 'users'
}

class SessionReadRepository extends ReadRepository<Session> implements ISessionReadPerository {
    table = 'sessions'
}

class ProductReadRepository extends ReadRepository<Product> implements IProductReadPerository {
    table = 'products'
}

class IngredientReadRepository extends ReadRepository<Ingredient> implements IIngredientReadPerository {
    table = 'ingredients'
}

class OrderReadRepository extends ReadRepository<Order> implements IOrderReadPerository {
    table = 'orders'
    
    async getOpenedByUser(user: User): Promise<Order | null> {
        const [ row ] = await this.pool.query<DataRow<Order>>`
            select data from orders
            where data->>'closed' = 'false'
            and data ->>'userId' = ${user.id}`

        return row?.data ?? null
    }
    
    async getAllOpened(): Promise<Order[]> {
        const rows = await this.pool.query<DataRow<Order>>`
            select data from orders
            where data->>'closed' = 'false'`
        
        return rows.map(r => r.data)
    }
}

export class Reader implements IReader {
    users: IUserReadPerository;
    sessions: ISessionReadPerository;
    products: IProductReadPerository;
    ingreduents: IIngredientReadPerository;
    orders: IOrderReadPerository;

    constructor(pool: Pool) {
        this.users = new UserReadRepository(pool)
        this.sessions = new SessionReadRepository(pool)
        this.products = new ProductReadRepository(pool)
        this.ingreduents = new IngredientReadRepository(pool)
        this.orders = new OrderReadRepository(pool)
    }
}