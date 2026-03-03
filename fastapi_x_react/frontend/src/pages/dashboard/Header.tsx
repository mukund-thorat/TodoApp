import Logo from "../../components/Logo.tsx";
import ProfileAvatar from "../../components/ProfileAvatar.tsx";
import {useAppSelector} from "../../store/hooks.ts";

function Header(){
    const user = useAppSelector((state) => state.user.user);
    return (
        <div className="w-full flex items-center justify-between">
            <h1 className="flex items-center text-3xl font-semibold">Todo by <span><Logo /></span></h1>
            <div className="flex items-center gap-4 justify-center">
                <div className="text-right flex flex-col">
                    <h3 className="text-2xl">Hello,</h3>
                    <h2 className="text-3xl font-medium">{user?.firstName ?? "User"}</h2>
                </div>
                <ProfileAvatar name={user?.avatar ?? "cat"} />
            </div>
        </div>
    )
}

export default Header;
