'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { getCookie } from 'cookies-next';

// User type for consistent usage across the app
type User = {
  uid?: string;
  role?: string;
  displayName?: string;
  email?: string;
};

// Expanded auth context to include common functions needed by the app
type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  getManagerTasks: () => Promise<any[]>;
  updateTaskStatus: (taskId: string, status: string, feedback?: string) => Promise<void>;
  getVisitRequests: () => Promise<any[]>;
  approveVisitRequest: (requestId: string) => Promise<void>;
  rejectVisitRequest: (requestId: string, reason: string) => Promise<void>;
  getUserOwnedPlots: () => Promise<any[]>;
  submitSellRequest: (plotId: string, details: any) => Promise<void>;
  requestVisit: (details: any) => Promise<void>;
  getManagerLeaveRequests: () => Promise<any[]>;
  submitLeaveRequest: (details: any) => Promise<void>;
  verifyQrCode: (code: string) => Promise<boolean>;
};

// Create context with default mock implementations
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  getManagerTasks: async () => [],
  updateTaskStatus: async () => {},
  getVisitRequests: async () => [],
  approveVisitRequest: async () => {},
  rejectVisitRequest: async () => {},
  getUserOwnedPlots: async () => [],
  submitSellRequest: async () => {},
  requestVisit: async () => {},
  getManagerLeaveRequests: async () => [],
  submitLeaveRequest: async () => {},
  verifyQrCode: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for auth cookies on startup
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authToken = getCookie('authToken');
        const userRole = getCookie('userRole');

        if (authToken && userRole) {
          setUser({
            uid: 'user-id', // Placeholder since we don't decode the token
            role: userRole.toString(),
            displayName: 'Test User', // Mock data for development
            email: 'user@example.com',
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    
    // Listen for cookie changes
    const interval = setInterval(checkAuth, 5000);
    return () => clearInterval(interval);
  }, []);

  // Mock sign out implementation
  const signOut = async () => {
    // Clear cookies and state
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setUser(null);
    window.location.href = '/auth/login';
  };

  // Mock implementation for getManagerTasks
  const getManagerTasks = async () => {
    console.log('Mock getManagerTasks called');
    return [
      {
        id: 'task1',
        status: 'pending',
        type: 'visit_request',
        priority: 'high',
        description: 'Client requested a visit to Project X',
        projectName: 'Project X',
        projectId: 'project-x',
        createdAt: new Date(),
        dueDate: new Date(Date.now() + 86400000),
        requestorName: 'John Doe',
        requestorRole: 'client',
      },
      {
        id: 'task2',
        status: 'in_progress',
        type: 'sell_request',
        priority: 'medium',
        description: 'Client wants to sell Plot Y',
        projectName: 'Project Y',
        projectId: 'project-y',
        plotId: 'plot-y',
        plotNumber: 'Y-123',
        createdAt: new Date(),
        requestorName: 'Jane Smith',
        requestorRole: 'client',
      },
    ];
  };

  // Mock implementation for updateTaskStatus
  const updateTaskStatus = async (taskId: string, status: string, feedback?: string) => {
    console.log(`Mock updateTaskStatus: taskId=${taskId}, status=${status}, feedback=${feedback}`);
  };

  // Additional mock implementations for required functions
  const getVisitRequests = async () => {
    console.log('Mock getVisitRequests called');
    return [];
  };

  const approveVisitRequest = async (requestId: string) => {
    console.log(`Mock approveVisitRequest: requestId=${requestId}`);
  };

  const rejectVisitRequest = async (requestId: string, reason: string) => {
    console.log(`Mock rejectVisitRequest: requestId=${requestId}, reason=${reason}`);
  };

  const getUserOwnedPlots = async () => {
    console.log('Mock getUserOwnedPlots called');
    return [];
  };

  const submitSellRequest = async (plotId: string, details: any) => {
    console.log(`Mock submitSellRequest: plotId=${plotId}, details=`, details);
  };

  const requestVisit = async (details: any) => {
    console.log('Mock requestVisit called with details:', details);
  };

  const getManagerLeaveRequests = async () => {
    console.log('Mock getManagerLeaveRequests called');
    return [];
  };

  const submitLeaveRequest = async (details: any) => {
    console.log('Mock submitLeaveRequest called with details:', details);
  };

  const verifyQrCode = async (code: string) => {
    console.log(`Mock verifyQrCode called with code: ${code}`);
    return code === 'valid-code';
  };

  // Provide all auth-related functions and state
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading,
        signOut,
        getManagerTasks,
        updateTaskStatus,
        getVisitRequests,
        approveVisitRequest,
        rejectVisitRequest,
        getUserOwnedPlots,
        submitSellRequest,
        requestVisit,
        getManagerLeaveRequests,
        submitLeaveRequest,
        verifyQrCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 