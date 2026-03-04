import {useMutation} from "@tanstack/react-query";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import OtpVerificationCard from "../../components/OtpVerificationCard.tsx";
import {requestSignupOtp, signupTokenLogin, verifySignupOtp} from "../../api/signup-otp.ts";

function OTPPage(){
    const navigate = useNavigate();

    const email = sessionStorage.getItem("email") ?? "";
    const [otpMsg, setOtpMsg] = useState(`Sending OTP to ${email}`);

    const requestOtpMutation = useMutation({
        mutationFn: async () => await requestSignupOtp(email),
        onSuccess: () => {
            setOtpMsg(`Successfully sent OTP to your ${email}`);
        }
    })

    const tokenMutation = useMutation({
        mutationFn: async (token: string) => signupTokenLogin(token),
        onSuccess: (data) => {
            localStorage.setItem("access_token", data["access_token"]);
            navigate("/dashboard")
        }
    })

    const verifyMutation = useMutation({
        mutationFn: async (otp: string) => {
            const avatar = sessionStorage.getItem("picked_avatar");
            return await verifySignupOtp(email, otp, avatar);
        },
        onSuccess: async (data) => {
            sessionStorage.removeItem("email")
            sessionStorage.removeItem("picked_avatar")
            tokenMutation.mutate(data['loginToken'])
        }
    })

    useEffect(() => {
        if (email) {
            requestOtpMutation.mutate()
        }
    }, [email]);

    return (
        <OtpVerificationCard
            message={otpMsg}
            onVerify={async (otp: string) => {
                await verifyMutation.mutateAsync(otp);
            }}
        />
    )
}

export default OTPPage;
