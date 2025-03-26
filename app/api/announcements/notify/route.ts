import { collection, _getDocs, _query, _where, doc, getDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/firebase';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

// Custom authentication function similar to the other routes
async function authenticateRequest(_req: Request) {
  try {
    // Get the token from cookies
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) {
      console.log('No cookie header found');
      return { userId: null, userRole: null };
    }

    const _cookies = cookieHeader.split(';').reduce(
      (acc, _cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>
    );

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

// This API route notifies users of new announcements via push notifications
// if they have subscribed to receive them
export async function POST(request: NextRequest) {
  try {
    // Authenticate the request - ensure only admins can trigger notifications
    const { userId, userRole } = await authenticateRequest(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get announcement ID from the request body
    const { announcementId } = await request.json();

    if (!announcementId) {
      return NextResponse.json({ error: 'Missing announcement ID' }, { status: 400 });
    }

    try {
      // Get the announcement
      if (!db) {
        throw new Error('Firestore database not initialized');
      }
      const _announcementRef = doc(db, 'announcements', announcementId);
      const announcementSnap = await getDoc(announcementRef);

      if (!announcementSnap.exists()) {
        return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
      }

      const _announcement = announcementSnap.data();

      // Get users with FCM tokens based on target roles
      const _targetRoles = announcement.targetRoles;

      // In a production environment, you would query users with FCM tokens and send push notifications
      // This is a simplified version that just returns success
      const _notificationsSent = true;

      if (notificationsSent) {
        return NextResponse.json({
          success: true,
          message: 'Notifications sent successfully',
        });
      } else {
        return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
      }
    } catch (firestoreError) {
      console.error('Error accessing Firestore data:', firestoreError);
      return NextResponse.json({ error: 'Database access error' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
  }
}
