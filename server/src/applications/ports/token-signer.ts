import type { AccessToken, RefreshToken, Session } from "domain/session"
import type { ID } from "domain/shared"
import type { User, UserRole } from "domain/user"

export interface ITokenSigner {
    signRefresh(session: Session): Promise<RefreshToken>
    verifyRefresh(token: string): Promise<ID<Session>>
    signAccess(user: User): Promise<AccessToken>
    verifyAccess(token: string): Promise<ID<User>>
}