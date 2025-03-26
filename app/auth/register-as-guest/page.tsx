'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/contexts/auth-context';

// Define type for form data
interface GuestRegistrationForm {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export default function RegisterAsGuestPage() {
  const router = useRouter();
  const [_error, setError] = useState<string | null>(null);
  const { signUpAsGuest } = useAuth();

  const _handleGuestRegistration = async (formData: GuestRegistrationForm) => {
    try {
      await signUpAsGuest(formData.email, formData.password, formData.name, formData.phone);
      // Redirect to main dashboard - middleware will handle the rest
      router.push('/dashboard');
    } catch (error: any) {
      setError(error?.message || 'Registration failed');
    }
  };

  // Rest of your component...
}
