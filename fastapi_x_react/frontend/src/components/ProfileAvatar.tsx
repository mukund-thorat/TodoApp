import {useEffect, useRef, useState} from "react";
import {useMutation} from "@tanstack/react-query";
import {logoutUser} from "../api/logout-user.ts";

interface ProfileAvatarProps {
    name: string;
}

function ProfileAvatar({name}: ProfileAvatarProps) {
    const logoutMutation = useMutation({
        mutationFn: logoutUser,
    })

    const [isMenuOpen, setMenuOpen] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!isMenuOpen) return;

        const handleOutsideClick = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleOutsideClick);
    }, [isMenuOpen]);

    return (
        <div className="relative" ref={containerRef}>
            <img
                className={`rounded-full border-4 hover:border-6 border-quaternary w-20`}
                src={`src/assets/images/avatars/${name}.jpg`}
                alt={name}
                onContextMenu={(e) => {
                    e.preventDefault();
                    setMenuOpen(true)
                }}
            />
            {
                isMenuOpen && (
                    <section className="absolute top-1/2 right-1/2 flex flex-col items-center gap-2 bg-[#ECE4DF] p-2 border-2 border-quaternary rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,0.45)]">
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => window.location.href = "/change_password"}
                                className="whitespace-nowrap p-3 bg-[#D9C9BF] rounded-md w-full cursor-pointer font-medium">Change password</button>
                            <button
                                onClick={async () => {
                                    await logoutMutation.mutateAsync()
                                    localStorage.removeItem("access_token")
                                    window.location.href = "/login"
                                }}
                                className="whitespace-nowrap p-3 bg-[#D9C9BF] rounded-md w-full cursor-pointer font-medium">Logout</button>
                        </div>
                        <button className="whitespace-nowrap p-3 bg-[#D98C8C] text-[#9E2E2E] rounded-md w-full cursor-pointer font-medium">Delete account</button>
                    </section>
                )
            }
        </div>
    );
}

export default ProfileAvatar;
