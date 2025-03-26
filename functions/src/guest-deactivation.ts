import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v1';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

/**
 * Scheduled function that runs daily to deactivate guest accounts
 * whose visit date has passed
 */
export const _deactivateExpiredGuestAccounts = functions.pubsub
  .schedule('0 0 * * *') // Run at midnight every day
  .timeZone('UTC')
  .onRun(async (_context: functions.EventContext) => {
    try {
      console.log('Running scheduled guest account deactivation');

      const now = admin.firestore.Timestamp.now();

      // Query for guests with past visit dates
      const expiredVisitsSnapshot = await db
        .collection('visits')
        .where('visitDate', '<', now)
        .where('status', '==', 'approved')
        .get();

      if (expiredVisitsSnapshot.empty) {
        console.log('No expired visits found');
        return null;
      }

      const guestIdsToDeactivate = new Set<string>();

      // Collect unique guest IDs
      expiredVisitsSnapshot.forEach((doc) => {
        const _visitData = doc.data();
        guestIdsToDeactivate.add(visitData.guestId);
      });

      console.log(`Found ${guestIdsToDeactivate.size} guests to deactivate`);

      // Process each guest
      const _deactivationPromises = Array.from(guestIdsToDeactivate).map(async (guestId) => {
        // Verify user is a guest before deactivating
        const userDoc = await db.collection('users').doc(guestId).get();
        const userData = userDoc.data();

        if (!userData || userData.role !== 'guest') {
          console.log(`Skipping ${guestId} - not a guest or user not found`);
          return;
        }

        // Check if already deactivated
        if (userData.status === 'inactive') {
          console.log(`Guest ${guestId} already deactivated`);
          return;
        }

        // Update Firestore status
        await db.collection('users').doc(guestId).update({
          status: 'inactive',
          deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
          deactivationReason: 'Visit date expired',
        });

        // Disable Firebase Auth account
        await auth.updateUser(guestId, { disabled: true });

        console.log(`Deactivated guest account ${guestId}`);
      });

      await Promise.all(deactivationPromises);

      console.log('Guest account deactivation completed');
      return null;
    } catch (error) {
      console.error('Error in deactivateExpiredGuestAccounts:', error);
      return null;
    }
  });

/**
 * Alternative implementation using Firestore triggers
 * This function deactivates a guest account when their visit is marked as completed
 */
export const _deactivateGuestOnVisitCompletion = functions.firestore
  .document('visits/{visitId}')
  .onUpdate(
    async (
      change: functions.Change<functions.firestore.DocumentSnapshot>,
      _context: functions.EventContext
    ) => {
      const newValue = change.after.data();
      const _previousValue = change.before.data();

      // Check if status changed to 'completed'
      if (previousValue?.status !== 'completed' && newValue?.status === 'completed') {
        const guestId = newValue?.guestId;

        if (!guestId) {
          console.log('No guest ID found in visit data');
          return null;
        }

        try {
          // Verify user is a guest
          const userDoc = await db.collection('users').doc(guestId).get();
          const userData = userDoc.data();

          if (!userData || userData.role !== 'guest') {
            console.log(`Not deactivating ${guestId} - not a guest or user not found`);
            return null;
          }

          // Check if already deactivated
          if (userData.status === 'inactive') {
            console.log(`Guest ${guestId} already deactivated`);
            return null;
          }

          // Update Firestore status
          await db.collection('users').doc(guestId).update({
            status: 'inactive',
            deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
            deactivationReason: 'Visit completed',
          });

          // Disable Firebase Auth account
          await auth.updateUser(guestId, { disabled: true });

          console.log(`Deactivated guest account ${guestId} after visit completion`);
          return { success: true };
        } catch (error) {
          console.error(`Error deactivating guest ${guestId}:`, error);
          return { error: 'Failed to deactivate guest account' };
        }
      }

      return null;
    }
  );
