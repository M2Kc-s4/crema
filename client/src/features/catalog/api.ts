import { api } from "@/shared/api";
import { Product } from "domain/product";
import type { AddToCartRequest } from "server/presentation/cart";

export const menuApi = {
    getProductCatalog: () => api.get<Product[]>('/catalog')
}