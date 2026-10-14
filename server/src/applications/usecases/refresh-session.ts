import { RefreshToken, Session } from "domain/session"
import type { ITransactionManager } from "../ports/persistance"
import type { ITokenSigner } from "../ports/token-signer"
import { ErrNotFound } from "domain/shared"

type Command = {
    refreshToken: string
}

export async function refreshSessionUseCase(cmd: Command, txm: ITransactionManager, signer: ITokenSigner) {
    const oldRefresh = RefreshToken(cmd.refreshToken)

    const sessionID = await signer.verifyRefresh(oldRefresh)

    return txm.begin(async uow => {
        const session = await uow.session.getByIDForUpdate(sessionID)
        if (!session) throw ErrNotFound

        Session.assertSessionToken(session, oldRefresh)

        const user = await uow.user.getByID(session.userId)
        if (!user) throw ErrNotFound

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
