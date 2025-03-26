import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v1';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

interface Manager {
  id: string;
  fcmToken?: string;
  [key: string]: any;
}

/**
 * Cloud Function that notifies managers of new sell requests
 * and assigns them using round-robin allocation
 */
export const _assignSellRequestToManager = functions.firestore
  .document('sellRequests/{requestId}')
  .onCreate(
    async (snapshot: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
      const requestId = context.params.requestId;
      const requestData = snapshot.data();

      try {
        console.log(`Processing new sell request ${requestId}`);

        // Get the project or city to identify managers
        const { projectId, cityId } = requestData || {};

        // Transaction to ensure atomic manager assignment
        return db.runTransaction(async (transaction) => {
          // Get managers for this project/city
          let managersQuery;

          if (projectId) {
            managersQuery = db
              .collection('users')
              .where('role', '==', 'manager')
              .where('assignedProjects', 'array-contains', projectId)
              .where('status', '==', 'active');
          } else if (cityId) {
            managersQuery = db
              .collection('users')
              .where('role', '==', 'manager')
              .where('assignedCities', 'array-contains', cityId)
              .where('status', '==', 'active');
          } else {
            throw new Error('Neither projectId nor cityId provided in sell request');
          }

          const managersSnapshot = await transaction.get(managersQuery);

          if (managersSnapshot.empty) {
            console.error('No active managers found for this project/city');
            return { error: 'No managers available' };
          }

          const managers: Manager[] = managersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as any),
          }));

          // Get the queue document for round-robin allocation
          const queueRef = db.collection('system').doc('managerQueue');
          const queueSnapshot = await transaction.get(queueRef);
          const queueData = queueSnapshot.exists ? queueSnapshot.data() : { lastIndex: -1 };

          // Calculate next manager index using round-robin
          const nextIndex = (queueData?.lastIndex + 1) % managers.length;
          const assignedManager = managers[nextIndex];

          // Update the queue
          transaction.update(queueRef, {
            lastIndex: nextIndex,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Update the sell request with assigned manager
          transaction.update(snapshot.ref, {
            assignedManagerId: assignedManager.id,
            assignedAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'assigned',
          });

          // Create a task for the manager
          const taskRef = db.collection('tasks').doc();
          transaction.set(taskRef, {
            type: 'sellRequest',
            referenceId: requestId,
            assignedTo: assignedManager.id,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            priority: 'medium',
            title: `New Sell Request ${requestData?.plotId ? `for Plot #${requestData.plotId}` : ''}`,
            description: `Client ${requestData?.clientName || requestData?.clientId} has submitted a sell request${projectId ? ` for project ${projectId}` : ''}.`,
            dueDate: admin.firestore.Timestamp.fromMillis(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
          });

          console.log(`Assigned sell request ${requestId} to manager ${assignedManager.id}`);

          // Send FCM notification to the manager
          if (assignedManager.fcmToken) {
            await admin.messaging().send({
              token: assignedManager.fcmToken,
              notification: {
                title: 'New Sell Request Assigned',
                body: `You have been assigned a new sell request${requestData?.plotId ? ` for Plot #${requestData.plotId}` : ''}.`,
              },
              data: {
                requestId,
                type: 'SELL_REQUEST_ASSIGNED',
                taskId: taskRef.id,
              },
            });
            console.log(`Notification sent to manager ${assignedManager.id}`);
          }

          return { success: true, assignedManager: assignedManager.id };
        });
      } catch (error) {
        console.error(`Error assigning sell request ${requestId}:`, error);
        return { error: 'Failed to assign sell request' };
      }
    }
  );

/**
 * Similar function for visit requests
 */
export const _assignVisitRequestToManager = functions.firestore
  .document('visits/{visitId}')
  .onCreate(
    async (snapshot: functions.firestore.DocumentSnapshot, context: functions.EventContext) => {
      const visitId = context.params.visitId;
      const visitData = snapshot.data();

      // Skip if already assigned or not pending
      if (visitData?.assignedManagerId || visitData?.status !== 'pending') {
        return null;
      }

      try {
        console.log(`Processing new visit request ${visitId}`);

        // Get the project to identify managers
        const { projectId } = visitData || {};

        if (!projectId) {
          console.error('No projectId provided in visit request');
          return { error: 'Project ID required' };
        }

        // Transaction to ensure atomic manager assignment
        return db.runTransaction(async (transaction) => {
          // Get managers for this project
          const managersQuery = db
            .collection('users')
            .where('role', '==', 'manager')
            .where('assignedProjects', 'array-contains', projectId)
            .where('status', '==', 'active');

          const managersSnapshot = await transaction.get(managersQuery);

          if (managersSnapshot.empty) {
            console.error('No active managers found for this project');
            return { error: 'No managers available' };
          }

          const managers: Manager[] = managersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as any),
          }));

          // Get the queue document for round-robin allocation
          const queueRef = db.collection('system').doc('managerQueue');
          const queueSnapshot = await transaction.get(queueRef);
          const queueData = queueSnapshot.exists ? queueSnapshot.data() : { lastIndex: -1 };

          // Calculate next manager index using round-robin
          const nextIndex = (queueData?.lastIndex + 1) % managers.length;
          const assignedManager = managers[nextIndex];

          // Update the queue
          transaction.update(queueRef, {
            lastIndex: nextIndex,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Update the visit request with assigned manager
          transaction.update(snapshot.ref, {
            assignedManagerId: assignedManager.id,
            assignedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Create a task for the manager
          const taskRef = db.collection('tasks').doc();
          transaction.set(taskRef, {
            type: 'visitRequest',
            referenceId: visitId,
            assignedTo: assignedManager.id,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            priority: 'medium',
            title: `New Visit Request from ${visitData?.guestName || 'Guest'}`,
            description: `A guest has requested to visit project ${projectId} on ${visitData?.visitDate ? new Date(visitData.visitDate.toMillis()).toLocaleDateString() : 'unknown date'}.`,
            dueDate: admin.firestore.Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          });

          console.log(`Assigned visit request ${visitId} to manager ${assignedManager.id}`);

          // Send FCM notification to the manager
          if (assignedManager.fcmToken) {
            await admin.messaging().send({
              token: assignedManager.fcmToken,
              notification: {
                title: 'New Visit Request Assigned',
                body: `You have been assigned a new visit request for ${visitData?.visitDate ? new Date(visitData.visitDate.toMillis()).toLocaleDateString() : 'unknown date'}.`,
              },
              data: {
                visitId,
                type: 'VISIT_REQUEST_ASSIGNED',
                taskId: taskRef.id,
              },
            });
            console.log(`Notification sent to manager ${assignedManager.id}`);
          }

          return { success: true, assignedManager: assignedManager.id };
        });
      } catch (error) {
        console.error(`Error assigning visit request ${visitId}:`, error);
        return { error: 'Failed to assign visit request' };
      }
    }
  );
