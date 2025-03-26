'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, _useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';

import { useAnnouncements } from '@/hooks/use-announcements';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Announcement, AnnouncementFormData } from '@/types/announcement';

// Role options
const _roleOptions = [
  { id: 'admin', label: 'Admin' },
  { id: 'superadmin', label: 'Super Admin' },
  { id: 'manager', label: 'Manager' },
  { id: 'client', label: 'Client' },
  { id: 'guest', label: 'Guest' },
];

// Priority options
const _priorityOptions = [
  { id: 'low', label: 'Low', description: 'Informational announcements' },
  { id: 'medium', label: 'Medium', description: 'Important announcements' },
  { id: 'high', label: 'High', description: 'Critical/urgent announcements' },
];

// Status options
const _statusOptions = [
  { id: 'active', label: 'Active', description: 'Visible to users' },
  { id: 'archived', label: 'Archived', description: 'Hidden from users' },
];

// Form schema
const formSchema = z.object({
  title: z
    .string()
    .min(3, {
      message: 'Title must be at least 3 characters.',
    })
    .max(100, {
      message: 'Title cannot exceed 100 characters.',
    }),
  content: z
    .string()
    .min(10, {
      message: 'Content must be at least 10 characters.',
    })
    .max(500, {
      message: 'Content cannot exceed 500 characters.',
    }),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'You must select a priority level.',
  }),
  targetRoles: z.array(z.string()).min(1, {
    message: 'You must select at least one role.',
  }),
  expiresAt: z.date({
    required_error: 'Please select an expiration date.',
  }),
  status: z.enum(['active', 'archived'], {
    required_error: 'You must select a status.',
  }),
});

interface AnnouncementFormProps {
  announcement?: Announcement;
  mode: 'create' | 'edit';
}

export function AnnouncementForm({ announcement, mode }: AnnouncementFormProps) {
  const router = useRouter();
  const { createAnnouncement, updateAnnouncement } = useAnnouncements();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: announcement?.title || '',
      content: announcement?.content || '',
      priority: announcement?.priority || 'medium',
      targetRoles: announcement?.targetRoles || [],
      expiresAt: announcement?.expiresAt
        ? new Date(announcement.expiresAt)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
      status: announcement?.status || 'active',
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Format the Date to ISO string for the API
      const formattedValues = {
        ...values,
        expiresAt: values.expiresAt.toISOString(),
      } as AnnouncementFormData;

      if (mode === 'create') {
        // Create new announcement
        const _announcementId = await createAnnouncement(formattedValues);
        if (announcementId) {
          router.push('/admin/announcements');
        }
      } else if (mode === 'edit' && announcement) {
        // Update existing announcement
        const _success = await updateAnnouncement(announcement.id, formattedValues);
        if (success) {
          router.push('/admin/announcements');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create New Announcement' : 'Edit Announcement'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter announcement title" {...field} />
                  </FormControl>
                  <FormDescription>A clear, concise title for the announcement.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter announcement content"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The main message of your announcement. Keep it clear and brief.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Priority</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {priorityOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.id} id={`priority-${option.id}`} />
                          <Label htmlFor={`priority-${option.id}`} className="font-normal">
                            {option.label} -{' '}
                            <span className="text-muted-foreground text-sm">
                              {option.description}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetRoles"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Target Roles</FormLabel>
                    <FormDescription>
                      Select which user roles should see this announcement.
                    </FormDescription>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {roleOptions.map((role) => (
                      <FormField
                        key={role.id}
                        control={form.control}
                        name="targetRoles"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={role.id}
                              className="flex flex-row items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(role.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, role.id])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== role.id)
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{role.label}</FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiration Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-[240px] pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    The date when this announcement will no longer be shown.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {statusOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.id} id={`status-${option.id}`} />
                          <Label htmlFor={`status-${option.id}`} className="font-normal">
                            {option.label} -{' '}
                            <span className="text-muted-foreground text-sm">
                              {option.description}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? mode === 'create'
                    ? 'Creating...'
                    : 'Updating...'
                  : mode === 'create'
                    ? 'Create Announcement'
                    : 'Update Announcement'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
