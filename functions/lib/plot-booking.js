'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.bookPlot = void 0;
const functions = __importStar(require('firebase-functions/v1'));
const admin = __importStar(require('firebase-admin'));
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();
/**
 * Cloud Function to handle plot booking with concurrency control
 */
exports.bookPlot = functions.https.onCall(async (data, context) => {
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
    throw new functions.https.HttpsError('invalid-argument', 'Plot ID and Project ID are required');
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
          `Plot is not available for booking. Current status: ${(plotData === null || plotData === void 0 ? void 0 : plotData.status) || 'unknown'}`
        );
      }
      // Get user document to verify role
      const userRef = db.collection('users').doc(userId);
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User not found');
      }
      const userData = userDoc.data();
      // Create booking document
      const bookingRef = db.collection('bookings').doc();
      const bookingData = Object.assign(
        {
          id: bookingRef.id,
          plotId,
          projectId,
          clientId: userId,
          clientName:
            (userData === null || userData === void 0 ? void 0 : userData.displayName) ||
            (userData === null || userData === void 0 ? void 0 : userData.email) ||
            'Unknown Client',
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        bookingDetails
      );
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
      const activityRef = db.collection('activityLogs').doc();
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
    const managersSnapshot = await db
      .collection('users')
      .where('role', '==', 'manager')
      .where('assignedProjects', 'array-contains', projectId)
      .where('status', '==', 'active')
      .get();
    const notificationPromises = managersSnapshot.docs.map(async (managerDoc) => {
      const managerId = managerDoc.id;
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
});
//# sourceMappingURL=plot-booking.js.map
