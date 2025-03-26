'use client';

import { format } from 'date-fns';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { useSuperAdmin } from '@/contexts/super-admin-context';
import type { SystemSettings } from '@/types/super-admin';

export default function SystemSettingsPage() {
  const { user } = useAuth();
  const {
    settings,
    loadingSettings,
    getSettings,
    updateSettings,
    templates,
    loadingTemplates,
    getTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  } = useSuperAdmin();

  const [formSettings, setFormSettings] = useState<Partial<SystemSettings>>({
    maxBookingsPerDay: 10,
    defaultGeofenceRadius: 100,
    announcementDefaults: {
      duration: 7,
      priority: 'medium',
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && user.role === 'SuperAdmin') {
      getSettings();
      getTemplates();
    }
  }, [user]);

  useEffect(() => {
    if (settings) {
      setFormSettings({
        maxBookingsPerDay: settings.maxBookingsPerDay,
        defaultGeofenceRadius: settings.defaultGeofenceRadius,
        announcementDefaults: settings.announcementDefaults,
      });
    }
  }, [settings]);

  const _handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateSettings(formSettings);
      // Show success message
    } catch (error) {
      console.error('Error saving settings:', error);
      // Show error message
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || user.role !== 'SuperAdmin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Unauthorized Access</CardTitle>
            <CardDescription>You do not have permission to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center space-x-2">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/superadmin">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">System Settings</h1>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="templates">Global Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General System Settings</CardTitle>
              <CardDescription>
                Configure global settings that affect the entire platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSettings ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxBookings">Maximum Bookings Per Day</Label>
                    <Input
                      id="maxBookings"
                      type="number"
                      value={formSettings.maxBookingsPerDay}
                      onChange={(e) =>
                        setFormSettings({
                          ...formSettings,
                          maxBookingsPerDay: Number.parseInt(e.target.value),
                        })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      The maximum number of visit bookings allowed per day across all projects.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="geofenceRadius">Default Geofence Radius (meters)</Label>
                    <Input
                      id="geofenceRadius"
                      type="number"
                      value={formSettings.defaultGeofenceRadius}
                      onChange={(e) =>
                        setFormSettings({
                          ...formSettings,
                          defaultGeofenceRadius: Number.parseInt(e.target.value),
                        })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      The default radius (in meters) for manager geofencing at project locations.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="announcementDuration">
                      Default Announcement Duration (days)
                    </Label>
                    <Input
                      id="announcementDuration"
                      type="number"
                      value={formSettings.announcementDefaults?.duration}
                      onChange={(e) =>
                        setFormSettings({
                          ...formSettings,
                          announcementDefaults: {
                            ...formSettings.announcementDefaults!,
                            duration: Number.parseInt(e.target.value),
                          },
                        })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      How long announcements remain active by default.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="announcementPriority">Default Announcement Priority</Label>
                    <Select
                      value={formSettings.announcementDefaults?.priority}
                      onValueChange={(value) =>
                        setFormSettings({
                          ...formSettings,
                          announcementDefaults: {
                            ...formSettings.announcementDefaults!,
                            priority: value as 'low' | 'medium' | 'high',
                          },
                        })
                      }
                    >
                      <SelectTrigger id="announcementPriority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      The default priority level for new announcements.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={isSaving || loadingSettings}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Templates</CardTitle>
              <CardDescription>
                Manage templates that can be used across all projects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTemplates ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button>Create New Template</Button>
                  </div>

                  {templates.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No templates found. Create one to get started.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {templates.map((template) => (
                        <Card key={template.id}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">
                                {template.type === 'plotLayout'
                                  ? 'Plot Layout'
                                  : template.type === 'timeSlots'
                                    ? 'Time Slots'
                                    : 'Manager Tasks'}
                              </Badge>
                              <div className="text-sm text-muted-foreground">
                                Created: {format(template.createdAt, 'MMM d, yyyy')}
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm">
                              Delete
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
