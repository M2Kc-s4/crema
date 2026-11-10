import { api } from "@/shared/api";
import type { Product } from "domain/product";
import type { CartItem } from "domain/user";
import type { AddToCartRequest } from "server/presentation/cart";

type Cart = [CartItem, Product][]

export const cartApi = {
    getCart: () => api.get<Cart>('/cart'),
    addToCart: (data: AddToCartRequest) => api.post('/me/add-to-cart', data),
    placeOrder: () => api.post('/me/place-order')
}