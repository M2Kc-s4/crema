import type { FC, PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../providers/current-user-provider";
import { ROUTES } from "../routes";

export const AuthGuard: FC<PropsWithChildren> = ({children}) => {
    const {user} = useCurrentUser()

    if (!user) return <Navigate to={ROUTES.login} replace />

    return children
}