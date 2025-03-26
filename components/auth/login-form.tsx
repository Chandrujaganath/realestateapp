'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, RefreshCw } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

interface LoginFormProps {
  onLoginSubmit: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
  loginError: string | null;
  isFirebaseInitialized?: boolean;
}

export function LoginForm({ 
  onLoginSubmit, 
  isLoading, 
  loginError, 
  isFirebaseInitialized = false 
}: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Use this to reset the form error when user types
  useEffect(() => {
    const subscription = form.watch(() => {
      if (error) setError(null);
    });
    return () => subscription.unsubscribe();
  }, [form, error]);

  // Update local error state when loginError changes
  useEffect(() => {
    if (loginError) {
      setError(loginError);
    }
  }, [loginError]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Check if Firebase is initialized before submitting
      if (!isFirebaseInitialized) {
        setError('Firebase auth not initialized. Please refresh the page.');
        return;
      }
      
      setError(null);
      await onLoginSubmit(values.email, values.password);
    } catch (error) {
      console.error('Login form error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to sign in. Please try again.');
      }
    }
  }

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          {!isFirebaseInitialized && (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-md flex items-start mb-4 text-sm">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mr-2 mt-0.5" />
              <div className="text-yellow-800 dark:text-yellow-400">
                Firebase authentication is initializing. 
                <button 
                  onClick={handleReload} 
                  className="ml-2 text-blue-600 dark:text-blue-400 inline-flex items-center"
                >
                  <RefreshCw className="h-3 w-3 mr-1" /> Refresh
                </button>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-destructive/10 p-3 rounded-md flex items-start mb-4 text-sm">
              <AlertCircle className="h-4 w-4 text-destructive mr-2 mt-0.5" />
              <div className="text-destructive">{error}</div>
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} autoComplete="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        autoComplete="current-password" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !isFirebaseInitialized}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </span>
                ) : !isFirebaseInitialized ? (
                  <span className="flex items-center">
                    <RefreshCw className="animate-spin -ml-1 mr-3 h-4 w-4" />
                    Initializing...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
              
              {/* Test account reminder for development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                  <strong>Dev Note:</strong> Try using admin@realestate-app.com / password123
                </div>
              )}
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary underline">
              Sign up
            </Link>
          </div>
          <div className="text-sm text-center">
            <Link href="/reset-password" className="text-primary underline">
              Forgot password?
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

