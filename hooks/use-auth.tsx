"use client";

import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, arrayUnion, query, where, orderBy, collection, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { setCookie, deleteCookie } from 'cookies-next';
import { format } from 'date-fns';

// Custom user interface that extends Firebase User
export interface ExtendedUser extends User {
  role?: string;
  displayName: string | null;
}

export interface UserData {
  uid: string;
  displayName: string | null;
  email: string | null;
  city?: string;
  isOnLeave?: boolean;
  leaveEndDate?: Date;
  assignedProjects?: string[];
}

export interface LeaveRequest {
  id: string;
  managerName: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
}

export interface AttendanceRecord {
  id: string;
  managerId: string;
  managerName?: string;
  date: Date;
  clockInTime?: Date;
  clockOutTime?: Date;
  totalHours: number;
  geofenceEvents: Array<{
    type: string;
    timestamp: Date;
    location?: { latitude: number; longitude: number };
  }>;
}

export interface AuthContextType {
  [x: string]: any;
  user: ExtendedUser | null;
  loading: boolean;
  error: string | null;
  userRole: string | null;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, role?: string) => Promise<User>;
  signUpAsGuest: (email: string, password: string, name: string, phone: string) => Promise<User>;
  signUpAsClient: (email: string, password: string, name: string, phone: string) => Promise<User>;
  signOut: () => Promise<void>;
  registerUser: (user: ExtendedUser) => Promise<void>;
  getUserByEmail: (email: string) => Promise<UserData | null>;
  getUserById: (uid: string) => Promise<UserData | null>;
  getUserRole: () => string | null;
  createClient: (user: ExtendedUser) => Promise<void>;
  getOwnerId: (user: ExtendedUser) => Promise<string | null>;
  getClientDetails: (user: ExtendedUser) => Promise<UserData>;
  getManagerDetails: (user: ExtendedUser) => Promise<UserData>;
  getFullName: (user: ExtendedUser) => Promise<string>;
  getGuestDetails: (user: ExtendedUser) => Promise<UserData>;
  getProjects: () => Promise<any[]>;
  getProjectById: (id: string) => Promise<any>;
  createProject: (data: any) => Promise<void>;
  updateProject: (id: string, data: any) => Promise<void>;
  getProjectTemplates: () => Promise<any[]>;
  getAnnouncements: () => Promise<any[]>;
  deleteAnnouncement: (id: string) => Promise<void>;
  getUserOwnedPlots: () => Promise<any[]>;
  generateVisitorQr: (plotId: string, visitorName: string, visitorPhone: string, validFor: number) => Promise<string>;
  hasActiveVisitorQr: () => Promise<boolean>;
  submitSellRequest: (plotId: string, reason: string) => Promise<void>;
  getManagerTasks: () => Promise<any[]>;
  updateTaskStatus: (taskId: string, status: string, comment?: string) => Promise<void>;
  isManagerClockedIn: () => Promise<boolean>;
  checkInManager: () => Promise<boolean | void>;
  checkOutManager: () => Promise<boolean | void>;
  isWithinGeofence: (lat: number, lng: number) => boolean;
  getVisitRequests: () => Promise<any[]>;
  approveVisitRequest: (visitId: string) => Promise<void>;
  rejectVisitRequest: (visitId: string, reason: string) => Promise<void>;
  createAnnouncement: (data: any) => Promise<string | void>;
  verifyQrCode: (qrData: { type: string; id: string; token?: string }) => Promise<any>;
  requestVisit: (visitData: {
    projectId?: string;
    plotId?: string;
    visitDate: Date;
    timeSlot: string;
    notes?: string;
  }) => Promise<{ success: boolean } | void>;
  getClientVisitBookings: () => Promise<any[]>;
  cancelVisitBooking: (bookingId: string) => Promise<void>;
  getManagerAttendance: (startDate?: Date, endDate?: Date) => Promise<AttendanceRecord[]>;
  getAllManagersAttendance: (startDate?: Date, endDate?: Date) => Promise<{[managerId: string]: AttendanceRecord[]}>;
  getManagers: () => Promise<UserData[]>;
  getAllLeaveRequests: () => Promise<LeaveRequest[]>;
  approveLeaveRequest: (id: string) => Promise<void>;
  rejectLeaveRequest: (id: string, reason: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Set Firebase token in cookie
  const setFirebaseTokenCookie = async (firebaseUser: User) => {
    try {
      const token = await firebaseUser.getIdToken();
      // Set token cookie - this will be used by the middleware
      setCookie('authToken', token, { 
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      return token;
    } catch (error) {
      console.error('Error setting auth token cookie:', error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth!, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Set the token cookie
          await setFirebaseTokenCookie(firebaseUser);
          
          const userDoc = await getDoc(doc(db!, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Ensure role is lowercase for consistency
            const role = userData.role?.toLowerCase();
            
            // Set user with additional data from Firestore
            setUser({ 
              ...firebaseUser, 
              role 
            } as ExtendedUser);
            
            setUserRole(role);
            
            // Redirect based on role if we're on a non-role specific page
            const path = window.location.pathname;
            if (path === '/' || path === '/auth/login') {
              if (role) {
                if (role === "admin") {
                  router.push("/dashboard/admin");
                } else if (role === "client") {
                  router.push("/dashboard/client");
                } else if (role === "manager") {
                  router.push("/dashboard/manager");
                } else if (role === "guest") {
                  router.push("/dashboard/guest");
                } else if (role === "superadmin") {
                  router.push("/dashboard/superadmin");
                } else {
                  router.push("/dashboard");
                }
              } else {
                // If no role is found, redirect to a default page
                router.push("/settings");
              }
            }
          } else {
            // If user exists in Firebase but not in Firestore, create a default profile
            if (!db) throw new Error("Firestore instance not initialized");
            await setDoc(doc(db, "users", firebaseUser.uid), {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
              role: "client", // Default role
              createdAt: serverTimestamp()
            });
            
            setUser({ 
              ...firebaseUser, 
              role: "client" 
            } as ExtendedUser);
            
            setUserRole("client");
            
            // Redirect new user to dashboard
            const path = window.location.pathname;
            if (path === '/' || path === '/auth/login') {
              router.push("/dashboard/client");
            }
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUser(firebaseUser as ExtendedUser);
          
          // If there's an error, redirect to a safe fallback
          const path = window.location.pathname;
          if (path === '/' || path === '/auth/login') {
            router.push("/dashboard");
          }
        }
      } else {
        setUser(null);
        setUserRole(null);
        // Clear token cookie on logout
        deleteCookie('authToken');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const signIn = async (email: string, password: string) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth!, email, password);
      // Set token in cookie after successful sign in
      await setFirebaseTokenCookie(user);
      return user;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, role = "client"): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      
      const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
      const user = userCredential.user;
      
      // Create user document with the specified role
      await setDoc(doc(db!, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        role: role,
        displayName: user.displayName || email.split('@')[0],
        createdAt: serverTimestamp()
      });
      
      // Set auth state
      setUser({
        ...user,
        role
      } as ExtendedUser);
      setUserRole(role);
      
      // Set token in cookie
      await setFirebaseTokenCookie(user);
      
      // Redirect based on role
      if (role === "guest") {
        router.push('/dashboard/guest');
      } else {
        router.push('/dashboard/client');
      }
      
      return user;
    } catch (error: any) {
      console.error("Error in signUp:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpAsGuest = async (email: string, password: string, name: string, phone: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
      const user = userCredential.user;
      
      // Set expiry date (30 days from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      
      // Create user document in Firestore
      if (!db) throw new Error("Firestore is not initialized");
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        phone: phone,
        role: "guest",
        expiryDate: expiryDate.toISOString(),
        createdAt: serverTimestamp()
      });
      
      // Set auth state
      setUser({
        ...user,
        displayName: name,
        role: "guest"
      } as ExtendedUser);
      setUserRole("guest");
      
      // Store Firebase token in cookie for server-side auth
      await setFirebaseTokenCookie(user);
      
      router.push('/dashboard/guest');
      return user;
    } catch (error: any) {
      console.error("Error in signUpAsGuest:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpAsClient = async (email: string, password: string, name: string, phone: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore
      if (!db) throw new Error("Firestore is not initialized");
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        phone: phone,
        role: "client",
        createdAt: serverTimestamp()
      });
      
      // Set auth state
      setUser({
        ...user,
        displayName: name,
        role: "client"
      } as ExtendedUser);
      setUserRole("client");
      
      // Store Firebase token in cookie for server-side auth
      await setFirebaseTokenCookie(user);
      
      router.push('/dashboard/client');
      return user;
    } catch (error: any) {
      console.error("Error in signUpAsClient:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth!);
    // Clear token cookie
    deleteCookie('authToken');
    router.push("/auth/login");
  };

  // Manager related methods (placeholder implementations)
  const getManagers = async (): Promise<UserData[]> => {
    // This would be implemented to fetch managers from your database
    return [];
  };

  const getAllLeaveRequests = async (): Promise<LeaveRequest[]> => {
    // This would be implemented to fetch leave requests
    return [];
  };

  const approveLeaveRequest = async (id: string): Promise<void> => {
    // This would be implemented to approve a leave request
  };

  const rejectLeaveRequest = async (id: string, reason: string): Promise<void> => {
    // This would be implemented to reject a leave request
  };

  // Stub implementations for additional functions
  const getProjects = async () => {
    console.warn("getProjects not fully implemented");
    return [];
  };

  const getProjectById = async (id: string) => {
    console.warn("getProjectById not fully implemented");
    return null;
  };

  const createProject = async (data: any) => {
    console.warn("createProject not fully implemented");
  };

  const updateProject = async (id: string, data: any) => {
    console.warn("updateProject not fully implemented");
  };

  const getProjectTemplates = async () => {
    console.warn("getProjectTemplates not fully implemented");
    return [];
  };

  const getAnnouncements = async () => {
    try {
      // Create the query
      if (!db) throw new Error("Firestore is not initialized");
      const announcementsRef = collection(db, "announcements");
      const announcementsQuery = query(
        announcementsRef,
        where("expiresAt", ">", new Date()), // Only get unexpired announcements
        orderBy("expiresAt", "asc"), // Order by expiration date ascending
        orderBy("createdAt", "desc") // Then by creation date descending
      );
      
      // Get the announcements
      const querySnapshot = await getDocs(announcementsQuery);
      
      // Format the announcements
      const announcements = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          content: data.content,
          createdAt: data.createdAt?.toDate(),
          createdBy: data.createdBy,
          priority: data.priority,
          status: data.status || "active",
          targetRoles: data.targetRoles || [],
          expiresAt: data.expiresAt?.toDate(),
        };
      });
      
      return announcements;
    } catch (error) {
      console.error("Error getting announcements:", error);
      return [];
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      if (!db) throw new Error("Firestore is not initialized");
      await deleteDoc(doc(db, "announcements", id));
    } catch (error) {
      console.error("Error deleting announcement:", error);
      throw error;
    }
  };

  const getUserOwnedPlots = async () => {
    console.warn("getUserOwnedPlots not fully implemented");
    return [];
  };

  const generateVisitorQr = async (plotId: string, visitorName: string, visitorPhone: string, validFor: number) => {
    console.warn("generateVisitorQr not fully implemented");
    return "";
  };

  const hasActiveVisitorQr = async () => {
    console.warn("hasActiveVisitorQr not fully implemented");
    return false;
  };

  const submitSellRequest = async (plotId: string, reason: string) => {
    console.warn("submitSellRequest not fully implemented");
  };

  const getManagerTasks = async () => {
    console.warn("getManagerTasks not fully implemented");
    return [];
  };

  const updateTaskStatus = async (taskId: string, status: string, comment?: string) => {
    console.warn("updateTaskStatus not fully implemented");
  };

  const isManagerClockedIn = async () => {
    try {
      if (!user) return false;
      
      const today = new Date();
      const dateString = format(today, "yyyy-MM-dd");
      const attendanceId = `${user.uid}-${dateString}`;
      
      const attendanceDoc = await getDoc(doc(db!, "attendance", attendanceId));
      
      if (attendanceDoc.exists()) {
        const attendanceData = attendanceDoc.data();
        return !!attendanceData.clockInTime && !attendanceData.clockOutTime;
      }
      
      return false;
    } catch (error) {
      console.error("Error checking if manager is clocked in:", error);
      return false;
    }
  };

  const checkInManager = async (): Promise<boolean | void> => {
    try {
      if (!user) throw new Error("User not authenticated");
      
      const today = new Date();
      const dateString = format(today, "yyyy-MM-dd");
      const attendanceId = `${user.uid}-${dateString}`;
      const now = new Date();
      
      // Get user's location if available
      let location = null;
      try {
        if (navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        }
      } catch (locError) {
        console.warn("Failed to get location:", locError);
      }
      
      // Check if an attendance record already exists for today
      const attendanceDoc = await getDoc(doc(db!, "attendance", attendanceId));
      
      if (attendanceDoc.exists()) {
        const attendanceData = attendanceDoc.data();
        
        // If already checked in but not checked out, return
        if (attendanceData.clockInTime && !attendanceData.clockOutTime) {
          return;
        }
        
        // If checked out already, allow checking in again
        await updateDoc(doc(db!, "attendance", attendanceId), {
          clockInTime: now,
          lastUpdated: serverTimestamp(),
          geofenceEvents: arrayUnion({
            type: "check-in",
            timestamp: now,
            location: location,
          }),
        });
      } else {
        // Create a new attendance record
        await setDoc(doc(db!, "attendance", attendanceId), {
          id: attendanceId,
          managerId: user.uid,
          managerName: user.displayName || user.email,
          date: today,
          clockInTime: now,
          clockOutTime: null,
          totalHours: 0,
          lastUpdated: serverTimestamp(),
          geofenceEvents: [{
            type: "check-in",
            timestamp: now,
            location: location,
          }],
        });
      }
      
      // Also update user's status in their profile
      await updateDoc(doc(db!, "users", user.uid), {
        lastClockIn: now,
        isOnDuty: true,
      });
      
      return true;
    } catch (error) {
      console.error("Error checking in manager:", error);
      throw error;
    }
  };

  const checkOutManager = async (): Promise<boolean | void> => {
    try {
      if (!user) throw new Error("User not authenticated");
      
      const today = new Date();
      const dateString = format(today, "yyyy-MM-dd");
      const attendanceId = `${user.uid}-${dateString}`;
      const now = new Date();
      
      // Get user's location if available
      let location = null;
      try {
        if (navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        }
      } catch (locError) {
        console.warn("Failed to get location:", locError);
      }
      
      // Check if an attendance record exists for today
      const attendanceDoc = await getDoc(doc(db!, "attendance", attendanceId));
      
      if (attendanceDoc.exists()) {
        const attendanceData = attendanceDoc.data();
        
        // If checked out already, no need to do anything
        if (!attendanceData.clockInTime || attendanceData.clockOutTime) {
          return;
        }
        
        // Calculate hours worked
        const clockInTime = attendanceData.clockInTime.toDate();
        const diffMs = now.getTime() - clockInTime.getTime();
        const totalHours = diffMs / (1000 * 60 * 60);
        
        // Update the record with check-out time and total hours
        await updateDoc(doc(db!, "attendance", attendanceId), {
          clockOutTime: now,
          totalHours: parseFloat(totalHours.toFixed(2)),
          lastUpdated: serverTimestamp(),
          geofenceEvents: arrayUnion({
            type: "check-out",
            timestamp: now,
            location: location,
          }),
        });
        
        // Also update user's status in their profile
        await updateDoc(doc(db!, "users", user.uid), {
          lastClockOut: now,
          isOnDuty: false,
        });
      } else {
        // No check-in record found, create one with both check-in and check-out
        await setDoc(doc(db!, "attendance", attendanceId), {
          id: attendanceId,
          managerId: user.uid,
          managerName: user.displayName || user.email,
          date: today,
          clockInTime: now, // Set check-in to now as a fallback
          clockOutTime: now,
          totalHours: 0,
          lastUpdated: serverTimestamp(),
          geofenceEvents: [
            {
              type: "check-out",
              timestamp: now,
              location: location,
            },
          ],
        });
        
        // Update user's status
        await updateDoc(doc(db!, "users", user.uid), {
          lastClockOut: now,
          isOnDuty: false,
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error checking out manager:", error);
      throw error;
    }
  };

  const getManagerAttendance = async (startDate?: Date, endDate?: Date): Promise<AttendanceRecord[]> => {
    try {
      if (!user) return [];
      
      // Set default date range if not provided
      const end = endDate || new Date();
      const start = startDate || new Date(end.getFullYear(), end.getMonth(), 1); // First day of current month
      
      // Query attendance records for the given user and date range
      const q = query(
        collection(db!, "attendance"),
        where("managerId", "==", user.uid),
        where("date", ">=", start),
        where("date", "<=", end),
        orderBy("date", "desc")
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          managerId: data.managerId,
          date: data.date.toDate(),
          clockInTime: data.clockInTime ? data.clockInTime.toDate() : undefined,
          clockOutTime: data.clockOutTime ? data.clockOutTime.toDate() : undefined,
          totalHours: data.totalHours,
          geofenceEvents: data.geofenceEvents ? data.geofenceEvents.map((event: any) => ({
            ...event,
            timestamp: event.timestamp.toDate()
          })) : []
        };
      });
    } catch (error) {
      console.error("Error fetching manager attendance:", error);
      return [];
    }
  };

  const getAllManagersAttendance = async (startDate?: Date, endDate?: Date): Promise<{[managerId: string]: AttendanceRecord[]}> => {
    try {
      if (!user || (userRole !== "admin" && userRole !== "superadmin")) {
        throw new Error("Unauthorized access");
      }
      
      // Set default date range if not provided
      const end = endDate || new Date();
      const start = startDate || new Date(end.getFullYear(), end.getMonth(), 1); // First day of current month
      
      // Query attendance records for all managers in the date range
      const q = query(
        collection(db!, "attendance"),
        where("date", ">=", start),
        where("date", "<=", end),
        orderBy("date", "desc")
      );
      
      const snapshot = await getDocs(q);
      
      // Group records by manager ID
      const attendanceByManager: {[managerId: string]: AttendanceRecord[]} = {};
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const managerId = data.managerId;
        
        if (!attendanceByManager[managerId]) {
          attendanceByManager[managerId] = [];
        }
        
        attendanceByManager[managerId].push({
          id: doc.id,
          managerId: data.managerId,
          managerName: data.managerName,
          date: data.date.toDate(),
          clockInTime: data.clockInTime ? data.clockInTime.toDate() : undefined,
          clockOutTime: data.clockOutTime ? data.clockOutTime.toDate() : undefined,
          totalHours: data.totalHours,
          geofenceEvents: data.geofenceEvents ? data.geofenceEvents.map((event: any) => ({
            ...event,
            timestamp: event.timestamp.toDate()
          })) : []
        });
      });
      
      return attendanceByManager;
    } catch (error) {
      console.error("Error fetching all managers' attendance:", error);
      return {};
    }
  };

  const isWithinGeofence = (lat: number, lng: number) => {
    console.warn("isWithinGeofence not fully implemented");
    return false;
  };

  const getVisitRequests = async () => {
    // TODO: Implement actual logic to fetch visit requests from Firebase
    console.warn("getVisitRequests is not fully implemented yet");
    
    // Simulate a delay to mimic an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock data for development
    return [
      {
        id: "visit1",
        projectId: "proj1",
        projectName: "Sunrise Gardens",
        plotId: "plot1",
        plotNumber: "A-123",
        guestId: "user1",
        guestName: "John Doe",
        guestEmail: "john@example.com",
        status: "pending",
        visitDate: new Date(Date.now() + 86400000), // Tomorrow
        timeSlot: "10:00 AM",
        notes: "I'm interested in seeing the model house.",
        createdAt: new Date(),
      },
      {
        id: "visit2",
        projectId: "proj1",
        projectName: "Sunrise Gardens",
        guestId: "user2",
        guestName: "Jane Smith",
        status: "approved",
        visitDate: new Date(Date.now() + 172800000), // Day after tomorrow
        timeSlot: "2:00 PM",
        createdAt: new Date(),
      },
      {
        id: "visit3",
        projectId: "proj2",
        projectName: "Metropolitan Heights",
        plotId: "plot3",
        plotNumber: "B-456",
        guestId: "user3",
        guestName: "Bob Johnson",
        status: "completed",
        visitDate: new Date(Date.now() - 86400000), // Yesterday
        timeSlot: "3:00 PM",
        createdAt: new Date(Date.now() - 259200000), // 3 days ago
      },
    ];
  };

  const approveVisitRequest = async (visitId: string) => {
    // TODO: Implement actual logic to approve a visit request in Firebase
    console.warn("approveVisitRequest is not fully implemented yet");
    console.log("Approving visit request with ID:", visitId);
    
    // Simulate a delay to mimic an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const rejectVisitRequest = async (visitId: string, reason: string) => {
    // TODO: Implement actual logic to reject a visit request in Firebase
    console.warn("rejectVisitRequest is not fully implemented yet");
    console.log("Rejecting visit request with ID:", visitId, "Reason:", reason);
    
    // Simulate a delay to mimic an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const getClientVisitBookings = async () => {
    // TODO: Implement actual logic to fetch client bookings from Firebase
    console.warn("getClientVisitBookings is not fully implemented yet");
    
    // Simulate a delay to mimic an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock data for development
    return [
      {
        id: "booking1",
        projectId: "proj1",
        projectName: "Sunrise Gardens",
        plotId: "plot123",
        plotNumber: "A-123",
        status: "pending",
        visitDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
        timeSlot: "10:00 AM",
        notes: "I would like to see the model house as well.",
        createdAt: new Date(),
      },
      {
        id: "booking2",
        projectId: "proj1",
        projectName: "Sunrise Gardens",
        plotId: "plot124",
        plotNumber: "A-124",
        status: "approved",
        visitDate: new Date(Date.now() + 86400000 * 5), // 5 days from now
        timeSlot: "2:00 PM",
        qrCodeData: "visit:booking2:user1:approved",
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
      },
      {
        id: "booking3",
        projectId: "proj2",
        projectName: "Metropolitan Heights",
        status: "cancelled",
        visitDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
        timeSlot: "3:30 PM",
        rejection_reason: "No staff available at requested time",
        createdAt: new Date(Date.now() - 86400000 * 4), // 4 days ago
      },
    ];
  };

  const cancelVisitBooking = async (bookingId: string) => {
    // TODO: Implement actual logic to cancel a booking in Firebase
    console.warn("cancelVisitBooking is not fully implemented yet");
    console.log("Cancelling booking with ID:", bookingId);
    
    // Simulate a delay to mimic an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const createAnnouncement = async (data: any): Promise<string | void> => {
    try {
      if (!user) {
        throw new Error("You must be logged in to create an announcement");
      }
      
      if (user.role !== "admin" && user.role !== "superadmin") {
        throw new Error("Only admins can create announcements");
      }
      
      const announcementData = {
        ...data,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        status: "active",
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db!, "announcements"), announcementData);
      return docRef.id;
    } catch (error) {
      console.error("Error creating announcement:", error);
      throw error;
    }
  };

  const verifyQrCode = async (qrData: { type: string; id: string; token?: string }) => {
    // TODO: Implement actual verification logic with Firebase
    console.warn("verifyQrCode is not fully implemented yet");
    
    // For now, return a mock successful response
    return {
      success: true,
      data: {
        type: qrData.type,
        id: qrData.id,
        verified: true,
        details: {
          visitDate: new Date(),
          projectName: "Sample Project",
          plotNumber: "A-123",
        }
      }
    };
  };

  const requestVisit = async (visitData: {
    projectId?: string;
    plotId?: string;
    visitDate: Date;
    timeSlot: string;
    notes?: string;
  }): Promise<{ success: boolean } | void> => {
    // TODO: Implement actual visit request logic with Firebase
    console.warn("requestVisit is not fully implemented yet");
    
    // Log the visit request data
    console.log("Visit request data:", visitData);
    
    // Simulate a delay to mimic an API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return a mock successful response
    return { success: true };
  };

  const getUserRole = () => {
    return userRole ? userRole.toLowerCase() : null;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      error,
      signIn, 
      signUp,
      signUpAsGuest,
      signUpAsClient,
      signOut, 
      userRole,
      registerUser: async (user: ExtendedUser) => {
        console.warn("registerUser not implemented");
      },
      getUserByEmail: async (email: string) => {
        console.warn("getUserByEmail not implemented");
        return null;
      },
      getUserById: async (uid: string) => {
        console.warn("getUserById not implemented");
        return null;
      },
      getUserRole,
      createClient: async (user: ExtendedUser) => {
        console.warn("createClient not implemented");
      },
      getOwnerId: async (user: ExtendedUser) => {
        console.warn("getOwnerId not implemented");
        return null;
      },
      getClientDetails: async (user: ExtendedUser) => {
        console.warn("getClientDetails not implemented");
        return {} as UserData;
      },
      getManagerDetails: async (user: ExtendedUser) => {
        console.warn("getManagerDetails not implemented");
        return {} as UserData;
      },
      getFullName: async (user: ExtendedUser) => {
        console.warn("getFullName not implemented");
        return "";
      },
      getGuestDetails: async (user: ExtendedUser) => {
        console.warn("getGuestDetails not implemented");
        return {} as UserData;
      },
      getManagers,
      getAllLeaveRequests,
      approveLeaveRequest,
      rejectLeaveRequest,
      getProjects,
      getProjectById,
      createProject,
      updateProject,
      getProjectTemplates,
      getAnnouncements,
      deleteAnnouncement,
      getUserOwnedPlots,
      generateVisitorQr,
      hasActiveVisitorQr,
      submitSellRequest,
      getManagerTasks,
      updateTaskStatus,
      isManagerClockedIn,
      checkInManager,
      checkOutManager,
      isWithinGeofence,
      getVisitRequests,
      approveVisitRequest,
      rejectVisitRequest,
      createAnnouncement,
      verifyQrCode,
      requestVisit,
      getClientVisitBookings,
      cancelVisitBooking,
      getManagerAttendance,
      getAllManagersAttendance
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 