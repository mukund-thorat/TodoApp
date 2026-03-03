import ShadowBox from "../../../components/ShadowBox.tsx";
import Button from "../../../components/Button.tsx";
import {useMutation} from "@tanstack/react-query";
import {type SubmitEvent, useRef} from "react";
import OTPInput from "../../../components/OTPInput.tsx";
import {useAppSelector} from "../../../store/hooks.ts";
import ProtectedRoute from "../../../components/ProtectedRoute.tsx";
import {useNavigate} from "react-router-dom";
import {verifyOTP} from "../../../api/delete-user.ts";

interface DeleteSuccessProps {
    email: string;
}

function DeleteSuccess({email}: DeleteSuccessProps){
    return (
        <h1>Your <span className="text-[##19B240]">{email}</span> account has been successfully deleted.</h1>
    )
}

export default function VerifyOtp() {
    const user = useAppSelector((state) => state.user.user);
    const navigate = useNavigate();

    const otpVerifyMutation = useMutation({
        mutationFn: async (otp: string) => await verifyOTP(otp),
        onSuccess: () => {
           navigate("/login");
        }
    })

    const otpMsg = user?.email ? `Sending OTP to ${user.email}` : "Sending OTP...";
    const otp = useRef<string | null>(null)

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!otp.current) return
        await otpVerifyMutation.mutateAsync(otp.current)
    }

    return (
        <ProtectedRoute>
            <div className="flex items-center justify-center h-screen">
                <ShadowBox title="Verify OTP">
                    {
                        (otpVerifyMutation.isSuccess && user) ? (
                            <DeleteSuccess email={user?.email}/>
                        ):(
                            <>
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
                            </>
                        )
                    }
                </ShadowBox>
            </div>
        </ProtectedRoute>
    );
}
