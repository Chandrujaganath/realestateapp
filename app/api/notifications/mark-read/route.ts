import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';

import { adminDb, verifyToken } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    // Get the auth token from cookie
    const authToken = req.cookies.get('authToken')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the token
    const tokenVerification = await verifyToken(authToken);

    if (!tokenVerification.verified) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = tokenVerification.userId;

    const _body = await req.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json({ error: 'Missing notificationId' }, { status: 400 });
    }

    // Update notification doc
    const notificationRef = adminDb.collection('notifications').doc(notificationId);
    const notificationDoc = await notificationRef.get();

    if (!notificationDoc.exists) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    const _notification = notificationDoc.data();

    // Check if the notification belongs to the user
    if (notification?.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Mark as read
    await notificationRef.update({
      read: true,
      readAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
