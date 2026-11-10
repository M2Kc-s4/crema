import type { ITransactionManager } from "@/applications/ports/ipersistance";
import { Category, IngredientUsage, Option, Product, Variant } from "domain/product";
import { ErrNotFound, ID, Name, Price, Quantity } from "domain/shared";
import { ErrForbidden, User } from "domain/user";

type Cmd = {
    userId: string
    name:  string
    price: number
    category: string
    options: {
        name: string
        variants: {
            name: string
            priceDelta: number
            uses: {
                ingredientId: string
                amount: number
            }[]
        }[]
    }[]
}

export async function createProductUseCase(cmd: Cmd, txm: ITransactionManager) {
    const userId = ID<User>(cmd.userId)
    
    return txm.begin(async uow => {
        const user = await uow.user.getByID(userId)
        if (!user) throw ErrNotFound

        if (!User.isBarman(user)) throw ErrForbidden

        const product = Product(
            Name(cmd.name), 
            Price(cmd.price),
            Category(cmd.category),
            cmd.options.map(o => 
                Option(
                    Name(o.name), 
                    o.variants.map(v => 
                        Variant(
                            Name(v.name), 
                            v.priceDelta, 
                            v.uses.map(u => 
                                IngredientUsage(
                                    ID(u.ingredientId), 
                                    Quantity(u.amount)
                                )
                            )
                        )
                    )
                )
            )
        )
        
        await uow.product.create(product)

        return product
    })
}