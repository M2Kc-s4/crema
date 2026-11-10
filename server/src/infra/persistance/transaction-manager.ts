import type { Pool } from "@m2k-5f/pgtx"
import { IngredientRepository, OrderRepository, ProductRepository, SessionRepository, UserRepository } from "./write-repository"
import type { ITransactionManager, ITransactionWorkUnit } from "@/applications/ports/ipersistance"

export class TransactionManager implements ITransactionManager {
    constructor(
        private readonly pool: Pool
    ) {}

    begin<T>(func: (uow: ITransactionWorkUnit) => Promise<T>) {
        return this.pool.begin(tx => func({
            user: new UserRepository(tx),
            session: new SessionRepository(tx),
            ingredient: new IngredientRepository(tx),
            product: new ProductRepository(tx),
            order: new OrderRepository(tx)
        }))
    }
}