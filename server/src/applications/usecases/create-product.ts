import { Category, IngredientUsage, Option, Product, Variant } from "domain/product";
import type { ITransactionManager } from "../ports/persistance";
import { ID, Name, Price, Quantity } from "domain/shared";

type Cmd = {
    name:  string
    price: number
    category: string
    options: {
        name: string
        variants: {
            name: string
            priceDelta: number
            uses: {
                ingridientId: string
                amount: number
            }[]
        }[]
    }[]
}

export async function createProductUseCase(cmd: Cmd, txm: ITransactionManager) {
    return txm.begin(async uow => {
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
                                    ID(u.ingridientId), 
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