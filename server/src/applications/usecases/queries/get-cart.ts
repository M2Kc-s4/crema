import type { IReader } from "@/applications/ports/ipersistance"
import { Loyalty } from "domain/loyalty"
import { OrderItem } from "domain/order"
import type { Product } from "domain/product"
import { ErrNotFound, ID, Price } from "domain/shared"
import type { CartItem, User } from "domain/user"

type Command = {
    userId: string
}

export type Cart = {
    items: [CartItem, Product][]
    subtotal: number
    discount: Price
    total: number
    untilNextFree: number
}

export async function getCartUseCase(cmd: Command, reader: IReader): Promise<Cart> {
    const userId = ID<User>(cmd.userId)

    const user = await reader.users.getByID(userId)
    if (!user) throw ErrNotFound

    const items: [CartItem, Product][] = []
    const orderItems: OrderItem[] = []

    for (const cartItem of user.cart) {
        const product = await reader.products.getByID(cartItem.productId)
        if (!product) throw ErrNotFound

        items.push([cartItem, product])
        orderItems.push(OrderItem(product, cartItem))
    }

    const pastOrders = await reader.orders.listByUser(user)
    const cupsBefore = Loyalty.countCups(pastOrders)

    const subtotal = orderItems.reduce((sum, i) => sum + i.unitPrice * i.qty, 0)
    const discount = Loyalty.calculateDiscount(orderItems, cupsBefore)

    return {
        items,
        subtotal,
        discount,
        total: subtotal - discount,
        untilNextFree: Loyalty.untilNextFree(cupsBefore + Loyalty.countCupsIn(orderItems)),
    }
}