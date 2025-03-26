import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

interface CreateAdminUserData {
  email: string;
  name: string;
}

interface AdminUserData {
  adminId: string;
}

// Create Admin User
export const _createAdminUser = functions.https.onCall(async (data, context) => {
  // Type-cast data to expected interface
  const { email, name } = data as CreateAdminUserData;

  // Check if the caller is a SuperAdmin
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const callerUid = context.auth.uid;
  const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();

  if (!callerDoc.exists || callerDoc.data()?.role !== 'SuperAdmin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only SuperAdmins can create Admin users.'
    );
  }

  // Validate input
  if (!email || !name) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function requires "email" and "name" parameters.'
    );
  }

  try {
    // Create the user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      displayName: name,
      password: generateTemporaryPassword(),
    });

    // Set custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: 'Admin',
    });

    // Create the user document in Firestore
    const now = admin.firestore.Timestamp.now();
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      name,
      email,
      role: 'Admin',
      isActive: true,
      createdAt: now,
      createdBy: callerUid,
    });

    // Return the new admin user
    return {
      id: userRecord.uid,
      name,
      email,
      role: 'Admin',
      isActive: true,
      createdAt: now.toDate(),
    };
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while creating the admin user.'
    );
  }
});

// Deactivate Admin User
export const _deactivateAdminUser = functions.https.onCall(async (data, context) => {
  // Type-cast data to expected interface
  const { adminId } = data as AdminUserData;

  // Check if the caller is a SuperAdmin
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const callerUid = context.auth.uid;
  const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();

  if (!callerDoc.exists || callerDoc.data()?.role !== 'SuperAdmin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only SuperAdmins can deactivate Admin users.'
    );
  }

  try {
    // Disable the user in Firebase Auth
    await admin.auth().updateUser(adminId, {
      disabled: true,
    });

    // Update the user document in Firestore
    await admin.firestore().collection('users').doc(adminId).update({
      isActive: false,
      updatedAt: admin.firestore.Timestamp.now(),
      updatedBy: context.auth.uid,
    });

    return { success: true };
  } catch (error) {
    console.error('Error deactivating admin user:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while deactivating the admin user.'
    );
  }
});

// Reactivate Admin User
export const _reactivateAdminUser = functions.https.onCall(async (data, context) => {
  // Type-cast data to expected interface
  const { adminId } = data as AdminUserData;

  // Check if the caller is a SuperAdmin
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const callerUid = context.auth.uid;
  const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();

  if (!callerDoc.exists || callerDoc.data()?.role !== 'SuperAdmin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only SuperAdmins can reactivate Admin users.'
    );
  }

  try {
    // Enable the user in Firebase Auth
    await admin.auth().updateUser(adminId, {
      disabled: false,
    });

    // Update the user document in Firestore
    await admin.firestore().collection('users').doc(adminId).update({
      isActive: true,
      updatedAt: admin.firestore.Timestamp.now(),
      updatedBy: context.auth.uid,
    });

    return { success: true };
  } catch (error) {
    console.error('Error reactivating admin user:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while reactivating the admin user.'
    );
  }
});

// Helper function to generate a temporary password
function generateTemporaryPassword(): string {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  let password = '';

  for (let i = 0; i < length; i++) {
    const _randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
}
