import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v1';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

interface PlotBookingData {
  plotId: string;
  projectId: string;
  bookingDetails?: any;
}

/**
 * Cloud Function to handle plot booking with concurrency control
 */
export const _bookPlot = functions.https.onCall(
  async (data: PlotBookingData, context: functions.https.CallableContext) => {
    // Ensure user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to book a plot'
      );
    }

    const userId = context.auth.uid;

    // Validate request data
    const { plotId, projectId, bookingDetails } = data;

    if (!plotId || !projectId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Plot ID and Project ID are required'
      );
    }

    try {
      // Run a transaction to ensure atomic booking
      const result = await db.runTransaction(async (transaction) => {
        // Get the plot document
        const plotRef = db.collection('projects').doc(projectId).collection('plots').doc(plotId);
        const plotDoc = await transaction.get(plotRef);

        if (!plotDoc.exists) {
          throw new functions.https.HttpsError('not-found', 'Plot not found');
        }

        const plotData = plotDoc.data();

        // Check if plot is available
        if (!plotData || plotData.status !== 'available') {
          throw new functions.https.HttpsError(
            'failed-precondition',
            `Plot is not available for booking. Current status: ${plotData?.status || 'unknown'}`
          );
        }

        // Get user document to verify role
        const _userRef = db.collection('users').doc(userId);
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists) {
          throw new functions.https.HttpsError('not-found', 'User not found');
        }

        const userData = userDoc.data();

        // Create booking document
        const bookingRef = db.collection('bookings').doc();

        const _bookingData = {
          id: bookingRef.id,
          plotId,
          projectId,
          clientId: userId,
          clientName: userData?.displayName || userData?.email || 'Unknown Client',
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          ...bookingDetails,
        };

        transaction.set(bookingRef, bookingData);

        // Update plot status to 'booked'
        transaction.update(plotRef, {
          status: 'booked',
          bookedBy: userId,
          bookedAt: admin.firestore.FieldValue.serverTimestamp(),
          bookingId: bookingRef.id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Create activity log
        const _activityRef = db.collection('activityLogs').doc();
        transaction.set(activityRef, {
          type: 'plot_booking',
          userId,
          targetId: plotId,
          targetType: 'plot',
          projectId,
          details: {
            plotId,
            bookingId: bookingRef.id,
            action: 'booked',
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
          success: true,
          bookingId: bookingRef.id,
          message: 'Plot booked successfully',
        };
      });

      // Send notification to client
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();

      if (userData && userData.fcmToken) {
        await admin.messaging().send({
          token: userData.fcmToken,
          notification: {
            title: 'Plot Booked Successfully',
            body: `Your booking for Plot #${plotId} has been confirmed.`,
          },
          data: {
            type: 'PLOT_BOOKED',
            plotId,
            projectId,
            bookingId: result.bookingId,
          },
        });
      }

      // Notify managers about the booking
      const _managersSnapshot = await db
        .collection('users')
        .where('role', '==', 'manager')
        .where('assignedProjects', 'array-contains', projectId)
        .where('status', '==', 'active')
        .get();

      const _notificationPromises = managersSnapshot.docs.map(async (managerDoc) => {
        const _managerId = managerDoc.id;
        const managerData = managerDoc.data();

        if (managerData.fcmToken) {
          await admin.messaging().send({
            token: managerData.fcmToken,
            notification: {
              title: 'New Plot Booking',
              body: `Plot #${plotId} has been booked by a client.`,
            },
            data: {
              type: 'NEW_PLOT_BOOKING',
              plotId,
              projectId,
              bookingId: result.bookingId,
            },
          });
        }

        // Create a task for the manager
        await db.collection('tasks').add({
          type: 'booking_followup',
          referenceId: result.bookingId,
          assignedTo: managerId,
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          priority: 'high',
          title: `Follow up on Plot #${plotId} Booking`,
          description: `A client has booked Plot #${plotId}. Please follow up with the client to complete the process.`,
          dueDate: admin.firestore.Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        });
      });

      await Promise.all(notificationPromises);

      return result;
    } catch (error) {
      console.error('Error in bookPlot:', error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError('internal', 'An error occurred while booking the plot');
    }
  }
);
