import ShadowBox from "../../../components/ShadowBox.tsx";
import TextInput from "../../../components/TextInput.tsx";
import Button from "../../../components/Button.tsx";
import {useMutation} from "@tanstack/react-query";
import {passVerify} from "../../../api/pass-recovery.ts";
import {useEffect, useState} from "react";
import ProtectedRoute from "../../../components/ProtectedRoute.tsx";
import {useNavigate} from "react-router-dom";
import {getAuthProvider} from "../../../api/get-auth-provider.ts";
import type {authProviderModel} from "../../../entities/auth-service-provider.ts";

export default function PasswordChange() {
    const navigate = useNavigate();
    const [authProvider, setAuthProvider] = useState<authProviderModel | null>(null);

    const authProviderMutation = useMutation({
        mutationFn: getAuthProvider,
        onSuccess: async (authProvider: authProviderModel) => {
            setAuthProvider(authProvider);
        }
    })

    useEffect(() => {
        authProviderMutation.mutate()
    }, [])

    const passVerifyMutation = useMutation({
        mutationFn: async (password: string | null) => await passVerify(password),
    })

    const [oldPass, setOldPass] = useState<string>("")
    const [newPass, setNewPass] = useState<string>("")
    const [confirmPass, setConfirmPass] = useState<string>("")
    const [errorMsg, setErrorMsg] = useState<string>("")

    const handleGenerateOtp = async () => {
        setErrorMsg("");

        if ((!oldPass && authProvider?.isPasswordSet && authProvider.authProvider != "google") || !newPass || !confirmPass) {
            setErrorMsg("All password fields are required");
            return;
        }

        if (newPass !== confirmPass) {
            setErrorMsg("New password and confirm password do not match");
            return;
        }

        await passVerifyMutation.mutateAsync(!authProvider?.isPasswordSet && authProvider?.authProvider == "google" ? null : oldPass)
        sessionStorage.setItem("pending_new_password", newPass);
        navigate("/change_password/verify_otp", { state: { newPassword: newPass } });
    }

    return (
        <ProtectedRoute>
            <div className="w-screen h-screen flex items-center justify-center">
                <ShadowBox title={"Change Password"}>
                    <div className="w-full flex flex-col gap-3">
                        {
                            !(authProvider?.authProvider == "google" && !authProvider.isPasswordSet) && <TextInput onChange={(e) => setOldPass(e.target.value)} value={oldPass} label="Old Password" type="password" />
                        }
                        <TextInput onChange={(e) => setNewPass(e.target.value)} value={newPass} label="New Password" type="password" />
                        <TextInput onChange={(e) => setConfirmPass(e.target.value)} value={confirmPass} label="Confirm Password" type="password" />
                        {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
                    </div>
                    <Button
                        onClick={handleGenerateOtp}
                        className="w-full">Generate OTP</Button>
                </ShadowBox>
            </div>
        </ProtectedRoute>
    );
}
