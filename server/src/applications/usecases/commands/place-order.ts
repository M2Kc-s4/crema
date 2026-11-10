import { ErrNotFound, ID } from "domain/shared";
import { User } from "domain/user";
import { ErrParallelOrders, Order, OrderItem } from "domain/order";
import { Product } from "domain/product";
import { getEntries } from "domain/lib";
import { Ingredient } from "domain/ingridient";
import type { ITransactionManager } from "@/applications/ports/ipersistance";

type Command = {
    userId: string
}

export function placeOrderUseCase(cmd: Command, txm: ITransactionManager) {
    const userId = ID<User>(cmd.userId)

    return txm.begin(async uow => {
        const user = await uow.user.getByIDForUpdate(userId)

        if (!user) throw ErrNotFound

        User.assertCartNotEmpty(user)

        const orderExists = await uow.order.hasOpenedByUser(user)

        if (orderExists) throw ErrParallelOrders

        const orderItems: OrderItem[] = []

        for (const item of user.cart) {
            const product = await uow.product.getByID(item.productId)

            if (!product) throw ErrNotFound
            
            const ingredients = Product.calculateIngridientUsage(product, item.options, item.qty)            

            for (const [ingredientId, qty] of getEntries(ingredients)) {
                const ingredient = await uow.ingredient.getByIDForUpdate(ingredientId)
                if (!ingredient) throw ErrNotFound
                
                Ingredient.consume(ingredient, qty)

                await uow.ingredient.save(ingredient)
            }

            orderItems.push(
                OrderItem(product, item)
            )

        }

        const order = Order(user, orderItems)

        User.clearCart(user)

        await uow.user.save(user)
        await uow.order.create(order)

        return order
    })
}