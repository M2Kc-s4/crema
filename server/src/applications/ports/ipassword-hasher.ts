import type { HashedPassword, PlainPassword } from "domain/user"

export interface IPasswordHasher {
    hash(pasword: PlainPassword): Promise<HashedPassword>
    verify(plain: PlainPassword, hash: HashedPassword): Promise<boolean>
}