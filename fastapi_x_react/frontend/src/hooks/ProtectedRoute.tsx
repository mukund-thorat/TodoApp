import {type ReactNode, useEffect} from "react";
import {clearUser, setUser} from "../store/userSlice.ts";
import {useAppDispatch} from "../store/hooks.ts";
import {useCurrentUser} from "./useCurrentUser.ts";
import {Navigate} from "react-router-dom";

function ProtectedRoute({children}: {children: ReactNode}) {
    const dispatch = useAppDispatch();
    const { data, isLoading, isError } = useCurrentUser()

    useEffect(() => {
        if (data) dispatch(setUser(data));
        if (isError) dispatch(clearUser());
    }, [data, isError, dispatch])

    if (isLoading) return <div>Loading...</div>
    if (isError) {
        localStorage.removeItem("access_token");
        return <Navigate to="/login" replace/>;
    }

    return <>{children}</>;
}

export default ProtectedRoute;
