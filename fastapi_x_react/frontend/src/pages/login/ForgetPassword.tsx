import ShadowBox from "../../components/ShadowBox.tsx";
import TextInput from "../../components/TextInput.tsx";
import Button from "../../components/Button.tsx";
import {useMutation} from "@tanstack/react-query";
import {forgetPass} from "../../api/forget-pass.ts";
import {useState} from "react";
import {useNavigate} from "react-router-dom";

export default function ForgetPasswordPage() {
    const navigate = useNavigate();

    const {mutateAsync} = useMutation({
        mutationFn: async (email: string) => forgetPass(email),
        onSuccess: async () => navigate("/login/forget_password/otp")
    })

    const [email, setEmail] = useState<string>("")

    return (
        <div className="w-screen h-screen flex items-center justify-center">
            <ShadowBox title="Password Recovery">
                <form
                    className="w-full flex flex-col gap-6"
                    onSubmit={async (e) => {
                        e.preventDefault()
                        sessionStorage.setItem("fp_email", email)
                        await mutateAsync(email)
                    }}
                >
                    <TextInput
                        label="Email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button className="w-full">Get OTP</Button>
                </form>
            </ShadowBox>
        </div>
    );
}