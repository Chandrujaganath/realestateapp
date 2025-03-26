'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';

interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  startDate: Timestamp;
  endDate: Timestamp;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
}

export default function ManagerLeaveRequestsPage() {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const _fetchLeaveRequests = async () => {
      try {
        setLoading(true);
        // Check if db is defined before using it
        if (!db) {
          throw new Error('Firebase database is not initialized');
        }
        const _leaveRequestsRef = collection(db, 'leaveRequests');
        const _q = query(
          _leaveRequestsRef,
          where('managerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const _querySnapshot = await getDocs(_q);
        const requests: LeaveRequest[] = [];

        _querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<LeaveRequest, 'id'>;
          requests.push({ id: doc.id, ...data });
        });

        setLeaveRequests(requests);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
        toast.error('Failed to load leave requests');
      } finally {
        setLoading(false);
      }
    };

    _fetchLeaveRequests();
  }, [user]);

  const handleUpdateStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      // Check if db is defined before using it
      if (!db) {
        throw new Error('Firebase database is not initialized');
      }
      const _requestRef = doc(db, 'leaveRequests', requestId);
      await updateDoc(_requestRef, {
        status,
        updatedAt: Timestamp.now(),
      });

      // Update local state
      setLeaveRequests((_prev) =>
        _prev.map((request) => (request.id === requestId ? { ...request, status } : request))
      );

      toast.success(
        `Leave request ${status === 'approved' ? 'approved' : 'rejected'} successfully`
      );
    } catch (error) {
      console.error('Error updating leave request:', error);
      toast.error('Failed to update leave request status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading leave requests...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Leave Requests</h1>

      {leaveRequests.length === 0 ? (
        <p className="text-center py-8">No leave requests pending your approval</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leaveRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{request.userName}</span>
                  <StatusBadge status={request.status} />
                </CardTitle>
                <CardDescription>
                  Requested{' '}
                  {formatDistanceToNow(request.createdAt.toDate(), {
                    addSuffix: true,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Leave Period:</p>
                    <p>
                      {request.startDate.toDate().toLocaleDateString()} -{' '}
                      {request.endDate.toDate().toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Reason:</p>
                    <p>{request.reason}</p>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => handleUpdateStatus(request.id, 'approved')}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleUpdateStatus(request.id, 'rejected')}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'approved':
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="mr-1 h-3 w-3" /> Approved
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="mr-1 h-3 w-3" /> Rejected
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="mr-1 h-3 w-3" /> Pending
        </Badge>
      );
  }
}
