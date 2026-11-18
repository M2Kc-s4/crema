import { api } from "@/shared/api";
import type { Statistics } from "server/applications/usecases/queries/get-stats";

export const statsApi = {
    getStats: () => api.get<Statistics>('/stats')
}