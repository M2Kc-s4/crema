import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { Begin, Future } from 'fluent-future';
import type { User } from "domain/user";
import { api, ApiError } from "@/shared/api";
import { useLoading } from "./loading-provider";
import { authApi } from "@/features/login/api";


type CurrentUserContextType = {
    user: User | null,
    updateCurrentUser: () => Future<User, ApiError>,
    logout: () => Future<void>
}


const CurrentUserContext = createContext<CurrentUserContextType | null>(null)


export default function CurrentUserProvider({children}: PropsWithChildren) {
    const [user, setUser] = useState<User | null>(null)
    const {toggleLoadingOff, toggleLoadingOn} = useLoading()
    

    const updateCurrentUser = () => Begin<ApiError>()
        .tap(toggleLoadingOn)
        .andThen(authApi.getCurrentUser)
        .tap(setUser)
        .tapErr(console.log)
        .finally(toggleLoadingOff)

    const logout = () => Begin<ApiError>()
        .tap(toggleLoadingOn)
        .andThen(authApi.logout)
        .tap(() => {
            setUser(null)
            api.removeAccess()
        })
        .finally(toggleLoadingOff)

    useEffect(() => {
        updateCurrentUser()
            .recover()
    }, [])


    const currentUserValue = useMemo(() => ({
        user,
        updateCurrentUser,
        logout,
    }), [user])

    return (
        <CurrentUserContext.Provider value={currentUserValue}>
            {children}
        </CurrentUserContext.Provider>
    )
}


export function useCurrentUser() {
    const ctx = useContext(CurrentUserContext)
    if (!ctx) throw new Error('useCurrentUser must be used within UserProvider')
    return ctx
}


export function useGuardedCurrentUser() {
    const {user, logout, updateCurrentUser} = useCurrentUser()

    if (!user) throw new Error('useGuardedCurrentUser must be used within AuthGuard')

    return { logout, updateCurrentUser, user }
}