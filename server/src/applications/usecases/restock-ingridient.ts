import { ErrNotFound, ID, Quantity } from "domain/shared"
import type { ITransactionManager } from "../ports/persistance"
import { ErrForbidden, User } from "domain/user"
import { Ingredint, type Ingredient } from "domain/ingridient"

type Command = {
    barmanId: string
    ingredientId: string
    qty: number
}

export function restockIngridientUseCase(cmd: Command, txm: ITransactionManager) {
    const barmanId = ID<User>(cmd.barmanId)
    const ingredientId = ID<Ingredient>(cmd.ingredientId)
    const qty = Quantity(cmd.qty)

    return txm.begin(async uow => {
        const barman = await uow.user.getByID(barmanId)

        if (!barman) throw ErrNotFound

        if (!User.isBarman(barman)) throw ErrForbidden

        const ingredient = await uow.ingredient.getByIDForUpdate(ingredientId)

        if (!ingredient) throw ErrNotFound

        Ingredint.restock(ingredient, qty)

        await uow.ingredient.save(ingredient)

        return ingredient
    })
}