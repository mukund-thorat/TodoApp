import type { ReactNode, ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "s" | "m" | "l";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
}

function Button({ children, variant="primary", size="m", className, ...props }: ButtonProps) {
    const baseStyle = "border-2 rounded-4xl text-black font-semibold cursor-pointer"
    const variantStyle = {
        primary: "bg-secondary hover:border-transparent",
        secondary: "bg-transparent hover:bg-[#fffaf0]"
    }
    const sizeStyle = {
        s: "py-2 px-4 text-sm",
        m: "py-3 px-8 text-base",
        l: "py-4 px-12 text-lg",
    };

    return (
        <button
            className={`${baseStyle} ${variantStyle[variant]} ${sizeStyle[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export default Button;
