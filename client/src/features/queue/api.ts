import { api } from "@/shared/api";
import type { Order } from "domain/order";


export const queueApi = {
    getQueue: () => api.get<Order[]>('/queue'),
    issue: (orderId: string) => api.post(`/orders/${orderId}/issue`)
}