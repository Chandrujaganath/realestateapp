'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/contexts/auth-context';

// Define a proper type for the form data
interface ClientRegistrationFormData {
  email: string;
  password: string;
  name: string;
  phone: string;
  // Add other required fields here if needed
}

export default function RegisterAsClientPage() {
  const [error, setError] = useState<string | null>(null);
  const _router = useRouter();
  const _auth = useAuth();

  const _handleClientRegistration = async (formData: ClientRegistrationFormData) => {
    try {
      await auth.signUpAsClient(
        formData.email,
        formData.password,
        formData.name,
        formData.phone
        // Include other fields as needed
      );
      // Redirect after successful registration
      router.push('/dashboard');
    } catch (error: unknown) {
      // Handle error safely with type checking
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during registration');
      }
    }
  };

  // Add the form JSX here
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Register as Client</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Form component or inline form here */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = {
            email: (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value,
            password: (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value,
            name: (e.currentTarget.elements.namedItem('name') as HTMLInputElement).value,
            phone: (e.currentTarget.elements.namedItem('phone') as HTMLInputElement).value,
          } as ClientRegistrationFormData;

          handleClientRegistration(formData);
        }}
      >
        {/* Form fields */}
        <div className="mb-4">
          <label htmlFor="name" className="block mb-2">
            Full Name
          </label>
          <input type="text" id="name" name="name" required className="w-full p-2 border rounded" />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="phone" className="block mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Register
        </button>
      </form>

      <div className="mt-4">
        <p>
          Already have an account?{' '}
          <a href="/auth/login" className="text-blue-500 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
