import type { IReader } from "@/applications/ports/ipersistance"
import type { Product } from "domain/product"
import { ErrNotFound, ID } from "domain/shared"
import type { User } from "domain/user"

type Command = {
    userId: string
}

export async function getTrackUseCase(cmd: Command, reader: IReader) {
    const userId = ID<User>(cmd.userId)

    const user = await reader.users.getByID(userId)
    if (!user) throw ErrNotFound

    const order = await reader.orders.getOpenedByUser(user)
    if (!order) return { order: null }

    const products: Product[] = []

    for (const item of order.items) {
        const product = await reader.products.getByID(item.productId)
        if (!product) throw ErrNotFound

        products.push(product)
    }

    return {
        order, products
    }
}