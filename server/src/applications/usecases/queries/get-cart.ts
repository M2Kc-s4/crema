import type { IReader } from "@/applications/ports/ipersistance"
import type { Product } from "domain/product"
import { ErrNotFound, ID } from "domain/shared"
import type { CartItem, User } from "domain/user"

type Command = {
    userId: string
}

export async function getCartUseCase(cmd: Command, reader: IReader) {
    const userId = ID<User>(cmd.userId)

    const user = await reader.users.getByID(userId)
    if (!user) throw ErrNotFound

    const result: [CartItem, Product][] = []

    for (const cartItem of user.cart) {
        const product = await reader.products.getByID(cartItem.productId)
        if (!product) throw ErrNotFound

        result.push([cartItem, product])
    }

    return result
}