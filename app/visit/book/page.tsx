'use client';

import React from 'react';
import { format } from 'date-fns';
import {
  CalendarIcon,
  MapPin,
  Building2,
  Clock,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Home,
  Check,
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import BackButton from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Define available time slots
const _TIME_SLOTS = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
];

export default function BookVisitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, requestVisit } = useAuth();

  // Form state
  const [projectId, setProjectId] = useState<string | null>(searchParams.get('projectId'));
  const [projectName, setProjectName] = useState<string | null>(searchParams.get('projectName'));
  const [plotId, setPlotId] = useState<string | null>(searchParams.get('plotId'));
  const [plotNumber, setPlotNumber] = useState<string | null>(searchParams.get('plotNumber'));
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    date?: string;
    timeSlot?: string;
    general?: string;
  }>({});

  // Effect to set project and plot details from URL parameters
  useEffect(() => {
    if (searchParams.get('projectId')) {
      setProjectId(searchParams.get('projectId'));
    }

    if (searchParams.get('projectName')) {
      setProjectName(searchParams.get('projectName'));
    }

    if (searchParams.get('plotId')) {
      setPlotId(searchParams.get('plotId'));
    }

    if (searchParams.get('plotNumber')) {
      setPlotNumber(searchParams.get('plotNumber'));
    }
  }, [searchParams]);

  // Form validation
  const _validateForm = () => {
    const newErrors: {
      date?: string;
      timeSlot?: string;
      general?: string;
    } = {};

    if (!date) {
      newErrors.date = 'Please select a date for your visit';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date < today) {
        newErrors.date = 'Visit date cannot be in the past';
      }
    }

    if (!timeSlot) {
      newErrors.timeSlot = 'Please select a time slot for your visit';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const _handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      setErrors({ general: 'You must be logged in to book a visit' });
      return;
    }

    if (!projectId && !projectName) {
      setErrors({ general: 'Project information is missing' });
      return;
    }

    if (!date || !timeSlot) {
      return; // Already handled in validation
    }

    setLoading(true);

    try {
      if (requestVisit) {
        const _result = await requestVisit({
          projectId: projectId || undefined,
          plotId: plotId || undefined,
          visitDate: date,
          timeSlot,
          notes: notes.trim() || undefined,
        });

        if (result.success) {
          toast({
            title: 'Visit Request Submitted',
            description: 'Your visit request has been submitted successfully.',
          });

          // Redirect to bookings page
          router.push('/client/visit-bookings');
        } else {
          throw new Error('Failed to submit visit request');
        }
      } else {
        throw new Error('Visit request function not available');
      }
    } catch (error) {
      console.error('Error submitting visit request:', error);

      toast({
        title: 'Error',
        description: 'There was a problem submitting your visit request. Please try again.',
        variant: 'destructive',
      });

      setErrors({
        general: 'Failed to submit your visit request. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <BackButton href={projectId ? `/project/${projectId}` : '/dashboard/client'} label="Back" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Book a Property Visit</h1>
        <p className="text-muted-foreground">Schedule a visit to view your selected property</p>
      </div>

      <Card className="glass-card">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Visit Details</CardTitle>
            <CardDescription>
              Select your preferred date and time for the property visit
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Project Information */}
            {(projectName || projectId) && (
              <div className="space-y-2">
                <Label>Project</Label>
                <div className="flex items-start gap-2 p-3 rounded-md bg-muted/40">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">{projectName || 'Selected Project'}</div>
                    {plotNumber && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3.5 w-3.5" />
                        Plot {plotNumber}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="visit-date">Visit Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full flex justify-start text-left font-normal',
                      !date && 'text-muted-foreground',
                      errors.date && 'border-destructive'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : 'Select a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                  />
                </PopoverContent>
              </Popover>
              {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
            </div>

            {/* Time Slot Selection */}
            <div className="space-y-2">
              <Label htmlFor="time-slot">Time Slot</Label>
              <Select value={timeSlot} onValueChange={setTimeSlot}>
                <SelectTrigger className={cn(errors.timeSlot && 'border-destructive')}>
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        {slot}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.timeSlot && <p className="text-sm text-destructive">{errors.timeSlot}</p>}
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any specific requirements or questions for this visit..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {errors.general && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {errors.general}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                  Submitting...
                </>
              ) : (
                'Request Visit'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
