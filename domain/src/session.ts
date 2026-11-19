import { DomainError } from "./error"
import type { Branded, Mutable } from "./lib"
import { ErrNotFound, ID, Time } from "./shared"
import { User } from "./user"



export const ErrInvalidRefreshToken = new DomainError("Недействительный refresh-токен")
export const ErrStaleRefreshToken =  new DomainError("Refresh-токен устарел")
export const ErrSessionRevoked = new DomainError("Сессия завершена")
export const ErrRefreshAlreadyIssued = new DomainError("Refresh-токен уже выдан")

export type RefreshToken = Branded<string, "RefreshToken">

export type AccessToken = Branded<string, "AccessToken">

export type Device = Branded<string, "Device">

export type Session = {
    id: ID<Session>
    userId: ID<User>
    currentRefresh: RefreshToken | null
    device: Device
    lastActiveAt: Time
}



export function RefreshToken(string: string) {
    return string as RefreshToken
}

export function AccessToken(string: string) {
    return string as AccessToken
}

export function Device(string: string) {
    return string as Device
}

export function Session(user: User, device: Device): Session {
    return { id: ID.generate(), userId: user.id, device, currentRefresh: null, lastActiveAt: Time.now()}
}



export namespace Session {
    export function isActive(session: Session) {
        return session.currentRefresh !== null
    }

    export function assertActive(session: Session) {
        if (!isActive(session)) throw ErrSessionRevoked
    }

    export function isOwnedBy(session: Session, user: User) {
        return session.userId === user.id
    }

    export function assertOwnedBy(session: Session, user: User) {
        if (!isOwnedBy(session, user)) throw ErrNotFound
    }


    export function rotate(session: Mutable<Session>, presented: RefreshToken, next: RefreshToken) {
        assertActive(session)

        if (session.currentRefresh !== presented) throw ErrStaleRefreshToken

        session.currentRefresh = next
        session.lastActiveAt = Time.now()
    }

    export function revoke(session: Mutable<Session>) {
        if (!isActive(session)) throw ErrSessionRevoked

        session.currentRefresh = null
    }

    export function issue(session: Mutable<Session>, token: RefreshToken) {
        if (session.currentRefresh !== null) throw ErrRefreshAlreadyIssued

        session.lastActiveAt = Time.now()
        session.currentRefresh = token
    }
}
