import { api } from "@/shared/api";
import type { Ingredient } from "domain/ingridient";
import type { Product } from "domain/product";
import type { CreateIngredientRequest, CreateProductRequest, RestockRequest } from "server/presentation/stock";

type Stock = {
    ingredients: Ingredient[],
    products: Product[]
}

export const stockApi = {
    getStock: () => api.get<Stock>(`/stock`),
    createIngredient: (data: CreateIngredientRequest) => api.post('/ingredients', data),
    restockIngredient: (data: RestockRequest) => api.post("/restock", data),
    createProduct: (data: CreateProductRequest) => api.post("/products", data),
    getIngredients: () => api.get<Ingredient[]>('/ingredients')
}