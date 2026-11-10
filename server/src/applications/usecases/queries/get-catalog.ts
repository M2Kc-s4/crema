import type { IReader } from "@/applications/ports/ipersistance";

export async function getCatalogUseCase(reader: IReader) {
    const products = await reader.products.getAll()

    return products
}