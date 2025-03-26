import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';

interface Notification {
  userId: string;
  title: string;
  message: string;
  type: string;
  referenceId?: string;
  data?: Record<string, string>;
}

export const _sendPushNotification = functions.firestore.onDocumentCreated(
  'notifications/{notificationId}',
  async (_event) => {
    try {
      const snapshot = event.data;
      if (!snapshot) {
        console.log('No data associated with the event');
        return null;
      }

      const notification = snapshot.data() as Notification;
      const { userId, title, message, type, referenceId, data = {} } = notification;

      console.log(`Sending notification to user ${userId}: ${title}`);

      // Get the user's FCM token
      const userDoc = await admin.firestore().collection('users').doc(userId).get();

      if (!userDoc.exists) {
        console.log(`User ${userId} not found`);
        return null;
      }

      const userData = userDoc.data();

      if (!userData?.fcmToken) {
        console.log(`User ${userId} does not have an FCM token`);
        return null;
      }

      // Prepare notification payload
      const payload = {
        notification: {
          title,
          body: message,
        },
        data: {
          type,
          ...data,
          ...(referenceId ? { referenceId } : {}),
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
      };

      // Send notification using the messaging admin SDK
      await admin.messaging().send({
        token: userData.fcmToken,
        notification: payload.notification,
        data: payload.data,
      });

      console.log(`Notification sent successfully to user ${userId}`);

      // Update notification status in Firestore
      await snapshot.ref.update({
        sent: true,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending push notification:', error);
      return { error: 'Failed to send push notification' };
    }
  }
);
