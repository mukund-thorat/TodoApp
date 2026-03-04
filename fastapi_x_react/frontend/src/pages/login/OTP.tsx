import ShadowBox from "../../components/ShadowBox.tsx";
import OTPInput from "../../components/OTPInput.tsx";
import Button from "../../components/Button.tsx";
import {useMutation} from "@tanstack/react-query";
import {verifyOtp} from "../../api/forget-pass.ts";
import {useRef, type SubmitEvent} from "react";
import type {recoveryTokenModel} from "../../entities/recovery-token.ts";
import {useNavigate} from "react-router-dom";

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

    const otp = useRef<string | null>(null)

    const handleSubmit = async (e: SubmitEvent)=> {
        e.preventDefault()
        if (email && otp.current) {
            await otpVerifyMutation.mutateAsync({email: email, otp: otp.current})
        } else {
            throw new Error(`email or otp not found \n Email: ${email} OTP: ${otp}`)
        }
    }

    return (
        <div className="flex items-center justify-center h-screen">
            <ShadowBox title="Verify OTP">
                <p className="text-center">OTP sent to {email}</p>
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
    );
}