"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export default function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, loading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    clearError();
    const success = await signIn({ email, password });

    if (success) {
      // Redirect will happen automatically via auth context
      console.log("Login successful");
    }
  };

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='bg-white rounded-lg shadow-md p-6'>
        <div className='text-center mb-6'>
          <h1 className='text-2xl font-bold text-gray-900'>Welcome Back</h1>
          <p className='text-gray-600 mt-2'>Sign in to DynamoTalk</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <Input
            label='Email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Enter your email'
            required
            error={error && error.includes("email") ? error : undefined}
          />

          <Input
            label='Password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Enter your password'
            required
            error={error && error.includes("password") ? error : undefined}
          />

          {error && !error.includes("email") && !error.includes("password") && (
            <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-sm text-red-600'>{error}</p>
            </div>
          )}

          <Button
            type='submit'
            className='w-full'
            isLoading={loading}
            disabled={!email || !password}
          >
            Sign In
          </Button>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600'>
            Don't have an account?{" "}
            <button
              onClick={onSwitchToSignup}
              className='text-blue-600 hover:text-blue-700 font-medium'
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
