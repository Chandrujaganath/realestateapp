import * as admin from "firebase-admin"

// Initialize the Firebase Admin SDK if it hasn't already been initialized
if (!admin.apps.length) {
  admin.initializeApp()
}

// Export the admin services that are used across multiple functions
export const db = admin.firestore()
export const auth = admin.auth()
export const storage = admin.storage()
export { admin }

// Utility function to get user role
export async function getUserRole(userId: string): Promise<string | null> {
  try {
    const userDoc = await db.collection("users").doc(userId).get()
    if (!userDoc.exists) {
      return null
    }
    return userDoc.data()?.role || null
  } catch (error) {
    console.error("Error getting user role:", error)
    return null
  }
}

// Utility function to validate user claim
export async function validateUserClaim(userId: string, requiredRoles: string[]): Promise<boolean> {
  try {
    const role = await getUserRole(userId)
    return !!role && requiredRoles.includes(role.toLowerCase())
  } catch (error) {
    console.error("Error validating user claim:", error)
    return false
  }
}

