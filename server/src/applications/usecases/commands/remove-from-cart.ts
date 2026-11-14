import type { ITransactionManager } from "@/applications/ports/ipersistance"
import { ErrNotFound, ID } from "domain/shared"
import { User, type CartItem } from "domain/user"

type CMD = {
    userId: string,
    cartItemId: string
}

export function removeFromCardUseCase(cmd: CMD, txm: ITransactionManager) {
    const userId = ID<User>(cmd.userId)
    const cartItemId = ID<CartItem>(cmd.cartItemId)

    return txm.begin(async uow => {
        const user = await uow.user.getByIDForUpdate(userId)

        if (!user) throw ErrNotFound

        User.removeFromCart(user, cartItemId)

        await uow.user.save(user)

        return { user }
    })
}