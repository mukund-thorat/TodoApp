import {type FormEvent, useRef} from "react";
import OTPInput from "./OTPInput.tsx";
import Button from "./Button.tsx";

interface OtpVerificationFormProps {
    message: string;
    onVerify: (otp: string) => Promise<void> | void;
    buttonText?: string;
}

export default function OtpVerificationForm({
    message,
    onVerify,
    buttonText = "Verify OTP",
}: OtpVerificationFormProps) {
    const otp = useRef<string | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!otp.current) {
            return;
        }
        await onVerify(otp.current);
    };

    return (
        <>
            <p className="text-center">{message}</p>
            <form className="flex flex-col gap-8 items-center" onSubmit={handleSubmit}>
                <OTPInput otpCallback={(fullOtp) => {
                    otp.current = fullOtp;
                }} />
                <Button type="submit">
                    {buttonText}
                </Button>
            </form>
        </>
    );
}
