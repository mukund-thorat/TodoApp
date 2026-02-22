import ShadowBox from "../components/ShadowBox";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import Divider from "../components/Divider";
import GAuthButton from "../components/GAuthButton";

function SignUpPage() {
    return (
        <div className="flex items-center justify-center h-screen">
            <ShadowBox title="Sign Up">
                <div className="w-full flex flex-col gap-3">
                    <div className="w-full flex gap-3">
                        <TextInput id="fname" label="First Name" placeholder="Enter your first name"/>
                        <TextInput id="lname" label="Last Name" placeholder="Enter your last name"/>
                    </div>
                    <TextInput id="email" label="Email" placeholder="Enter your email"/>
                    <TextInput id="password" type="password" label="Password" placeholder="Enter your password"/>
                    <TextInput id="cpassword" type="password" label="Confirm Password" placeholder="Re-Enter your password"/>
                </div>
                <Button className="w-full" children="Proceed" />
                <div className="w-full flex flex-col gap-3">
                    <Divider label="or signup with"/>
                    <GAuthButton/>
                </div>
            </ShadowBox>
        </div>
    );
}

export default SignUpPage;