"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface ConfirmationFormProps {
  email: string;
  onConfirmationSuccess: () => void;
  onBackToSignup: () => void;
}

export default function ConfirmationForm({
  email,
  onConfirmationSuccess,
  onBackToSignup,
}: ConfirmationFormProps) {
  const [confirmationCode, setConfirmationCode] = useState("");
  const { confirmSignUp, loading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!confirmationCode) {
      return;
    }

    clearError();
    const success = await confirmSignUp({ email, confirmationCode });

    if (success) {
      onConfirmationSuccess();
    }
  };

  const handleResendCode = async () => {
    // For now, we'll just show a message
    // You can implement resendConfirmationCode here if needed
    alert("Resend functionality will be implemented soon");
  };

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='bg-white rounded-lg shadow-md p-6'>
        <div className='text-center mb-6'>
          <div className='text-4xl mb-4'>📧</div>
          <h1 className='text-2xl font-bold text-gray-900'>Check Your Email</h1>
          <p className='text-gray-600 mt-2'>We sent a confirmation code to</p>
          <p className='text-gray-900 font-medium'>{email}</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <Input
            label='Confirmation Code'
            type='text'
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            placeholder='Enter the 6-digit code'
            required
            helperText='Check your email for the verification code'
          />

          {error && (
            <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-sm text-red-600'>{error}</p>
            </div>
          )}

          <Button
            type='submit'
            className='w-full'
            isLoading={loading}
            disabled={!confirmationCode}
          >
            Verify Email
          </Button>
        </form>

        <div className='mt-6 space-y-3 text-center'>
          <button
            onClick={handleResendCode}
            className='text-sm text-blue-600 hover:text-blue-700 font-medium'
          >
            Didn't receive the code? Resend
          </button>

          <div>
            <button
              onClick={onBackToSignup}
              className='text-sm text-gray-600 hover:text-gray-700'
            >
              ← Back to sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
