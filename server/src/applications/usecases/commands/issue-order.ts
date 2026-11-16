import { ErrNotFound, ID } from "domain/shared"
import { ErrForbidden, User } from "domain/user"
import { Order } from "domain/order"
import type { ITransactionManager } from "@/applications/ports/ipersistance"

type Command = {
    userId: string
    orderId: string
}

export function issueOrderUseCase(cmd: Command, txm: ITransactionManager) {
    const userId = ID<User>(cmd.userId)
    const orderId = ID<Order>(cmd.orderId)

    return txm.begin(async uow => {
        const user = await uow.user.getByID(userId)

        if (!user) throw ErrNotFound

        User.assertIsBarman(user)

        const order = await uow.order.getByIDForUpdate(orderId)

        if (!order) throw ErrNotFound

        Order.issue(order)

        await uow.order.save(order)

        return order
    })
}