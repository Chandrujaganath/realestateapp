import { NextResponse } from "next/server"
import { adminDb, adminAuth } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

// Custom authentication function similar to the one we added in the main announcements route
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
    if (!token) {
      console.log('No authToken cookie found');
      return { userId: null, userRole: null };
    }
    
    try {
      // Verify the token
      const decodedToken = await adminAuth.verifyIdToken(token);
      
      // Get user role from database
      try {
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        const userRole = userDoc.exists ? userDoc.data()?.role : null;
        
        return { userId: decodedToken.uid, userRole };
      } catch (dbError) {
        console.error('Error getting user data:', dbError);
        // If we can't get the role, we still return the userId
        return { userId: decodedToken.uid, userRole: null };
      }
    } catch (tokenError) {
      console.error('Error verifying token:', tokenError);
      return { userId: null, userRole: null };
    }
  } catch (error) {
    console.error('Error authenticating request:', error);
    return { userId: null, userRole: null };
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // Authenticate the request
    const { userId } = await authenticateRequest(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the announcement
    const announcementDoc = await adminDb.collection("announcements").doc(params.id).get()
    if (!announcementDoc.exists) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
    }

    const announcement = {
      id: announcementDoc.id,
      ...announcementDoc.data()
    }

    return NextResponse.json({ announcement })
  } catch (error) {
    console.error("Error fetching announcement:", error)
    return NextResponse.json({ error: "Failed to fetch announcement" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    // Authenticate the request
    const { userId, userRole } = await authenticateRequest(req)
    if (!userId || !["admin", "superadmin"].includes(userRole?.toLowerCase())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content, priority, targetRoles, expiresAt, status } = await req.json()

    // Get the announcement
    const announcementRef = adminDb.collection("announcements").doc(params.id)
    const announcementDoc = await announcementRef.get()
    
    if (!announcementDoc.exists) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
    }

    // Update the announcement
    const updateData: Record<string, any> = {
      updatedAt: FieldValue.serverTimestamp()
    }

    if (title) updateData.title = title
    if (content) updateData.content = content
    if (priority) updateData.priority = priority
    if (targetRoles) updateData.targetRoles = targetRoles
    if (status) updateData.status = status
    if (expiresAt) updateData.expiresAt = new Date(expiresAt)

    await announcementRef.update(updateData)

    return NextResponse.json({ 
      id: params.id,
      message: "Announcement updated successfully" 
    })
  } catch (error) {
    console.error("Error updating announcement:", error)
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // Authenticate the request
    const { userId, userRole } = await authenticateRequest(req)
    if (!userId || !["admin", "superadmin"].includes(userRole?.toLowerCase())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the announcement
    const announcementRef = adminDb.collection("announcements").doc(params.id)
    const announcementDoc = await announcementRef.get()
    
    if (!announcementDoc.exists) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
    }

    // Delete the announcement
    await announcementRef.delete()

    return NextResponse.json({ 
      id: params.id,
      message: "Announcement deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting announcement:", error)
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 })
  }
} 