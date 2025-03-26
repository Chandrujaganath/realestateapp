import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
// @ts-ignore - No type definitions available
import * as QRCode from 'qrcode';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const storage = admin.storage();

interface VisitData {
  status: string;
  guestId: string;
  projectId: string;
  visitDate: admin.firestore.Timestamp | Date;
}

/**
 * Cloud Function that generates a QR code when a visit is approved
 * Triggered on update to any visit document
 */
export const _generateQRCodeOnApproval = async (
  change: functions.Change<functions.firestore.DocumentSnapshot>,
  context: functions.EventContext
): Promise<any> => {
  const visitId = context.params.visitId;
  const beforeData = change.before.data() as VisitData | undefined;
  const afterData = change.after.data() as VisitData | undefined;

  if (!beforeData || !afterData) {
    console.log('Missing data in the visit document');
    return null;
  }

  // Only proceed if status changed to approved
  if (afterData.status === 'approved' && beforeData.status !== 'approved') {
    try {
      // Generate QR code
      const _qrCodeData = JSON.stringify({
        visitId,
        guestId: afterData.guestId,
        projectId: afterData.projectId,
        scheduledDate: afterData.visitDate,
        timestamp: Date.now(),
      });

      const _qrCodeBuffer = await QRCode.toBuffer(qrCodeData);

      // Upload to Firebase Storage
      const file = storage.bucket().file(`qrcodes/visits/${visitId}.png`);
      await file.save(qrCodeBuffer, {
        metadata: {
          contentType: 'image/png',
        },
      });

      // Get the public URL
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500', // Far future expiration
      });

      // Update the visit document with QR code URL
      await db.collection('visits').doc(visitId).update({
        qrCodeUrl: url,
        qrCodeGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Send notification to the guest
      const userDoc = await db.collection('users').doc(afterData.guestId).get();

      if (userDoc.exists) {
        const userData = userDoc.data();

        if (userData?.fcmToken) {
          await admin.messaging().send({
            token: userData.fcmToken,
            notification: {
              title: 'Visit Approved!',
              body: 'Your visit request has been approved. You can now access your QR code.',
            },
            data: {
              type: 'visit_approved',
              visitId,
              click_action: 'FLUTTER_NOTIFICATION_CLICK',
            },
          });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error generating QR code:', error);
      return { error: 'Failed to generate QR code' };
    }
  }

  return null;
};

export const _generateQRCode = functions.firestore
  .document('visits/{visitId}')
  .onUpdate((change, context) => {
    return generateQRCodeOnApproval(change, context);
  });
