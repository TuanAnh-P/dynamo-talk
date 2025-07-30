"use client";

import { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import ConfirmationForm from "@/components/auth/ConfirmationForm";

type AuthView = "login" | "signup" | "confirmation";

export default function AuthPage() {
  const [currentView, setCurrentView] = useState<AuthView>("login");
  const [signupEmail, setSignupEmail] = useState("");

  const handleSwitchToSignup = () => {
    setCurrentView("signup");
  };

  const handleSwitchToLogin = () => {
    setCurrentView("login");
  };

  const handleSignupSuccess = (email: string) => {
    setSignupEmail(email);
    setCurrentView("confirmation");
  };

  const handleConfirmationSuccess = () => {
    setCurrentView("login");
  };

  const handleBackToSignup = () => {
    setCurrentView("signup");
  };

  return (
    <div className='min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md'>
        {currentView === "login" && (
          <LoginForm onSwitchToSignup={handleSwitchToSignup} />
        )}

        {currentView === "signup" && (
          <SignupForm
            onSwitchToLogin={handleSwitchToLogin}
            onSignupSuccess={handleSignupSuccess}
          />
        )}

        {currentView === "confirmation" && (
          <ConfirmationForm
            email={signupEmail}
            onConfirmationSuccess={handleConfirmationSuccess}
            onBackToSignup={handleBackToSignup}
          />
        )}
      </div>
    </div>
  );
}
