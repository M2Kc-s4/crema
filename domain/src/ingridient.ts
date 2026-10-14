import { DomainError } from "./error";
import type { Branded, Mutable } from "./lib";
import { ID, Name, Quantity } from "./shared";


export const ErrOutOfStock = new DomainError("Недостаточно ингридиента")

export type Ingredient = {
    id: ID<Ingredient>
    name: Name
    stock: Quantity
}

export function Ingredint(name: Name, stock: Quantity): Ingredient {
    return { id: ID.generate(), name, stock }
}

export namespace Ingredint {
    export function consume(ingredient: Mutable<Ingredient>, qty: Quantity) {
        ingredient.stock = Quantity(ingredient.stock - qty)
    }

    export function restock(ingredient: Mutable<Ingredient>, qty: Quantity) {
        ingredient.stock = Quantity(ingredient.stock + qty)
    }
}


