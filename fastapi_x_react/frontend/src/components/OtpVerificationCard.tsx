import ShadowBox from "./ShadowBox.tsx";
import OtpVerificationForm from "./OtpVerificationForm.tsx";

interface OtpVerificationCardProps {
    message: string;
    onVerify: (otp: string) => Promise<void> | void;
    title?: string;
    buttonText?: string;
}

export default function OtpVerificationCard({
    message,
    onVerify,
    title = "Verify OTP",
    buttonText = "Verify OTP",
}: OtpVerificationCardProps) {
    return (
        <div className="flex items-center justify-center h-screen">
            <ShadowBox title={title}>
                <OtpVerificationForm
                    message={message}
                    onVerify={onVerify}
                    buttonText={buttonText}
                />
            </ShadowBox>
        </div>
    );
}
