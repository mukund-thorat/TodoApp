import {useCurrentUser} from "./useCurrentUser.ts";
import {Navigate} from "react-router-dom";
import type {ReactNode} from "react";

export function RequireGuest({children}: {children: ReactNode}) {
    const { isLoading, data } = useCurrentUser()
    if (isLoading) return <div>Loading...</div>
    if (data) return <Navigate to={'/dashboard'} replace/>
    return <>{children}</>
}
