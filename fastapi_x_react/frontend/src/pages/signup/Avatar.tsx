import ShadowBox from "../../components/ShadowBox.tsx";
import Avatar from "../../components/Avatar.tsx";
import Button from "../../components/Button.tsx";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";


function AvatarPage(){
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const emailFromQuery = params.get("email");
        if (emailFromQuery) {
            sessionStorage.setItem("email", emailFromQuery);
        }
    }, []);

    const avatars = ["cat", "ishowmeat", "mrbean", "xavier", "gentle_man", "dora"];

    const [selected, setSelected] = useState<string | null>(null);

    return (
        <div className="flex items-center justify-center h-screen">
            <ShadowBox title="Pick Avatar">
                <div className="flex flex-wrap items-center justify-center gap-3 overflow-x-auto hide-scrollbar">
                    {
                        avatars.map((avatar) => {
                            return (
                                <Avatar
                                    key={avatar}
                                    selected={selected}
                                    name={avatar}
                                    onClick={() => {
                                        setSelected(avatar);
                                    }}
                                />
                            )
                        })
                    }
                </div>
                <Button
                    children="Done"
                    disabled={!selected}
                    onClick={() => {
                        if (selected != null) {
                            sessionStorage.setItem("picked_avatar", selected)
                            navigate("/verify_otp")
                        }
                    }}
                />
            </ShadowBox>
        </div>
    )
}

export default AvatarPage;