import type { IReader } from "@/applications/ports/ipersistance"
import { ErrNotFound, ID } from "domain/shared"
import type { User } from "domain/user"

type Command = {
    userId: string
}

export async function getOrderHistoryUseCase(cmd: Command, reader: IReader) {
    const userId = ID<User>(cmd.userId)

    const user = await reader.users.getByID(userId)
    if (!user) throw ErrNotFound

    const orders = await reader.orders.listByUser(user)

    return [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}