import { User } from "domain/user"
import type { ITransactionManager } from "../ports/persistance"
import { ErrNotFound, ID } from "domain/shared"

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