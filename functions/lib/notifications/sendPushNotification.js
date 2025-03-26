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
exports.sendPushNotification = void 0;
const functions = __importStar(require('firebase-functions/v2'));
const admin = __importStar(require('firebase-admin'));
exports.sendPushNotification = functions.firestore.onDocumentCreated(
  'notifications/{notificationId}',
  async (event) => {
    try {
      const snapshot = event.data;
      if (!snapshot) {
        console.log('No data associated with the event');
        return null;
      }
      const notification = snapshot.data();
      const { userId, title, message, type, referenceId, data = {} } = notification;
      console.log(`Sending notification to user ${userId}: ${title}`);
      // Get the user's FCM token
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      if (!userDoc.exists) {
        console.log(`User ${userId} not found`);
        return null;
      }
      const userData = userDoc.data();
      if (!(userData === null || userData === void 0 ? void 0 : userData.fcmToken)) {
        console.log(`User ${userId} does not have an FCM token`);
        return null;
      }
      // Prepare notification payload
      const payload = {
        notification: {
          title,
          body: message,
        },
        data: Object.assign(
          Object.assign(Object.assign({ type }, data), referenceId ? { referenceId } : {}),
          { click_action: 'FLUTTER_NOTIFICATION_CLICK' }
        ),
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
//# sourceMappingURL=sendPushNotification.js.map
