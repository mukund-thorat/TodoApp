import ShadowBox from "../../../components/ShadowBox.tsx";
import {useMutation} from "@tanstack/react-query";
import {useAppSelector} from "../../../store/hooks.ts";
import ProtectedRoute from "../../../hooks/ProtectedRoute.tsx";
import {useNavigate} from "react-router-dom";
import {verifyOTP} from "../../../api/delete-user.ts";
import OtpVerificationForm from "../../../components/OtpVerificationForm.tsx";

interface DeleteSuccessProps {
    email: string;
}

function DeleteSuccess({email}: DeleteSuccessProps){
    return (
        <h1>Your <span className="text-[#19B240]">{email}</span> account has been successfully deleted.</h1>
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

    return (
        <ProtectedRoute>
            <div className="flex items-center justify-center h-screen">
                <ShadowBox title="Verify OTP">
                    {
                        (otpVerifyMutation.isSuccess && user) ? (
                            <DeleteSuccess email={user?.email}/>
                        ):(
                            <OtpVerificationForm
                                message={otpMsg}
                                onVerify={async (otp: string) => {
                                    await otpVerifyMutation.mutateAsync(otp);
                                }}
                            />
                        )
                    }
                </ShadowBox>
            </div>
        </ProtectedRoute>
    );
}
