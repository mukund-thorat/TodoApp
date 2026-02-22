import Button from "../components/Button.tsx";
import { Link } from "react-router-dom";

function WelcomePage(){
    return (
        <div className="flex flex-col items-center justify-center w-full h-screen">
            <div className="flex flex-col items-center justify-center w-full mb-30">
                <div className="mb-20">
                    <div className="flex items-center justify-center">
                        <h1 className="text-5xl italic font-medium">"Todo by</h1>
                        <img className="ml-3 mr-3" src="src/assets/images/logo.svg" alt="logo"/>
                        <h1 className="text-5xl italic font-medium">is</h1>
                    </div>
                    <h1 className="text-5xl italic font-medium">The World's best todo list app."</h1>
                </div>
                <h1 className="text-5xl italic font-medium">Don't just take our word for it. see for yourself.</h1>
            </div>
            <Link to="signup">
                <Button className="w-75 mb-3" size="l" variant="secondary" children="Sign-up"/>
            </Link>
            <Link to="login">
                <Button className="w-75" size="l" children="Login"/>
            </Link>
        </div>
    )
}

export default WelcomePage;