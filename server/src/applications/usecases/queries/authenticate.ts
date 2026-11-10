import type { ITokenSigner } from "@/applications/ports/itoken-signer"
import { ErrUnauthorized } from "@/error"

type Command = {
    token: string
}

export async function authenticateUseCase(cmd: Command, signer: ITokenSigner) {
    try {
        return await signer.verifyAccess(cmd.token)
    } catch {
        throw ErrUnauthorized
    }
}