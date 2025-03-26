import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

interface SetCustomClaimData {
  uid: string;
  role: string;
}

export const _setCustomUserClaim = functions.https.onCall(async (data, context) => {
  try {
    // Type-cast data to expected interface
    const { uid, role } = data as SetCustomClaimData;

    // Check if the caller is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    // Only allow admins or superadmins to set claims
    const callerUid = context.auth.uid;
    const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();

    if (!callerDoc.exists) {
      throw new functions.https.HttpsError('permission-denied', 'User not found');
    }

    const callerData = callerDoc.data();
    if (!callerData || (callerData.role !== 'admin' && callerData.role !== 'superadmin')) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can set custom claims'
      );
    }

    // Set the custom claim
    await admin.auth().setCustomUserClaims(uid, { role });

    // Update the user's role in Firestore
    await admin.firestore().collection('users').doc(uid).update({
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: callerUid,
    });

    return {
      success: true,
      message: `User ${uid} now has role: ${role}`,
    };
  } catch (error) {
    console.error('Error setting custom claim:', error);
    throw new functions.https.HttpsError('internal', 'Failed to set custom claim');
  }
});
