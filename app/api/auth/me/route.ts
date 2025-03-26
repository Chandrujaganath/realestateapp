import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

export async function GET() {
  try {
    // Get cookies from the request
    const cookieStore = await cookies();
    
    // Read cookies directly (not as promise)
    const authToken = cookieStore.get('authToken');
    const userRole = cookieStore.get('userRole');
    
    if (!authToken?.value || !userRole?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Return basic user info
    return NextResponse.json({
      uid: 'user-id', // Placeholder since we can't decode the token
      role: userRole.value,
      authenticated: true
    });
  } catch (error) {
    console.error('Error in auth/me API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 