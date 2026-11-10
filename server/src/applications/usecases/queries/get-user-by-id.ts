import type { IReader } from "@/applications/ports/ipersistance"
import { ErrNotFound, ID } from "domain/shared"
import { PASSWORD_HASH_PLACEHOLDER, type User } from "domain/user"

type Command = {
    userId: string
}

export async function getUserByIdUseCase(cmd: Command, reader: IReader) {
    const userId = ID<User>(cmd.userId)

    const user = await reader.users.getByID(userId)
    if (!user) throw ErrNotFound

    user.hashedPassword = PASSWORD_HASH_PLACEHOLDER

    return user
}