import { api } from "@/shared/api";
import type { Order } from "domain/order";
import type { Product } from "domain/product";

type Track = {
    order: Order
    products: Product[]
} | { order: null }

export const trackApi = {
    getTrack: () => api.get<Track>('/track'),
    pickUp: () => api.post('/pick-up')
}