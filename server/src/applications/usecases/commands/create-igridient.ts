import type { ITransactionManager } from "@/applications/ports/ipersistance";
import { Ingredient } from "domain/ingridient";
import { ErrNotFound, ID, Name, Quantity } from "domain/shared";
import { ErrForbidden, User } from "domain/user";

type Command = {
    name: string
    userId: string
}

export function createIngredientUseCase(cmd: Command, txm: ITransactionManager) {
    const name = Name(cmd.name)
    const userId = ID<User>(cmd.userId)

    return txm.begin(async uow => {
        const user = await uow.user.getByID(userId)
        if (!user) throw ErrNotFound

        User.assertIsBarman(user)

        const ingredient = await uow.ingredient.create(
            Ingredient(name, Quantity(0))
        )

        return ingredient
    })
}