import {useMutation} from "@tanstack/react-query";
import {otpVerify} from "../../../api/pass-recovery.ts";
import {useAppSelector} from "../../../store/hooks.ts";
import ProtectedRoute from "../../../hooks/ProtectedRoute.tsx";
import {Navigate, useLocation, useNavigate} from "react-router-dom";
import OtpVerificationCard from "../../../components/OtpVerificationCard.tsx";

interface VerifyOtpParams {
    otp: string,
    newPassword: string,
}

interface PasswordChangeLocationState {
    newPassword?: string;
}

export default function VerifyOtp() {
    const user = useAppSelector((state) => state.user.user);
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state as PasswordChangeLocationState | null;
    const newPassword = locationState?.newPassword ?? sessionStorage.getItem("pending_new_password") ?? "";

    const otpVerifyMutation = useMutation({
        mutationFn: async ({otp, newPassword}: VerifyOtpParams) => await otpVerify(otp, newPassword),
        onSuccess: () => {
            sessionStorage.removeItem("pending_new_password");
            navigate("/dashboard");
        }
    })

    const otpMsg = user?.email ? `Sending OTP to ${user.email}` : "Sending OTP...";

    if (!newPassword) {
        return <Navigate to="/change_password" replace />;
    }

    return (
        <ProtectedRoute>
            <OtpVerificationCard
                message={otpMsg}
                onVerify={async (otp: string) => {
                    await otpVerifyMutation.mutateAsync({otp, newPassword});
                }}
            />
        </ProtectedRoute>
    );
}
