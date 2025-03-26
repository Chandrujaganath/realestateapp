import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export all functions
export { setCustomUserClaim } from './auth/setCustomUserClaim';
export { sendPushNotification } from './notifications/sendPushNotification';
export { assignTask } from './tasks/assignTask';
export { generateQRCode } from './visits/generateQRCode';
export { createAdminUser, deactivateAdminUser, reactivateAdminUser } from './admin-management';

// Exporting utility function to be used in tests
export const _firebaseAdmin = admin;
