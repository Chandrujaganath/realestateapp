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
exports.generateQRCode = exports.generateQRCodeOnApproval = void 0;
const functions = __importStar(require('firebase-functions'));
const admin = __importStar(require('firebase-admin'));
// @ts-ignore - No type definitions available
const QRCode = __importStar(require('qrcode'));
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();
const storage = admin.storage();
/**
 * Cloud Function that generates a QR code when a visit is approved
 * Triggered on update to any visit document
 */
const generateQRCodeOnApproval = async (change, context) => {
  const visitId = context.params.visitId;
  const beforeData = change.before.data();
  const afterData = change.after.data();
  if (!beforeData || !afterData) {
    console.log('Missing data in the visit document');
    return null;
  }
  // Only proceed if status changed to approved
  if (afterData.status === 'approved' && beforeData.status !== 'approved') {
    try {
      // Generate QR code
      const qrCodeData = JSON.stringify({
        visitId,
        guestId: afterData.guestId,
        projectId: afterData.projectId,
        scheduledDate: afterData.visitDate,
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
        qrCodeUrl: url,
        qrCodeGeneratedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      // Send notification to the guest
      const userDoc = await db.collection('users').doc(afterData.guestId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData === null || userData === void 0 ? void 0 : userData.fcmToken) {
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
exports.generateQRCodeOnApproval = generateQRCodeOnApproval;
exports.generateQRCode = functions.firestore
  .document('visits/{visitId}')
  .onUpdate((change, context) => {
    return (0, exports.generateQRCodeOnApproval)(change, context);
  });
//# sourceMappingURL=qr-code-generation.js.map
