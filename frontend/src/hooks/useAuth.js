import { useSelector } from "react-redux";
import {
    selectCurrentUser,
    selectCurrentToken,
    selectIsAuthenticated,
} from "../features/auth/authSlice";

const useAuth = () => {
    const user = useSelector(selectCurrentUser);
    const accessToken = useSelector(selectCurrentToken);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    return {
        user,
        accessToken,
        isAuthenticated,
        isUser: user?.role === "user",
        isService: user?.role === "service",
        isAdmin: user?.role === "admin",
    };
};

export default useAuth;