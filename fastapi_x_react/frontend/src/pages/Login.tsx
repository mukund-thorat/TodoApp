import ShadowBox from "../components/ShadowBox.tsx";
import TextInput from "../components/TextInput.tsx";
import GAuthButton from "../components/GAuthButton.tsx";
import Button from "../components/Button.tsx";
import Divider from "../components/Divider.tsx";

function LoginPage(){
    return (
        <div className="flex items-center justify-center h-screen">
            <ShadowBox title="Login">
                <div className="w-full flex flex-col gap-3">
                    <TextInput id="email" label="Email" placeholder="Enter your email"/>
                    <TextInput id="password" type="password" label="Password" placeholder="Enter your password"/>
                </div>
                <Button className="w-full" children="Proceed" />
                <div className="w-full flex flex-col gap-3">
                    <Divider label="or login with"/>
                    <GAuthButton/>
                </div>
            </ShadowBox>
        </div>
    )
}

export default LoginPage;