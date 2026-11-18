import type { IReader } from "@/applications/ports/ipersistance"
import { ErrNotFound, ID } from "domain/shared"
import { ErrForbidden, User } from "domain/user"

type Command = {
    userId: string
}

export async function getStockUseCase(cmd: Command, reader: IReader) {
    const userId = ID<User>(cmd.userId)
    const user = await reader.users.getByID(userId)

    if (!user) throw ErrNotFound

    if (!User.isBarman(user)) throw ErrForbidden

    const products = await reader.products.getAll()
    const ingredients = await reader.ingredients.getAll()

    return { products, ingredients }
}