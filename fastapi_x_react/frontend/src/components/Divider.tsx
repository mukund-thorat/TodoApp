interface DividerProps {
    label: string;
}

function Divider({label}: DividerProps) {
    return (
        <div className="w-full flex items-center py-3" aria-hidden="true">
            <div className="w-full h-px bg-quaternary"></div>
            <div className="w-full flex px-2">
                <span className="w-full whitespace-nowrap text-center">{label}</span>
            </div>
            <div className="w-full h-px bg-quaternary"></div>
        </div>
    );
}

export default Divider;
