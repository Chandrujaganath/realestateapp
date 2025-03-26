'use client';

import { format } from 'date-fns';
import { ArrowLeft, Search, Download } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useAuth } from '@/contexts/auth-context';
import { useSuperAdmin } from '@/contexts/super-admin-context';

export default function AuditLogsPage() {
  const { user } = useAuth();
  const { auditLogs, loadingAuditLogs, getAuditLogs } = useSuperAdmin();

  const [filters, setFilters] = useState({
    actionType: '',
    performedBy: '',
    resourceType: '',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date(),
    },
  });

  useEffect(() => {
    if (user && user.role === 'SuperAdmin') {
      getAuditLogs(filters);
    }
  }, [user]);

  const _handleSearch = () => {
    getAuditLogs(filters);
  };

  const _handleExport = () => {
    // Implementation for exporting logs to CSV
    alert('Export functionality would be implemented here');
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
        <h1 className="text-3xl font-bold">Audit Logs</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find specific actions or filter by user, type, or date range.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="actionType">Action Type</Label>
              <Select
                value={filters.actionType}
                onValueChange={(value) => setFilters({ ...filters, actionType: value })}
              >
                <SelectTrigger id="actionType">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Actions</SelectItem>
                  <SelectItem value="CREATE_ADMIN">Create Admin</SelectItem>
                  <SelectItem value="UPDATE_ADMIN">Update Admin</SelectItem>
                  <SelectItem value="DEACTIVATE_ADMIN">Deactivate Admin</SelectItem>
                  <SelectItem value="CREATE_TEMPLATE">Create Template</SelectItem>
                  <SelectItem value="UPDATE_SETTINGS">Update Settings</SelectItem>
                  {/* Add more action types as needed */}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resourceType">Resource Type</Label>
              <Select
                value={filters.resourceType}
                onValueChange={(value) => setFilters({ ...filters, resourceType: value })}
              >
                <SelectTrigger id="resourceType">
                  <SelectValue placeholder="All Resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Resources</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="visit">Visit</SelectItem>
                  {/* Add more resource types as needed */}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={format(filters.dateRange.start, 'yyyy-MM-dd')}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    dateRange: {
                      ...filters.dateRange,
                      start: new Date(e.target.value),
                    },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={format(filters.dateRange.end, 'yyyy-MM-dd')}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    dateRange: {
                      ...filters.dateRange,
                      end: new Date(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Log Results</CardTitle>
          <CardDescription>Showing {auditLogs.length} results</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingAuditLogs ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No audit logs found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{format(log.timestamp, 'MMM d, yyyy HH:mm:ss')}</TableCell>
                      <TableCell>
                        {log.performedBy.name}
                        <div className="text-xs text-muted-foreground">{log.performedBy.role}</div>
                      </TableCell>
                      <TableCell>{log.actionType}</TableCell>
                      <TableCell>
                        {log.targetResource.type}
                        {log.targetResource.name && (
                          <div className="text-xs text-muted-foreground">
                            {log.targetResource.name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
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
