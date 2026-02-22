import type { InputHTMLAttributes } from "react";

interface TextInputProps extends  InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    type?: "password" | "text";
    error?: string;
}

function TextInput({ label, type="text", id, error, ...props }: TextInputProps) {
    return (
        <div className="w-full flex items-start gap-2 justify-start flex-col">
            { label && (
                <label
                    className="text-tertiary font-semibold"
                    htmlFor={id}
                >{label}</label>
            )}
            <input
                id={id}
                className={`w-full border-2 rounded-xl p-3 ${error ? "border-red-500" : "border-quaternary"}`}
                type={type}
                {...props}
            />

            {error && (
                <span className="text-red-500 text-sm">
                    {error}
                </span>
            )}
        </div>
    );
}

export default TextInput;
