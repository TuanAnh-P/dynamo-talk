"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onSignupSuccess: (email: string) => void;
}

export default function SignupForm({
  onSwitchToLogin,
  onSignupSuccess,
}: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const { signUp, loading, error, clearError } = useAuth();

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid";
    }

    if (!username) {
      errors.username = "Username is required";
    } else if (username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    clearError();
    const success = await signUp({ email, password, username });

    if (success) {
      onSignupSuccess(email);
    }
  };

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='bg-white rounded-lg shadow-md p-6'>
        <div className='text-center mb-6'>
          <h1 className='text-2xl font-bold text-gray-900'>Create Account</h1>
          <p className='text-gray-600 mt-2'>Join DynamoTalk today</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <Input
            label='Username'
            type='text'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder='Choose a username'
            required
            error={validationErrors.username}
          />

          <Input
            label='Email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Enter your email'
            required
            error={validationErrors.email}
          />

          <Input
            label='Password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Create a password'
            required
            error={validationErrors.password}
            helperText='Must be at least 8 characters'
          />

          <Input
            label='Confirm Password'
            type='password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder='Confirm your password'
            required
            error={validationErrors.confirmPassword}
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
            disabled={!email || !password || !username || !confirmPassword}
          >
            Create Account
          </Button>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600'>
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className='text-blue-600 hover:text-blue-700 font-medium'
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
