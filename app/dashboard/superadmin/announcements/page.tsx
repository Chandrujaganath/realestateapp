'use client';

import { format, addDays } from 'date-fns';
import { ArrowLeft, Plus, Edit, Trash, Megaphone } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { useSuperAdmin } from '@/contexts/super-admin-context';

// This would typically be in your types file
interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  targetRoles: string[];
  startDate: Date;
  endDate: Date;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: Date;
  isGlobal: boolean;
}

export default function GlobalAnnouncementsPage() {
  const { user } = useAuth();
  const { settings } = useSuperAdmin();

  // In a real app, you'd have these in your context
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    targetRoles: ['Guest', 'Client', 'Manager', 'Admin', 'SuperAdmin'],
    startDate: new Date(),
    endDate: addDays(new Date(), settings?.announcementDefaults?.duration || 7),
    isGlobal: true,
  });

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Simulate fetching announcements
  useEffect(() => {
    if (user && user.role === 'SuperAdmin') {
      // Simulate API call
      setTimeout(() => {
        setAnnouncements([
          {
            id: '1',
            title: 'System Maintenance',
            content: 'The system will be down for maintenance on Saturday from 2-4 AM.',
            priority: 'high',
            targetRoles: ['Guest', 'Client', 'Manager', 'Admin', 'SuperAdmin'],
            startDate: new Date(),
            endDate: addDays(new Date(), 7),
            createdBy: {
              id: '123',
              name: 'System Admin',
              role: 'SuperAdmin',
            },
            createdAt: new Date(),
            isGlobal: true,
          },
          {
            id: '2',
            title: 'New Feature: Enhanced Reporting',
            content: 'We have added new reporting capabilities for managers and admins.',
            priority: 'medium',
            targetRoles: ['Manager', 'Admin'],
            startDate: new Date(),
            endDate: addDays(new Date(), 14),
            createdBy: {
              id: '123',
              name: 'System Admin',
              role: 'SuperAdmin',
            },
            createdAt: new Date(),
            isGlobal: true,
          },
        ]);
        setLoadingAnnouncements(false);
      }, 1000);
    }
  }, [user]);

  const _handleCreateAnnouncement = () => {
    // In a real app, you'd call an API or context method
    const _newId = Math.random().toString(36).substring(2, 9);

    const announcement: Announcement = {
      id: newId,
      ...newAnnouncement,
      createdBy: {
        id: user?.uid || '',
        name: user?.displayName || '',
        role: 'SuperAdmin',
      },
      createdAt: new Date(),
    };

    setAnnouncements([announcement, ...announcements]);
    setCreateDialogOpen(false);

    // Reset form
    setNewAnnouncement({
      title: '',
      content: '',
      priority: 'medium',
      targetRoles: ['Guest', 'Client', 'Manager', 'Admin', 'SuperAdmin'],
      startDate: new Date(),
      endDate: addDays(new Date(), settings?.announcementDefaults?.duration || 7),
      isGlobal: true,
    });
  };

  const _handleDeleteAnnouncement = (id: string) => {
    // In a real app, you'd call an API or context method
    setAnnouncements(announcements.filter((_a) => a.id !== id));
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/superadmin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Global Announcements</h1>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Global Announcement</DialogTitle>
              <DialogDescription>
                Create a new announcement that will be visible to selected roles.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newAnnouncement.title}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  rows={4}
                  value={newAnnouncement.content}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      content: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newAnnouncement.priority}
                  onValueChange={(value) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      priority: value as 'low' | 'medium' | 'high',
                    })
                  }
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={format(newAnnouncement.startDate, 'yyyy-MM-dd')}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        startDate: new Date(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={format(newAnnouncement.endDate, 'yyyy-MM-dd')}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        endDate: new Date(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Target Roles</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Guest', 'Client', 'Manager', 'Admin', 'SuperAdmin'].map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`role-${role}`}
                        checked={newAnnouncement.targetRoles.includes(role)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewAnnouncement({
                              ...newAnnouncement,
                              targetRoles: [...newAnnouncement.targetRoles, role],
                            });
                          } else {
                            setNewAnnouncement({
                              ...newAnnouncement,
                              targetRoles: newAnnouncement.targetRoles.filter((_r) => r !== role),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={`role-${role}`}>{role}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateAnnouncement}
                disabled={!newAnnouncement.title || !newAnnouncement.content}
              >
                Create Announcement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
          <CardDescription>Manage system-wide announcements visible to users.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingAnnouncements ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Target Roles</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No announcements found. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  announcements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Megaphone className="h-4 w-4 text-muted-foreground" />
                          <span>{announcement.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            announcement.priority === 'high'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : announcement.priority === 'medium'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-green-50 text-green-700 border-green-200'
                          }
                        >
                          {announcement.priority.charAt(0).toUpperCase() +
                            announcement.priority.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {announcement.targetRoles.map((role) => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(announcement.startDate, 'MMM d')} -{' '}
                          {format(announcement.endDate, 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {announcement.createdBy.name}
                          <div className="text-xs text-muted-foreground">
                            {format(announcement.createdAt, 'MMM d, yyyy')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteAnnouncement(announcement.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
