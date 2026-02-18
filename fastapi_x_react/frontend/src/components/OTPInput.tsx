import '../css/otp.css'

function OTPInput() {
    return (
        <div className="flex items-center gap-2">
            <input type="text" maxLength={1} className="otp-input" pattern="[0-9]" inputMode="numeric" required/>
            <input type="text" maxLength={1} className="otp-input" pattern="[0-9]" inputMode="numeric" required/>
            <input type="text" maxLength={1} className="otp-input" pattern="[0-9]" inputMode="numeric" required/>
            <input type="text" maxLength={1} className="otp-input" pattern="[0-9]" inputMode="numeric" required/>
            <input type="text" maxLength={1} className="otp-input" pattern="[0-9]" inputMode="numeric" required/>
            <input type="text" maxLength={1} className="otp-input" pattern="[0-9]" inputMode="numeric" required/>
        </div>
    );
}

export default OTPInput;
