'use client';

import { ArrowLeft, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type React from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { UserRole } from '@/features/users/types/user';
import { useAuth } from '@/hooks/use-auth';

export default function CreateAnnouncementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { createAnnouncement } = useAuth() as unknown as {
    createAnnouncement: (data: any) => Promise<string>;
  };
  const [loading, setLoading] = useState(false);
  const [sendNotification, setSendNotification] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium' as const,
    targetRoles: [] as UserRole[],
    expiresAt: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const _handlePriorityChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      priority: value as typeof prev.priority,
    }));
  };

  const handleRoleToggle = (role: UserRole) => {
    setFormData((prev) => {
      const roles = [...prev.targetRoles];
      if (roles.includes(role)) {
        return { ...prev, targetRoles: roles.filter((_r) => _r !== role) };
      } else {
        return { ...prev, targetRoles: [...roles, role] };
      }
    });
  };

  const _handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const _announcementData = {
        ...formData,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
      };

      // Create the announcement
      const announcementId = await createAnnouncement(_announcementData);

      // Send notification if option is selected
      if (sendNotification && announcementId) {
        try {
          const _response = await fetch('/api/announcements/notify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ announcementId }),
          });

          if (!_response.ok) {
            console.error('Failed to send notifications');
          }
        } catch (notificationError) {
          console.error('Error sending notifications:', notificationError);
        }
      }

      toast({
        title: 'Success',
        description: 'Announcement created successfully',
      });

      router.push('/admin/announcements');
    } catch (error) {
      console.error('Error creating announcement:', error);

      toast({
        title: 'Error',
        description: 'Failed to create announcement',
        variant: 'destructive',
      });

      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Create Announcement</h1>
      </div>

      <form onSubmit={_handleSubmit}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Announcement Details</CardTitle>
            <CardDescription>Create a new announcement to be displayed to users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter announcement title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Enter announcement content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows={5}
                />
              </div>

              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={_handlePriorityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="expiresAt"
                    name="expiresAt"
                    type="date"
                    value={formData.expiresAt}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Target Roles</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="role-guest"
                      checked={formData.targetRoles.includes('guest')}
                      onCheckedChange={() => handleRoleToggle('guest')}
                    />
                    <Label htmlFor="role-guest" className="cursor-pointer">
                      Guest
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="role-client"
                      checked={formData.targetRoles.includes('client')}
                      onCheckedChange={() => handleRoleToggle('client')}
                    />
                    <Label htmlFor="role-client" className="cursor-pointer">
                      Client
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="role-manager"
                      checked={formData.targetRoles.includes('manager')}
                      onCheckedChange={() => handleRoleToggle('manager')}
                    />
                    <Label htmlFor="role-manager" className="cursor-pointer">
                      Manager
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="role-admin"
                      checked={formData.targetRoles.includes('admin')}
                      onCheckedChange={() => handleRoleToggle('admin')}
                    />
                    <Label htmlFor="role-admin" className="cursor-pointer">
                      Admin
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="role-superadmin"
                      checked={formData.targetRoles.includes('superadmin')}
                      onCheckedChange={() => handleRoleToggle('superadmin')}
                    />
                    <Label htmlFor="role-superadmin" className="cursor-pointer">
                      Super Admin
                    </Label>
                  </div>
                </div>
                {formData.targetRoles.length === 0 && (
                  <p className="text-sm text-red-500">Please select at least one role</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendNotification"
                  checked={sendNotification}
                  onCheckedChange={() => setSendNotification(!sendNotification)}
                />
                <Label htmlFor="sendNotification" className="cursor-pointer">
                  Send push notification to users
                </Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || formData.targetRoles.length === 0}>
              {loading ? 'Creating...' : 'Create Announcement'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
