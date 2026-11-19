import { api } from "@/shared/api";
import type { Order } from "domain/order";
import type { Product } from "domain/product";
import type { Track } from "server/applications/usecases/queries/get-track";


export const trackApi = {
    getTrack: () => api.get<Track>('/track'),
    pickUp: () => api.post('/pick-up')
}