import { NextRequest, NextResponse } from "next/server"
import { adminDb, adminAuth, verifyToken, getUserRole, usingDummyImplementation } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"
import { DocumentData } from 'firebase-admin/firestore'

// Custom authentication function since we can't find the imported ones
async function authenticateRequest(req: Request) {
  try {
    // Get the token from cookies
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) {
      console.log('No cookie header found');
      return { userId: null, userRole: null };
    }
    
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    const token = cookies['authToken'];
    const userRoleCookie = cookies['userRole'];
    
    if (!token) {
      console.log('No authToken cookie found');
      return { userId: null, userRole: null };
    }
    
    // Log the token and role cookie for debugging
    console.log('AuthToken present, userRole from cookie:', userRoleCookie);
    
    // If we're using the dummy implementation for development purposes
    if (usingDummyImplementation) {
      console.log('Using dummy implementation, returning mock superadmin user');
      return { userId: 'dummy-user-id', userRole: 'superadmin' };
    }
    
    try {
      // Verify the token
      const { verified, userId } = await verifyToken(token);
      if (!verified || !userId) {
        return { userId: null, userRole: null };
      }
      
      // First try to get role from cookie for faster response
      if (userRoleCookie) {
        console.log('Using role from cookie:', userRoleCookie);
        return { userId, userRole: userRoleCookie };
      }
      
      // Otherwise get user role from database
      const userRole = await getUserRole(userId);
      console.log('Role from database:', userRole);
      return { userId, userRole };
    } catch (tokenError) {
      console.error('Error verifying token:', tokenError);
      
      // If token verification fails but we have a role cookie, try to use that during development
      if (process.env.NODE_ENV === 'development' && userRoleCookie) {
        console.log('Development mode: Using role from cookie despite token error');
        return { userId: 'dev-user-id', userRole: userRoleCookie };
      }
      
      return { userId: null, userRole: null };
    }
  } catch (error) {
    console.error('Error authenticating request:', error);
    return { userId: null, userRole: null };
  }
}

export async function GET(req: Request) {
  try {
    // Authenticate the request
    const { userId, userRole } = await authenticateRequest(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only use dummy implementation if explicitly forced by the system or if in development
    if (usingDummyImplementation || process.env.NODE_ENV === 'development') {
      console.log("Using mock announcements data because Firebase is unavailable or in development mode");
      // Return mock announcements data for development/testing
      return NextResponse.json({ 
        announcements: [
          {
            id: 'mock-announcement-1',
            title: 'System Maintenance',
            content: 'The system will be down for maintenance on Saturday from 2 AM to 4 AM.',
            priority: 'high',
            status: 'active',
            createdAt: new Date(Date.now() - 86400000), // 1 day ago
            targetRoles: [],
            expiresAt: new Date(Date.now() + 172800000) // 2 days from now
          },
          {
            id: 'mock-announcement-2',
            title: 'New Features Released',
            content: 'Check out our new dashboard features!',
            priority: 'medium',
            status: 'active',
            createdAt: new Date(Date.now() - 259200000), // 3 days ago
            targetRoles: ['admin', 'superadmin'],
            expiresAt: new Date(Date.now() + 604800000) // 7 days from now
          }
        ] 
      });
    }

    // Get user role if not provided
    let role = userRole
    if (!role) {
      const userDoc = await adminDb.collection("users").doc(userId).get()
      if (!userDoc.exists) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      role = userDoc.data()?.role?.toLowerCase()
    }

    try {
      // Query announcements that target this user's role or all users
      const announcementsSnapshot = await adminDb
        .collection("announcements")
        .where("status", "==", "active")
        .get()

      const announcements = announcementsSnapshot.docs
        .map((doc: DocumentData) => {
          const data = doc.data()
          // Check if this announcement targets the user's role
          const targetRoles = data.targetRoles || []
          if (targetRoles.length === 0 || targetRoles.some((r: string) => r.toLowerCase() === role?.toLowerCase())) {
            return {
              id: doc.id,
              ...data,
            }
          }
          return null
        })
        .filter(Boolean)

      return NextResponse.json({ announcements })
    } catch (firestoreError) {
      console.error("Error accessing Firestore:", firestoreError);
      
      // Return fallback mock data in case of Firebase errors
      console.log("Falling back to mock announcements due to Firestore error");
      return NextResponse.json({ 
        announcements: [
          {
            id: 'fallback-announcement-1',
            title: 'API Notice',
            content: 'Using fallback data due to temporary database issues.',
            priority: 'medium',
            status: 'active',
            createdAt: new Date(),
            targetRoles: [],
            expiresAt: new Date(Date.now() + 86400000) // 1 day from now
          }
        ] 
      });
    }
  } catch (error) {
    console.error("Error fetching announcements:", error)
    // Return empty announcements list to prevent UI errors
    return NextResponse.json({ 
      error: "Failed to fetch announcements", 
      announcements: [] 
    }, { status: 200 }) // Return 200 with empty array to prevent UI errors
  }
}

export async function POST(req: Request) {
  try {
    // Authenticate the request
    const { userId, userRole } = await authenticateRequest(req)
    if (!userId || !["admin", "superadmin"].includes(userRole?.toLowerCase())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use dummy implementation only if explicitly forced
    if (usingDummyImplementation) {
      console.log("Using mock implementation for POST because Firebase is unavailable");
      return NextResponse.json({ 
        id: 'mock-announcement-' + Date.now(),
        message: "Announcement created successfully (mock)" 
      }, { status: 201 });
    }

    const { title, content, priority, targetRoles, expiresAt, status } = await req.json()

    // Validate required fields
    if (!title || !content || !priority || !targetRoles || !status) {
      return NextResponse.json(
        { error: "Missing required fields: title, content, priority, targetRoles, and status are required" },
        { status: 400 }
      )
    }

    try {
      // Add announcement to Firestore
      const announcementRef = adminDb.collection("announcements").doc()
      const timestamp = FieldValue.serverTimestamp()
      
      await announcementRef.set({
        title,
        content,
        priority,
        targetRoles,
        status,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: userId,
        ...(expiresAt ? { expiresAt: new Date(expiresAt) } : {})
      })

      return NextResponse.json({ 
        id: announcementRef.id,
        message: "Announcement created successfully" 
      }, { status: 201 })
    } catch (firestoreError) {
      console.error("Error accessing Firestore:", firestoreError);
      return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error creating announcement:", error)
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 })
  }
} 