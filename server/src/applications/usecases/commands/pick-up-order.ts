import type { User } from "domain/user"
import { Order } from "domain/order"
import { ErrNotFound, ID } from "domain/shared"
import type { ITransactionManager } from "@/applications/ports/ipersistance"

type Command = {
    userId: string
    
}


export function pickUpOrderUseCase(cmd: Command, txm: ITransactionManager) {
    const userId = ID<User>(cmd.userId)

    return txm.begin(async uow => {
        const user = await uow.user.getByID(userId)
        if (!user) throw ErrNotFound

        const order = await uow.order.getOpenedByUserForUpdate(user)

        if (!order) throw ErrNotFound

        Order.pickUp(order)

        Order.close(order)

        await uow.order.save(order)

        return order
    })
}