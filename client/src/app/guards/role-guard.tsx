import type { FC, PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../providers/current-user-provider";
import type { UserRole } from "domain/user";


type RoleGuardProps = PropsWithChildren & {
    role: UserRole
}


export function RoleGuard({ children, role }: RoleGuardProps) {
    const { user } = useCurrentUser()

    if (!user) return <Navigate to='/identity/login' replace />

    if (role !== user.role) return <Navigate to='/forbidden' replace />

    return children
}

export function CustometGuard({ children }: PropsWithChildren) {
    return <RoleGuard children={children} role='customer' ></RoleGuard>
}


export function BarmanGuard({ children }: PropsWithChildren) {
    return <RoleGuard children={children} role='barman' ></RoleGuard>
}