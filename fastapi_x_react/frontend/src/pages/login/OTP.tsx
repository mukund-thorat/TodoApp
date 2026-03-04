import {useMutation} from "@tanstack/react-query";
import {verifyOtp} from "../../api/forget-pass.ts";
import type {recoveryTokenModel} from "../../entities/recovery-token.ts";
import {useNavigate} from "react-router-dom";
import OtpVerificationCard from "../../components/OtpVerificationCard.tsx";

interface OtpVerificationMutationProps {
    email: string;
    otp: string;
}

export default function OTPPage(){
    const navigate = useNavigate();

    const otpVerifyMutation = useMutation({
        mutationFn: async ({email, otp}: OtpVerificationMutationProps) => verifyOtp(email, otp),
        onSuccess: async (data: recoveryTokenModel) => {
            sessionStorage.removeItem("fp_email");
            sessionStorage.setItem("recovery-token", data.recovery_token);
            navigate("/login/forget_password/change_password");
        }
    });

    const email = sessionStorage.getItem("fp_email") ?? "";

    return (
        <OtpVerificationCard
            message={`OTP sent to ${email}`}
            onVerify={async (otp: string) => {
                if (!email) {
                    throw new Error("Email not found");
                }
                await otpVerifyMutation.mutateAsync({email, otp});
            }}
        />
    );
}