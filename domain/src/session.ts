import { DomainError } from "./error"
import type { Branded, Mutable } from "./lib"
import { ID } from "./shared"
import { User } from "./user"



export const ErrInvalidRefreshToken = new DomainError("Недействительный refresh-токен")
export const ErrStaleRefreshToken =  new DomainError("Refresh-токен устарел")


export type RefreshToken = Branded<string, "RefreshToken">

export type AccessToken = Branded<string, "AccessToken">

export type Session = {
    id: ID<Session>
    userId: ID<User>
    currentRefresh: RefreshToken | null
}



export function RefreshToken(string: string) {
    return string as RefreshToken
}

export function AccessToken(string: string) {
    return string as AccessToken
}

export function Session(user: User): Session {
    return { id: ID.generate(), userId: user.id, currentRefresh: null}
}


export namespace Session {
    export function updateSessionToken(session: Mutable<Session>, newToken: RefreshToken) {
        session.currentRefresh = newToken
    }

    export function assertSessionToken(session: Session, refresh: RefreshToken) {
        if (session.currentRefresh !== refresh) throw ErrStaleRefreshToken
    }
}
