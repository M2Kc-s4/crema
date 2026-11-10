import type { User, UserRole } from "domain/user"
import type { ITokenSigner } from "../../applications/ports/itoken-signer"
import { KeyObject } from 'crypto'
import { jwtVerify, SignJWT } from 'jose'
import type { AccessToken, RefreshToken, Session } from "domain/session"
import type { ID } from "domain/shared"

export class TokenSigner implements ITokenSigner {
    constructor(
        private accessPub: KeyObject,
        private accessPri: KeyObject,
        private refreshPub: KeyObject,
        private refreshPri: KeyObject,
    ) {}

    async signAccess(user: User) {
        const token = await new SignJWT()
        .setProtectedHeader({ alg: 'ES256' })
        .setSubject(user.id)
        .setExpirationTime(Bun.env.ACCESS_TTL ?? '15m')
        .setIssuedAt()
        .sign(this.accessPri)

        return token as AccessToken
    }

    async signRefresh(session: Session) {
        const token = await new SignJWT()
        .setProtectedHeader({ alg: 'ES256' })
        .setIssuedAt()
        .setExpirationTime(Bun.env.SESSION_TTL ?? '30d')
        .setSubject(session.id)
        .sign(this.refreshPri)

        return token as RefreshToken
    }

    async verifyAccess(access: AccessToken): Promise<ID<User>> {
        const result = await jwtVerify<{ sub: ID<User> }>(access, this.accessPub)
    
        return result.payload.sub
    }

    async verifyRefresh(refresh: string): Promise<ID<Session>> {
        const result = await jwtVerify<{ sub: ID<Session> }>(refresh, this.refreshPub)

        return result.payload.sub
    }
}