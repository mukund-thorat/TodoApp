import type { InputHTMLAttributes } from "react";

interface TextInputProps extends  InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

function TextInput({ label, id, ...props }: TextInputProps) {
    return (
        <div className="flex items-start gap-2 justify-start flex-col">
            { label && (
                <label
                    className="text-tertiary font-semibold"
                    htmlFor={id}
                >{label}</label>
            )}
            <input
                id={id}
                className="border-2 border-quaternary rounded-xl p-3"
                type="text"
                {...props}
            />
        </div>
    );
}

export default TextInput;
