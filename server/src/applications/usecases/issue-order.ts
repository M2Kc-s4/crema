import { ErrNotFound, ID } from "domain/shared"
import type { IRepository, ITransactionManager } from "../ports/persistance"
import { ErrForbidden, User } from "domain/user"
import { Order } from "domain/order"

type Command = {
    barmanId: string
    orderId: string
}

export function issueOrderUseCase(cmd: Command, txm: ITransactionManager) {
    const barmanId = ID<User>(cmd.barmanId)
    const orderId = ID<Order>(cmd.orderId)

    return txm.begin(async uow => {
        const barman = await uow.user.getByID(barmanId)

        if (!barman) throw ErrNotFound

        if (!User.isBarman(barman)) throw ErrForbidden

        const order = await uow.order.getByID(orderId)

        if (!order) throw ErrNotFound

        Order.issue(order)

        await uow.order.save(order)
    })
}