import ProtectedRoute from "../../../components/ProtectedRoute.tsx";
import ShadowBox from "../../../components/ShadowBox.tsx";
import TextInput from "../../../components/TextInput.tsx";
import Button from "../../../components/Button.tsx";
import {useState} from "react";
import {useMutation} from "@tanstack/react-query";
import {deleteUser} from "../../../api/delete-user.ts";

export default function DeleteUserPage(){
    const deleteMutation = useMutation({
        mutationFn: async (password: string) => deleteUser(password),
        onSuccess: () => {
            console.log("Successfully deleted user");
            window.location.href = "/delete_user/verify_otp";
        }
    })

    const [password, setPassword] = useState("");

    const handleGenerateOtp = async () => {
        await deleteMutation.mutateAsync(password);
    }

    return (
        <ProtectedRoute>
            <div className="w-screen h-screen flex items-center justify-center">
                <ShadowBox title={"Change Password"}>
                    <div className="w-full flex flex-col gap-3">
                        <TextInput onChange={(e) => setPassword(e.target.value)} value={password} label="Password" type="password" />
                    </div>
                    <Button
                        onClick={handleGenerateOtp}
                        className="w-full">Generate OTP</Button>
                </ShadowBox>
            </div>
        </ProtectedRoute>
    );
}