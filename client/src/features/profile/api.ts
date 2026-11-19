import { api } from "@/shared/api";
import type { Profile } from "server/applications/usecases/queries/get-profile";

export const profileApi = {
    getProfile: () => api.get<Profile>('/me/profile'),
    revokeSession: (sessionId: string) => api.post(`/sessions/${sessionId}/revoke`) 
}