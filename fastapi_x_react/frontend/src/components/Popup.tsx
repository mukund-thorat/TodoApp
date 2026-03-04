import {type ReactNode} from "react";
import {createPortal} from "react-dom";

interface PopupProps {
    isOpen: boolean;
    children: ReactNode;
}

export default function Popup({isOpen, children}: PopupProps){
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed top-0 w-screen h-screen flex items-center justify-center">
            <div
                className="w-fit h-fit border-2 p-4 rounded-2xl border-quaternary bg-[#f5f1ef] flex flex-col gap-9 justify-center items-center shadow-[8px_8px_0px_rgba(0,0,0,0.45)]"
            >
                {children}
            </div>
        </div>,
        document.body,
    );
}