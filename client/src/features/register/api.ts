import { api } from "@/shared/api";
import type { RegisterRequest } from "server/presentation/user";

export const registerApi = {
    register: (data: RegisterRequest) => api.post('/users', data)
}