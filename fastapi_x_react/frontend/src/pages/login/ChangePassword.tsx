import {useNavigate} from "react-router-dom";
import {useState} from "react";
import ShadowBox from "../../components/ShadowBox.tsx";
import TextInput from "../../components/TextInput.tsx";
import Button from "../../components/Button.tsx";
import {useMutation} from "@tanstack/react-query";
import {changePassword} from "../../api/forget-pass.ts";

interface ChangePasswordProps {
    newPassword: string;
    recoveryToken: string;
}

export default function PasswordChange() {
    const navigate = useNavigate();

    const {mutateAsync} = useMutation({
        mutationFn: async ({newPassword, recoveryToken}: ChangePasswordProps) => await changePassword(newPassword, recoveryToken),
        onSuccess: async () => {
            sessionStorage.removeItem("recovery-token");
            navigate("/login");
        }
    })

    const [newPass, setNewPass] = useState<string>("")
    const [confirmPass, setConfirmPass] = useState<string>("")
    const [errorMsg, setErrorMsg] = useState<string>("")

    const handleSubmit = async () => {
        setErrorMsg("");

        if (!newPass || !confirmPass) {
            setErrorMsg("All password fields are required");
            return;
        }

        if (newPass !== confirmPass) {
            setErrorMsg("New password and confirm password do not match");
            return;
        }
        const recoveryToken = sessionStorage.getItem("recovery-token")
        if (recoveryToken) {
            await mutateAsync({newPassword: confirmPass, recoveryToken});
        }
    }

    return (
        <div className="w-screen h-screen flex items-center justify-center">
            <ShadowBox title={"Change Password"}>
                <div className="w-full flex flex-col gap-3">
                    <TextInput onChange={(e) => setNewPass(e.target.value)} value={newPass} label="New Password" type="password" />
                    <TextInput onChange={(e) => setConfirmPass(e.target.value)} value={confirmPass} label="Confirm Password" type="password" />
                    {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
                </div>
                <Button
                    onClick={handleSubmit}
                    className="w-full">Generate OTP</Button>
            </ShadowBox>
        </div>
    );
}
