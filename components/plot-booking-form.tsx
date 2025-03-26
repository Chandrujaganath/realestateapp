'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { doc, updateDoc, Firestore } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { Functions } from 'firebase/functions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { functions, db } from '@/lib/firebase';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
  message: z.string().optional(),
});

interface PlotBookingFormProps {
  plotId: string;
  projectId: string;
  plotName: string;
  projectName: string;
}

export function PlotBookingForm({
  plotId,
  projectId,
  plotName,
  projectName,
}: PlotBookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [optimisticState, setOptimisticState] = useState<'idle' | 'booked' | 'failed'>('idle');
  const _router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      // Optimistically update UI
      setOptimisticState('booked');

      // Check if Firestore is initialized
      if (!db) {
        throw new Error('Firestore is not initialized');
      }

      // Update plot status optimistically in local Firestore cache
      const plotRef = doc(db as Firestore, `projects/${projectId}/plots/${plotId}`);
      await updateDoc(plotRef, {
        status: 'booked',
        updatedAt: new Date(),
      });

      // Check if Functions is initialized
      if (!functions) {
        throw new Error('Firebase Functions are not initialized');
      }

      // Call the Cloud Function to book the plot
      const _bookPlotFn = httpsCallable(functions as Functions, 'bookPlot');

      const _result = await bookPlotFn({
        plotId,
        projectId,
        bookingDetails: {
          clientName: values.name,
          clientEmail: values.email,
          clientPhone: values.phone,
          clientMessage: values.message,
        },
      });

      toast({
        title: 'Success',
        description: 'Plot booked successfully',
        variant: 'default',
      });

      // Redirect to booking confirmation page
      router.push(`/bookings/${(result.data as any).bookingId}`);
    } catch (error: any) {
      console.error('Error booking plot:', error);

      // Revert optimistic update
      setOptimisticState('failed');

      // Try to revert local Firestore cache
      try {
        if (!db) {
          throw new Error('Firestore is not initialized');
        }

        const plotRef = doc(db as Firestore, `projects/${projectId}/plots/${plotId}`);
        await updateDoc(plotRef, {
          status: 'available',
          updatedAt: new Date(),
        });
      } catch (revertError) {
        console.error('Failed to revert optimistic update:', revertError);
      }

      toast({
        title: 'Error',
        description: error.message || 'Failed to book plot. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (optimisticState === 'booked' && isSubmitting) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing Your Booking</CardTitle>
          <CardDescription>
            We're finalizing your booking for {plotName} in {projectName}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mb-4" />
          <p className="text-center text-muted-foreground">
            Please wait while we process your booking...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book Plot {plotName}</CardTitle>
        <CardDescription>
          Complete the form below to book this plot in {projectName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {optimisticState === 'failed' && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-4">
            <p className="font-medium">Booking Failed</p>
            <p className="text-sm">There was an error processing your booking. Please try again.</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any specific requirements or questions?" {...field} />
                  </FormControl>
                  <FormDescription>
                    Include any specific requirements or questions you have about this plot.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Book Now'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        By booking, you agree to our terms and conditions.
      </CardFooter>
    </Card>
  );
}
