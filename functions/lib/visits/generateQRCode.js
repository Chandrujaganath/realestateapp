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
exports.generateQRCode = void 0;
const functions = __importStar(require('firebase-functions/v2'));
const admin = __importStar(require('firebase-admin'));
const QRCode = __importStar(require('qrcode'));
exports.generateQRCode = functions.firestore.onDocumentUpdated(
  'visits/{visitId}',
  async (event) => {
    if (!event.data) {
      console.log('No data associated with the event');
      return null;
    }
    const visitId = event.params.visitId;
    const newData = event.data.after.data();
    const oldData = event.data.before.data();
    // Only generate QR code when visit is approved
    if (newData.status === 'approved' && oldData.status !== 'approved') {
      try {
        // Get admin instances
        const db = admin.firestore();
        const storage = admin.storage();
        // Generate QR code
        const qrCodeData = JSON.stringify({
          visitId,
          guestId: newData.guestId,
          projectId: newData.projectId,
          scheduledDate: newData.scheduledDate,
          timestamp: Date.now(),
        });
        const qrCodeBuffer = await QRCode.toBuffer(qrCodeData);
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
        const visitDoc = await db.collection('visits').doc(visitId).get();
        const visitData = visitDoc.data();
        if (visitData === null || visitData === void 0 ? void 0 : visitData.guestId) {
          const userDoc = await db.collection('users').doc(visitData.guestId).get();
          const userData = userDoc.data();
          if (userData === null || userData === void 0 ? void 0 : userData.fcmToken) {
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
//# sourceMappingURL=generateQRCode.js.map
