import { User } from "domain/user"
import { ErrNotFound, ID } from "domain/shared"
import type { ITransactionManager } from "@/applications/ports/ipersistance"

type Command = {
    userId: string
}


export function clearCartUseCase(cmd: Command, txm: ITransactionManager) {
    const userId = ID<User>(cmd.userId)

    return txm.begin(async uow => {
        const user = await uow.user.getByIDForUpdate(userId)

        if (!user) throw ErrNotFound

        User.clearCart(user)

        await uow.user.save(user)
    })
}