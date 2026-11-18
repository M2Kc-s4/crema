import type { IReader } from "@/applications/ports/ipersistance";

export async function getIngredientUseCase(reader: IReader) {
    const ingredients = await reader.ingredients.getAll()

    return ingredients
}