import ShadowBox from "../../components/ShadowBox.tsx";
import TextInput from "../../components/TextInput.tsx";
import Button from "../../components/Button.tsx";
import Divider from "../../components/Divider.tsx";
import GAuthButton from "../../components/GAuthButton.tsx";
import {useMutation} from "@tanstack/react-query";
import {type RegisterFormData, registerSchema} from "../../entities/user.ts";
import {registerUser} from "../../api/register-user.ts";
import {useState} from "react";
import * as React from "react";
import {useNavigate} from "react-router-dom";
import {RequireGuest} from "../../hooks/RequireGuest.tsx";

function SignUpPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<RegisterFormData>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const { mutate, isPending } = useMutation({
        mutationFn: (formData: RegisterFormData) => registerUser(formData),
        onSuccess: () => {
            sessionStorage.setItem("email", formData.email);
            navigate("/pick_avatar");
        }
    })

    const handleChange = (field: keyof RegisterFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const result = registerSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors: Record<string, string> = {};

            for (const issue of result.error.issues) {
                const fieldName = issue.path[0];
                if (typeof fieldName === "string") {
                    fieldErrors[fieldName] = issue.message;
                }
            }
            setErrors(fieldErrors);
            return;
        }
        setErrors({});
        mutate(result.data);
    }
    return (
        <RequireGuest>
            <div className="flex items-center justify-center h-screen">
                <ShadowBox title="Sign Up">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                        <div className="w-full flex flex-col gap-3">
                            <div className="w-full flex gap-3">
                                <TextInput
                                    id="fname"
                                    label="First Name"
                                    placeholder="Enter your first name"
                                    error={errors.firstName}
                                    onChange={(e)=> handleChange("firstName", e.target.value)}
                                />
                                <TextInput
                                    id="lname"
                                    label="Last Name"
                                    placeholder="Enter your last name"
                                    error={errors.lastName}
                                    onChange={(e)=> handleChange("lastName", e.target.value)}
                                />
                            </div>
                            <TextInput
                                id="email"
                                label="Email"
                                placeholder="Enter your email"
                                error={errors.email}
                                onChange={(e)=> handleChange("email", e.target.value)}
                            />
                            <TextInput
                                id="password"
                                type="password"
                                label="Password"
                                placeholder="Enter your password"
                                error={errors.password}
                                onChange={(e)=> handleChange("password", e.target.value)}
                            />
                            <TextInput
                                id="cpassword"
                                type="password"
                                label="Confirm Password"
                                placeholder="Re-Enter your password"
                                error={errors.confirmPassword}
                                onChange={(e)=> handleChange("confirmPassword", e.target.value)}
                            />
                        </div>
                        <Button className="w-full" children={isPending ? "Processing...": "Proceed"} />
                    </form>
                    <div className="w-full flex flex-col gap-3">
                        <Divider label="or signup with"/>
                        <GAuthButton/>
                    </div>
                </ShadowBox>
            </div>
        </RequireGuest>
    );
}

export default SignUpPage;
