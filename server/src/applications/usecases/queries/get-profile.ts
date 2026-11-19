import type { IReader } from "@/applications/ports/ipersistance"
import type { Order } from "domain/order"
import type { Product } from "domain/product"
import { Session } from "domain/session"
import { ErrNotFound, ID, Quantity } from "domain/shared"
import { type User } from "domain/user"
import { Bind } from "fluent-future"


type Command = {
    userId: string
}

export type Profile = {
    orders: Order[];
    totalSpent: number;
    favorite: Product | null;
    sessions: Session[]
}


export async function getProfileUseCase(cmd: Command, reader: IReader): Promise<Profile> {
    const userId = ID<User>(cmd.userId)

    const user = await reader.users.getByID(userId)
    if (!user) throw ErrNotFound

    const { sessions, orders } = await Bind({
        orders: reader.orders.listByUser(user),
        sessions: reader.sessions.listByUser(user)
    })

    const favoriteId = findFavorite(orders)
    const favorite = favoriteId && await reader.products.getByID(favoriteId)

    const totalSpent = orders.reduce((sum, o) => sum + o.total, 0)

    return {
        orders: orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        totalSpent,
        favorite,
        sessions: sessions.sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt)).filter(Session.isActive),
    }
}


function findFavorite(orders: Order[]): ID<Product> | null {
    const byProduct = new Map<ID<Product>,  { qty: Quantity, id: ID<Product>}>()

    for (const order of orders) {
        for (const item of order.items) {
            let favorite = byProduct.get(item.productId) 
                ?? {qty: Quantity(0), id: item.productId}

            favorite.qty = Quantity(favorite.qty + item.qty)

            byProduct.set(item.productId, favorite)
        }
    }


    return [...byProduct.values()].sort((a, b) => b.qty - a.qty)[0]?.id ?? null
}
