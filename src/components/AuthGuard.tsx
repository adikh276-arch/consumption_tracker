import { Navigate } from "react-router-dom";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const userId = sessionStorage.getItem("user_id");

    if (!userId) {
        // Perform hard redirect as requested in Phase 14
        window.location.href = "/token";
        return null;
    }

    return <>{children}</>;
};
