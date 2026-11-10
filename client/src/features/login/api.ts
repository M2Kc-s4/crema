import { api } from "@/shared/api";
import { AccessToken } from "domain/session";
import type { User } from "domain/user";
import type { LoginRequest } from "server/presentation/auth";

export const authApi = {
    getCurrentUser: () => api.get<User>('/me'),
    logout: () => api.post('/logout'),
    login: (data: LoginRequest) => api.post<AccessToken>('/login', data)
}