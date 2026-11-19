import { api } from "@/shared/api";
import type { Product } from "domain/product";
import type { CartItem } from "domain/user";
import type { Cart } from "server/applications/usecases/queries/get-cart";
import type { AddToCartRequest, RemoveFromCardRequest } from "server/presentation/cart";


export const cartApi = {
    getCart: () => api.get<Cart>('/me/cart'),
    addToCart: (data: AddToCartRequest) => api.post('/me/cart/add', data),
    placeOrder: () => api.post('/me/cart/place'),
    removeFromCard: (data: RemoveFromCardRequest) => api.post('/me/cart/remove', data)
}