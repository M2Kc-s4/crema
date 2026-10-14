import { DomainError } from "domain/error"
import type { IPasswordHasher } from "../ports/password-hasher"
import type { ITransactionManager } from "../ports/persistance"
import type { ITokenSigner } from "../ports/token-signer"
import { Email, PlainPassword } from "domain/user"
import { Session } from "domain/session"


type Cmd = {
    email: string
    password: string
}

export async function authenticate(cmd: Cmd, txm: ITransactionManager, hasher: IPasswordHasher, signer: ITokenSigner) {
    const email = Email(cmd.email)
    const plain = PlainPassword(cmd.password)

    return txm.begin(async uow => {
        const user = await uow.user.getByEmail(email)

        if (!user) throw ErrAuthFailed

        const ok = await hasher.verify(plain, user.passwordHash)
        if (!ok) throw ErrAuthFailed

        const session = Session(user.id)

        const refresh = await signer.signRefresh(session)

        Session.updateSessionToken(session, refresh)

        await uow.session.save(updatedSession)

        const access = await signer.signAccess(user)

        return {
            id: user.id,
            refresh,
            access
        }
    })
}