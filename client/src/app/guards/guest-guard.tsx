import type { FC, PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../providers/current-user-provider";

export const GuestGuard: FC<PropsWithChildren> = ({children}) => {
    const {user} = useCurrentUser()

    if (user) return <Navigate to='/' replace />

    return children
}