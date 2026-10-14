import { ErrNotFound, ID } from "domain/shared";
import type { ITransactionManager } from "../ports/persistance";
import { User } from "domain/user";
import { Order, OrderItem } from "domain/order";

type Command = {
    userId: string
}

export function placeOrderUseCase(cmd: Command, txm: ITransactionManager) {
    const userId = ID<User>(cmd.userId)

    return txm.begin(async uow => {
        const user = await uow.user.getByIDForUpdate(userId)

        if (!user) throw ErrNotFound

        User.assertCartNotEmpty(user)

        const orderItems: OrderItem[] = []

        for (const item of user.cart) {
            const product = await uow.product.getByID(item.productId)

            if (!product) throw ErrNotFound

            orderItems.push(
                OrderItem(product, item)
            )
        }

        const order = Order(user, orderItems)

        User.clearCart(user)

        await uow.user.save(user)
        await uow.order.save(order)

        return order
    })
}