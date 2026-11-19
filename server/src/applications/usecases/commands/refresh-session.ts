import { RefreshToken, Session } from "domain/session"
import type { ITokenSigner } from "../../ports/itoken-signer"
import { ErrNotFound } from "domain/shared"
import type { ITransactionManager } from "@/applications/ports/ipersistance"

type Command = {
    refreshToken: string
}

export async function refreshSessionUseCase(cmd: Command, txm: ITransactionManager, signer: ITokenSigner) {
    const oldRefresh = RefreshToken(cmd.refreshToken)

    const sessionID = await signer.verifyRefresh(oldRefresh)

    return txm.begin(async uow => {
        const session = await uow.session.getByIDForUpdate(sessionID)
        if (!session) throw ErrNotFound

        Session.assertActive(session)

        const user = await uow.user.getByID(session.userId)
        if (!user) throw ErrNotFound

        const refresh = await signer.signRefresh(session)

        Session.rotate(session, oldRefresh, refresh)

        const access = await signer.signAccess(user)

        await uow.session.save(session)

        return {
            session,
            access,
            refresh
        }
    })
}
