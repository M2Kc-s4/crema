import { api } from "@/shared/api";
import type { Order } from "domain/order";

export const orderHistoryApi = {
    getOrderHistory: () => api.get<Order[]>('/orders/history')
}