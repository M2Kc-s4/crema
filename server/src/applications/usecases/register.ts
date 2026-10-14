import { Email, PlainPassword, User, UserRole } from "domain/user"
import type { IPasswordHasher } from "../ports/password-hasher"
import type { ITransactionManager } from "../ports/persistance"

type Command = {
    email: string
    password: string
    role: string
}

export function registerUseCase(cmd: Command, txm: ITransactionManager, hasher: IPasswordHasher) {
    const email = Email(cmd.email)
    const password = PlainPassword(cmd.password)
    const role  = UserRole(cmd.role)

    return txm.begin(async uow => {
        const hashed = await hasher.hash(password)

        const user = User(email, hashed, role)

        await uow.user.create(user)

        return user
    })
}