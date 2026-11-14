import { ErrNotFound, ID, Quantity } from "domain/shared"
import { CartItem, ErrBarmanCart, User } from "domain/user"
import { Product, type Option, type Variant } from "domain/product"
import { fromEntries, getEntries } from "domain/lib"
import type { ITransactionManager } from "@/applications/ports/ipersistance"

type Command = { 
    userId: string, 
    productId: string, 
    qty: number, 
    options: Record<string, string> 
}

export function addToCartUseCase(cmd: Command, txm: ITransactionManager) {
    const userId = ID<User>(cmd.userId)
    const productId = ID<Product>(cmd.productId)
    const qty = Quantity(cmd.qty)

    const options = fromEntries(
        getEntries(cmd.options).map(e => 
            [ID<Option>(e[0]), ID<Variant>(e[1])]
        )
    )
    
    return txm.begin(async uow => {
        const user = await uow.user.getByIDForUpdate(userId)

        if (!user) throw ErrNotFound

        // if (!User.isCustomer(user)) throw ErrBarmanCart

        const product = await uow.product.getByID(productId)

        if (!product) throw ErrNotFound
        
        Product.assertSelectionValid(product, options)

        User.addToCart(
            user, product, 
            qty, options
        )

        await uow.user.save(user)

        return product
    })
}