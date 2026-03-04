import '../assets/css/otp.css'
import {type ClipboardEvent, useRef, useState} from "react";

function OTPInput({otpCallback} : {otpCallback: (otp: string) => void}) {
    const [otp, setOTP] = useState<string[]>(Array(6).fill(""));
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (value: string, index: number) => {
        const newOtp = [...otp]
        newOtp[index] = value
        setOTP(newOtp)

        if (value && index < 5) {
            inputsRef.current[index + 1]?.focus()
        }

        if (newOtp.every((digit) => digit !== "")) {
            const fullOtp = newOtp.join("")
            otpCallback(fullOtp)
        }
    }

    const handlePaste = (
        e: ClipboardEvent<HTMLInputElement>,
        index: number
    ) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData("text");
        const digits = pastedText.replace(/\D/g, "").slice(0, 6 - index).split("");

        if (digits.length === 0) {
            return;
        }

        const newOtp = [...otp];
        digits.forEach((digit, i) => {
            newOtp[index + i] = digit;
        });

        setOTP(newOtp);

        const nextIndex = Math.min(index + digits.length, 5);
        inputsRef.current[nextIndex]?.focus();

        if (newOtp.every((digit) => digit !== "")) {
            otpCallback(newOtp.join(""));
        }
    };

    return (
        <div className="flex items-center gap-2">
            {
                otp.map((digit, index) => (
                    <input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={digit}
                        ref={(el) => {
                            inputsRef.current[index] = el;
                        }}
                        className="otp-input"
                        pattern="[0-9]"
                        inputMode="numeric"
                        onChange={(e) => handleChange(e.target.value, index)}
                        onPaste={(e) => handlePaste(e, index)}
                        required
                    />
                ))
            }
        </div>
    );
}

export default OTPInput;
