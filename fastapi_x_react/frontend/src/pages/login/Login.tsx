import ShadowBox from "../../components/ShadowBox.tsx";
import TextInput from "../../components/TextInput.tsx";
import GAuthButton from "../../components/GAuthButton.tsx";
import Button from "../../components/Button.tsx";
import Divider from "../../components/Divider.tsx";
import {useState, type SubmitEvent, useEffect} from "react";
import {type LoginFormData, loginSchema} from "../../entities/user.ts";
import {useMutation} from "@tanstack/react-query";
import {loginUser} from "../../api/login-user.ts";
import {getMe} from "../../api/get-me.ts";
import {useNavigate} from "react-router-dom";

function LoginPage(){
    const navigate = useNavigate();

    const redirectMutation = useMutation({
        mutationFn: getMe,
        onSuccess: () => {
            navigate("/dashboard");
        }
    })

    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
        password: "",
    })

    const {mutate} = useMutation({
        mutationFn: async (data: LoginFormData) => loginUser(data),
        onSuccess: (data) => {
            localStorage.setItem("access_token", data["access_token"]);
            window.location.href = "/dashboard";
        }
    });

    const handleChange = (field: keyof LoginFormData, value: string) => {
        setFormData((prev) => ({...prev, [field]: value}))
    }

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const result = loginSchema.safeParse(formData);

        if (!result.success){
            const fieldErrors: Record<string, string> = {}

            for (const issue of result.error.issues){
                const fieldName = issue.path[0]
                if (typeof fieldName === "string"){
                    fieldErrors[fieldName] = issue.message
                }
            }

            setErrors(fieldErrors);
            return;
        }

        setErrors({})
        mutate(result.data)
    }

    useEffect(() => {
        redirectMutation.mutate();
    }, [])

    return (
        <div className="flex items-center justify-center h-screen">
            <ShadowBox title="Login">
                <form onSubmit={(e) => handleSubmit(e)} className="w-full flex flex-col gap-5">
                    <div className="w-full flex flex-col gap-3">
                        <TextInput
                            id="email"
                            label="Email"
                            placeholder="Enter your email"
                            error={errors.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                        />
                        <TextInput
                            id="password"
                            type="password"
                            label="Password"
                            placeholder="Enter your password"
                            error={errors.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                        />
                    </div>
                    <a href="/login/forget_password" className="cursor-pointer w-full text-end text-quaternary font-medium">forget password</a>
                    <Button className="w-full" children="Proceed" />
                </form>
                <div className="w-full flex flex-col gap-3">
                    <Divider label="or login with"/>
                    <GAuthButton/>
                </div>
            </ShadowBox>
        </div>
    )
}

export default LoginPage;
