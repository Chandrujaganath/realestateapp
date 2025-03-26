'use client';

import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { setCookie } from 'cookies-next';
import { getDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, db } from '@/lib/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Direct login function without using the auth hook
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('Attempting to sign in with:', email);
      
      // Direct Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get the user's role from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let role = null;
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        role = userData.role?.toLowerCase() || 'client';
        
        // Set token in cookie
        const token = await user.getIdToken();
        setCookie('authToken', token, {
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
        
        // Set role in cookie
        setCookie('userRole', role, {
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
        
        // Update lastLogin
        await updateDoc(doc(db, 'users', user.uid), {
          lastLogin: serverTimestamp(),
        });
        
        console.log('Login successful, redirecting to dashboard for role:', role);
        
        // Direct page navigation based on role
        if (role === 'admin') {
          window.location.href = '/dashboard/admin';
        } else if (role === 'client') {
          window.location.href = '/dashboard/client';
        } else if (role === 'manager') {
          window.location.href = '/dashboard/manager';
        } else if (role === 'guest') {
          window.location.href = '/dashboard/guest';
        } else if (role === 'superadmin') {
          window.location.href = '/dashboard/superadmin';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        setError('User profile not found. Please contact support.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(err.message || 'Failed to sign in');
      }
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground">Enter your credentials to sign in to your account</p>
      </div>

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
