"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import ConfirmationForm from "@/components/auth/ConfirmationForm";

type AuthView = "login" | "signup" | "confirmation";

export default function AuthPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<AuthView>("login");
  const [signupEmail, setSignupEmail] = useState("");

  // Redirect to main page if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, loading, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className='min-h-screen bg-gray-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

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
