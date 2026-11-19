import type { ITransactionManager } from "@/applications/ports/ipersistance"
import { Session } from "domain/session"
import { ErrNotFound, ID } from "domain/shared"
import type { User } from "domain/user"


type Command = {
    userId: string
    sessionId: string
}

export function revokeSessionUseCase(cmd: Command, txm: ITransactionManager) {
    const userId = ID<User>(cmd.userId)
    const sessionId = ID<Session>(cmd.sessionId)

    return txm.begin(async uow => {
        const session = await uow.session.getByIDForUpdate(sessionId)
        if (!session) throw ErrNotFound

        const user = await uow.user.getByID(userId)
        if (!user) throw ErrNotFound

        Session.assertOwnedBy(session, user)
        Session.revoke(session)

        await uow.session.save(session)

        return session
    })
}