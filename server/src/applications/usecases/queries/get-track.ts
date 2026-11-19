import type { IReader } from "@/applications/ports/ipersistance"
import type { Order } from "domain/order"
import type { Product } from "domain/product"
import { ErrNotFound, ID } from "domain/shared"
import type { User } from "domain/user"

type Command = {
    userId: string
}

export type Track = {
    order: Order | null
}

export async function getTrackUseCase(cmd: Command, reader: IReader): Promise<Track> {
    const userId = ID<User>(cmd.userId)

    const user = await reader.users.getByID(userId)
    if (!user) throw ErrNotFound

    const order = await reader.orders.getOpenedByUser(user)
    if (!order) return { order: null }

    return {
        order
    }
}