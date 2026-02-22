function GAuthButton() {
    return (
        <button
            className="flex items-center justify-center gap-4 py-3 px-8 border-2 border-[#dadce0] rounded-4xl text-black font-semibold bg-white cursor-pointer hover:border-transparent"
        >
            <img width="28px" src="src/assets/images/google.svg" alt="google icon"/>
            Continue with Google
        </button>
    );
}

export default GAuthButton;
