import type { ITransactionManager } from "@/applications/ports/ipersistance"
import { Ingredient } from "domain/ingridient"
import { ErrNotFound, ID, Quantity } from "domain/shared"
import { ErrForbidden, User } from "domain/user"

type Command = {
    userId: string
    ingredientId: string
    qty: number
}

export function restockIngridientUseCase(cmd: Command, txm: ITransactionManager) {
    const barmanId = ID<User>(cmd.userId)
    const ingredientId = ID<Ingredient>(cmd.ingredientId)
    const qty = Quantity(cmd.qty)

    return txm.begin(async uow => {
        const barman = await uow.user.getByID(barmanId)

        if (!barman) throw ErrNotFound

        if (!User.isBarman(barman)) throw ErrForbidden

        const ingredient = await uow.ingredient.getByIDForUpdate(ingredientId)

        if (!ingredient) throw ErrNotFound

        Ingredient.restock(ingredient, qty)

        await uow.ingredient.save(ingredient)

        return ingredient
    })
}