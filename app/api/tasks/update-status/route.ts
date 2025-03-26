import { Timestamp, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

import { authenticateRequest } from '@/lib/api-auth';
import { db } from '@/lib/firebase';

/**
 * API route for updating task status
 *
 * This specialized endpoint handles updating a task's status with proper
 * history tracking and permission checks
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID and role from auth response
    const userId = user.userId;
    const userRole = user.role?.toLowerCase();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - Missing user ID' }, { status: 401 });
    }

    // Get request body
    const { taskId, status, comment } = await request.json();

    // Validate required fields
    if (!taskId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get task from Firestore
    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }
    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const task = taskDoc.data();

    // Check permissions based on role
    if (
      task &&
      userRole === 'manager' &&
      task.assignedTo !== userId &&
      !['admin', 'superadmin'].includes(userRole)
    ) {
      return NextResponse.json({ error: 'Unauthorized to update this task' }, { status: 403 });
    }

    // Create update data
    const updateData: any = {
      status,
      updatedAt: Timestamp.now(),
    };

    // Add completedAt and completedBy if task is being marked as completed
    if (status === 'completed') {
      updateData.completedAt = Timestamp.now();
      updateData.completedBy = userId;
    }

    // Create history entry
    const _historyEntry = {
      action: 'status_updated',
      timestamp: Timestamp.now(),
      userId: userId,
      previousStatus: task.status,
      newStatus: status,
      comment: comment || null,
    };

    // Update task in Firestore
    await updateDoc(taskRef, {
      ...updateData,
      history: arrayUnion(historyEntry),
    });

    return NextResponse.json({
      success: true,
      message: 'Task status updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating task status:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to update task status' },
      { status: 500 }
    );
  }
}
