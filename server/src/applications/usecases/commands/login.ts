import { Email, ErrAuthFailed, PlainPassword } from "domain/user"
import { Device, Session } from "domain/session"
import type { ITransactionManager } from "@/applications/ports/ipersistance"
import type { IPasswordHasher } from "@/applications/ports/ipassword-hasher"
import type { ITokenSigner } from "@/applications/ports/itoken-signer"

type Command = {
    email: string
    password: string
    device: string
}

export function loginUseCase(cmd: Command, txm: ITransactionManager, hasher: IPasswordHasher, signer: ITokenSigner) {
    const email = Email(cmd.email)
    const password = PlainPassword(cmd.password)
    const device = Device(cmd.device)

    return txm.begin(async uow => {
        const user = await uow.user.getByEmail(email)
        if (!user) throw ErrAuthFailed

        const ok = await hasher.verify(password, user.hashedPassword)

        if (!ok) throw ErrAuthFailed

        const session = await uow.session.create(
            Session(user, device)
        )

        const refresh = await signer.signRefresh(session)
        const access = await signer.signAccess(user)

        Session.issue(session, refresh)

        await uow.session.save(session)

        return {
            session,
            access,
            refresh
        }
    })
}