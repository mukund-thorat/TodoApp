import ShadowBox from "../../../components/ShadowBox.tsx";
import Button from "../../../components/Button.tsx";
import {useMutation} from "@tanstack/react-query";
import {otpVerify} from "../../../api/pass-recovery.ts";
import {type SubmitEvent, useRef} from "react";
import OTPInput from "../../../components/OTPInput.tsx";
import {useAppSelector} from "../../../store/hooks.ts";
import ProtectedRoute from "../../../components/ProtectedRoute.tsx";
import {Navigate, useLocation, useNavigate} from "react-router-dom";

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
    const otp = useRef<string | null>(null)

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!otp.current) return
        await otpVerifyMutation.mutateAsync({otp: otp.current, newPassword})
    }

    if (!newPassword) {
        return <Navigate to="/change_password" replace />;
    }

    return (
        <ProtectedRoute>
            <div className="flex items-center justify-center h-screen">
                <ShadowBox title="Verify OTP">
                    <p className="text-center">{otpMsg}</p>
                    <form className="flex flex-col gap-8 items-center" onSubmit={(e) => handleSubmit(e)}>
                        <OTPInput otpCallback={(fullOtp) => {
                            otp.current = fullOtp
                        }} />
                        <Button
                            type="submit"
                            children="Verify OTP"
                        />
                    </form>
                </ShadowBox>
            </div>
        </ProtectedRoute>
    );
}
