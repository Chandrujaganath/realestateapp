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
    const { propertyId, rating, comments } = body;

    if (!propertyId || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create feedback document
    await adminDb.collection('feedback').add({
      userId,
      propertyId,
      rating,
      comments,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in feedback API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
