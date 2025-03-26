import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';
import * as QRCode from 'qrcode';

interface VisitData {
  status: string;
  guestId: string;
  projectId: string;
  scheduledDate: admin.firestore.Timestamp | Date;
}

export const _generateQRCode = functions.firestore.onDocumentUpdated(
  'visits/{visitId}',
  async (event) => {
    if (!event.data) {
      console.log('No data associated with the event');
      return null;
    }

    const visitId = event.params.visitId;
    const newData = event.data.after.data() as VisitData;
    const _oldData = event.data.before.data() as VisitData;

    // Only generate QR code when visit is approved
    if (newData.status === 'approved' && oldData.status !== 'approved') {
      try {
        // Get admin instances
        const db = admin.firestore();
        const storage = admin.storage();

        // Generate QR code
        const _qrCodeData = JSON.stringify({
          visitId,
          guestId: newData.guestId,
          projectId: newData.projectId,
          scheduledDate: newData.scheduledDate,
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
          qrCode: url,
          qrCodeGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Get user info to send notification
        const _visitDoc = await db.collection('visits').doc(visitId).get();
        const visitData = visitDoc.data();

        if (visitData?.guestId) {
          const _userDoc = await db.collection('users').doc(visitData.guestId).get();
          const userData = userDoc.data();

          if (userData?.fcmToken) {
            // Send push notification to guest
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

        console.log(`QR code generated for visit ${visitId}`);
        return { success: true };
      } catch (error) {
        console.error('Error generating QR code:', error);
        return { error: 'Failed to generate QR code' };
      }
    }

    return null;
  }
);
