import ShadowBox from "../components/ShadowBox.tsx";
import OTPInput from "../components/OTPInput.tsx";
import Button from "../components/Button.tsx";
import {useMutation} from "@tanstack/react-query";
import {useEffect, useRef, useState, type SubmitEvent} from "react";

async function tokenLogin(token: string) {
    const response = await fetch("http://localhost:8000/auth/token_login", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Bearer ${token}`,
        },
        credentials: "include"
    })
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Token login failed");
    }
    return response.json();
}

function OTPPage(){
    const email = sessionStorage.getItem("email");
    const [otpMsg, setOtpMsg] = useState(`Sending OTP to ${email}`);
    const otp = useRef<string | null>(null)

    const requestOtpMutation = useMutation({
        mutationFn: async () => {
            const result = await fetch(`http://localhost:8000/auth/otp/request?email=${email}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            if (!result.ok) {
                const errorData = await result.json();
                throw new Error(errorData.detail || "OTP Request failed");
            }
            return result.json();
        },
        onSuccess: () => {
            setOtpMsg(`Successfully sent OTP to your ${email}`);
        }
    })

    const tokenMutation = useMutation({
        mutationFn: async (token: string) => tokenLogin(token),
        onSuccess: (data) => {
            localStorage.setItem("access_token", data["access_token"]);
            window.location.href = "/dashboard";
        }
    })

    const verifyMutation = useMutation({
        mutationFn: async () => {
            const email = sessionStorage.getItem("email");
            const avatar = sessionStorage.getItem("picked_avatar");
            if (otp.current){
                const result = await fetch("http://localhost:8000/auth/otp/verify", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({email, otp: otp.current, avatar})
                })

                if (!result.ok) {
                    const errorData = await result.json();
                    throw new Error(errorData.detail || "OTP verification failed");
                }

                return await result.json()
            }
        },
        onSuccess: async (data) => {
            sessionStorage.removeItem("email")
            sessionStorage.removeItem("picked_avatar")
            tokenMutation.mutate(data['loginToken'])
        }
    })

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        verifyMutation.mutate()
    }

    useEffect(() => {
        if (email) {
            requestOtpMutation.mutate()
        }
    }, [email]);
    return (
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
    )
}

export default OTPPage;
