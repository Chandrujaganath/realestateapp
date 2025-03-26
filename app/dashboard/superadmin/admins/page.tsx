'use client';

import { format } from 'date-fns';
import { UserPlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/auth-context';
import { _useSuperAdmin } from '@/contexts/super-admin-context';
import type { AdminUser } from '@/types/super-admin';

export default function AdminManagement() {
  const { user } = useAuth();
  const {
    admins,
    loadingAdmins,
    getAdmins,
    createAdmin,
    updateAdmin,
    deactivateAdmin,
    reactivateAdmin,
  } = _useSuperAdmin();

  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
  });

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [adminToDeactivate, setAdminToDeactivate] = useState<AdminUser | null>(null);
  const [adminToReactivate, setAdminToReactivate] = useState<AdminUser | null>(null);
  useEffect(() => {
    if (user && 'role' in user && user.role === 'SuperAdmin') {
      getAdmins();
    } else if (user && 'isSuperAdmin' in user && user.isSuperAdmin) {
      getAdmins();
    }
  }, [user, getAdmins]);

  const _handleCreateAdmin = async () => {
    try {
      await createAdmin({
        name: newAdmin.name,
        email: newAdmin.email,
        role: 'Admin',
      });

      setNewAdmin({
        name: '',
        email: '',
      });

      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating admin:', error);
      // Handle error (show toast, etc.)
    }
  };

  const _handleDeactivateAdmin = async () => {
    if (adminToDeactivate) {
      try {
        await deactivateAdmin(adminToDeactivate.id);
        setAdminToDeactivate(null);
      } catch (error) {
        console.error('Error deactivating admin:', error);
        // Handle error (show toast, etc.)
      }
    }
  };

  const _handleReactivateAdmin = async () => {
    if (adminToReactivate) {
      try {
        await reactivateAdmin(adminToReactivate.id);
        setAdminToReactivate(null);
      } catch (error) {
        console.error('Error reactivating admin:', error);
        // Handle error (show toast, etc.)
      }
    }
  };

  if (!user || (user && 'role' in user && user.role !== 'SuperAdmin') && (user && 'isSuperAdmin' in user && !user.isSuperAdmin)) {
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
          <h1 className="text-3xl font-bold">Admin Management</h1>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Admin</DialogTitle>
              <DialogDescription>
                Add a new administrator to the system. They will receive an email with login
                instructions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={_handleCreateAdmin} disabled={!newAdmin.name || !newAdmin.email}>
                Create Admin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
          <CardDescription>
            Manage administrator accounts and their access to the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingAdmins ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No admin users found. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.name}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        {admin.isActive ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-200"
                          >
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{format(admin.createdAt, 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        {admin.lastLogin ? format(admin.lastLogin, 'MMM d, yyyy') : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        {admin.isActive ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAdminToDeactivate(admin)}
                              >
                                Deactivate
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Deactivate Admin</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to deactivate {admin.name}? They will no
                                  longer be able to access the system.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setAdminToDeactivate(null)}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction onClick={_handleDeactivateAdmin}>
                                  Deactivate
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAdminToReactivate(admin)}
                              >
                                Reactivate
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reactivate Admin</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to reactivate {admin.name}? They will regain
                                  access to the system.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setAdminToReactivate(null)}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction onClick={_handleReactivateAdmin}>
                                  Reactivate
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
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
