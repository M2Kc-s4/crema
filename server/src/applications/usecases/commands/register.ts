import type { IPasswordHasher } from "@/applications/ports/ipassword-hasher"
import type { ITransactionManager } from "@/applications/ports/ipersistance"
import { Email, ErrEmailExists, PlainPassword, User, UserRole } from "domain/user"

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
        const exists = await uow.user.existsByEmail(email)
        if (exists) throw ErrEmailExists

        const hashed = await hasher.hash(password)

        const user = User(email, hashed, role)

        await uow.user.create(user)

        return user
    })
}