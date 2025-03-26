'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { addDoc, collection } from 'firebase/firestore';
import { Calendar, CalendarPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';

interface ScheduleVisitButtonProps {
  projectId: string;
  selectedPlot?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
}

const visitFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  preferredDate: z.string().min(1, { message: 'Please select a preferred date' }),
  preferredTime: z.string().min(1, { message: 'Please select a preferred time' }),
  message: z.string().optional(),
});

export function ScheduleVisitButton({
  projectId,
  selectedPlot,
  variant = 'outline',
}: ScheduleVisitButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof visitFormSchema>>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      name: user?.displayName || '',
      email: user?.email || '',
      phone: '',
      preferredDate: '',
      preferredTime: '',
      message: selectedPlot ? `I'm interested in plot ${selectedPlot}` : '',
    },
  });

  // Get tomorrow's date in YYYY-MM-DD format for min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const _tomorrowFormatted = tomorrow.toISOString().split('T')[0];

  // Get date 30 days from now for max date
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const _maxDateFormatted = maxDate.toISOString().split('T')[0];

  const onSubmit = async (data: z.infer<typeof visitFormSchema>) => {
    try {
      await addDoc(collection(db, 'visitRequests'), {
        projectId,
        plotNumber: selectedPlot,
        name: data.name,
        phone: data.phone,
        email: data.email,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        message: data.message,
        status: 'pending',
        createdAt: new Date(),
        userId: user?.uid || null,
      });

      toast({
        title: 'Visit scheduled!',
        description: "We'll contact you to confirm your visit.",
      });

      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error scheduling visit:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule your visit. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Button variant={variant} onClick={() => setIsDialogOpen(true)} className="whitespace-nowrap">
        <Calendar className="mr-2 h-4 w-4" />
        Schedule Visit
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule a Visit</DialogTitle>
            <DialogDescription>
              {selectedPlot
                ? `Schedule a visit to see plot ${selectedPlot} in person.`
                : 'Schedule a visit to see this project in person.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your name" />
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
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your phone number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Your email address" type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="preferredDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Date</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          min={tomorrowFormatted}
                          max={maxDateFormatted}
                        />
                      </FormControl>
                      <FormDescription>Select a date within the next 30 days</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferredTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (12PM - 3PM)</SelectItem>
                          <SelectItem value="evening">Evening (3PM - 6PM)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Message</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Any specific requirements or questions?" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Schedule Visit
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
