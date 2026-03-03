import { Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/Welcome.tsx";
import SignUpPage from "./pages/SignUp.tsx";
import LoginPage from "./pages/Login.tsx";
import Avatar from "./pages/Avatar.tsx";
import OTPPage from "./pages/OTP.tsx";
import DashboardPage from "./pages/dashboard/Dashboard.tsx";
import OAuthCallback from "./pages/OAuthCallback.tsx";
import PasswordChange from "./pages/dashboard/password-change/PasswordChange.tsx";
import PassVerifyOtp from "./pages/dashboard/password-change/VerifyOtp.tsx";
import DeleteVerifyOtp from "./pages/dashboard/delete-user/VerifyOtp.tsx";
import DeleteUserPage from "./pages/dashboard/delete-user/DeleteUser.tsx";

function App() {

  return (
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/pick_avatar" element={<Avatar />} />
        <Route path="/verify_otp" element={<OTPPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/change_password" element={<PasswordChange />} />
        <Route path="/change_password/verify_otp" element={<PassVerifyOtp />} />
        <Route path="/delete_user" element={<DeleteUserPage />} />
        <Route path="/delete_user/verify_otp" element={<DeleteVerifyOtp />} />
      </Routes>
  )
}

export default App
