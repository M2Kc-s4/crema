import type { IPasswordHasher } from "@/applications/ports/ipassword-hasher";
import type { PlainPassword, HashedPassword } from "domain/user";

export class PasswordHasher implements IPasswordHasher {
    async hash(pasword: PlainPassword): Promise<HashedPassword> {
        const hash = await Bun.password.hash(pasword)
        return hash as HashedPassword
    }

    verify(plain: PlainPassword, hash: HashedPassword): Promise<boolean> {
        return Bun.password.verify(plain, hash)
    }
}