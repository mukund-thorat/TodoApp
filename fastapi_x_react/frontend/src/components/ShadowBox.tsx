import type {ReactNode} from "react";


interface ShadowBoxProps {
    title?: string;
    children?: ReactNode;
}

function ShadowBox({children, title}: ShadowBoxProps) {
    return (
       <div className="flex flex-col items-center justify-center border-3 border-quaternary bg-[#f5f1ef] w-fit h-fit p-6 rounded-4xl shadow-[16px_16px_0px_rgba(0,0,0,0.45)]">
           <h1 className="text-3xl font-semibold mb-7">{title}</h1>
           {children}
       </div>
    );
}

export default ShadowBox;
