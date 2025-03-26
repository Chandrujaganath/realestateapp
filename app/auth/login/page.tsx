'use client';

import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type React from 'react';
import { useState, useEffect } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';

export default function LoginPage() {
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const expired = searchParams?.get('expired') ?? null;

  useEffect(() => {
    if (expired === 'true') {
      setError('Your guest account has expired. Please register again or contact support.');
    }
  }, [expired]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      console.log('Attempting to sign in with email:', email);
      const userCredential = await signIn(email, password);
      console.log('Sign in successful, user:', userCredential);

      // The auth provider will handle redirection based on role
    } catch (err: any) {
      console.error('Login error:', err);
      // Provide more specific error messages
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later or reset your password.');
      } else {
        setError(err.message || 'Failed to sign in');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground">Enter your credentials to sign in to your account</p>
      </div>

      {expired && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Your guest account has expired. Please log in again or register for a new account.
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
              Signing in...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </span>
          )}
        </Button>
      </form>

      <div className="text-center text-sm space-y-2">
        <div>
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
        <div>
          Want to visit a property?{' '}
          <Link href="/auth/register-guest" className="text-primary hover:underline">
            Register as Guest
          </Link>
        </div>
      </div>
    </div>
  );
}
