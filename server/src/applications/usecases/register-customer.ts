import { DomainError } from "domain/error"
import type { IPasswordHasher } from "../ports/password-hasher"
import type { ITransactionManager } from "../ports/persistance"
import { Customer, Email, PlainPassword } from "domain/user"

export const ErrUserExists = new DomainError("Пользователь с таким Email уже существует")

type CMD = {
    email: string
    password: string
}

export async function registerCustomer(cmd: CMD, txm: ITransactionManager, hasher: IPasswordHasher) {
    return txm.begin(async uow => {
        const email = Email(cmd.email)

        const exists = await uow.user.existsByEmail(email)
        if (exists) throw ErrUserExists

        const plainPassword = PlainPassword(cmd.password)

        const hashedPassword = await hasher.hash(plainPassword)

        const customer = Customer(email, hashedPassword)

        await uow.user.save(customer)

        return {
            id: customer.id
        }
    })
}