import { Email, ErrAuthFailed, PlainPassword } from "domain/user"
import type { IPasswordHasher } from "../ports/password-hasher"
import type { ITransactionManager } from "../ports/persistance"
import type { ITokenSigner } from "../ports/token-signer"
import { Session } from "domain/session"

type Command = {
    email: string
    password: string
}

export function loginUseCase(cmd: Command, txm: ITransactionManager, hasher: IPasswordHasher, signer: ITokenSigner) {
    const email = Email(cmd.email)
    const password = PlainPassword(cmd.password)

    return txm.begin(async uow => {
        const user = await uow.user.getByEmail(email)
        if (!user) throw ErrAuthFailed

        const ok = await hasher.verify(password, user.hashedPassword)

        if (!ok) throw ErrAuthFailed

        const session = await uow.session.create(
            Session(user)
        )

        const refresh = await signer.signRefresh(session)
        const access = await signer.signAccess(user)

        Session.updateSessionToken(session, refresh)

        await uow.session.save(session)

        return {
            session,
            access,
            refresh
        }
    })
}