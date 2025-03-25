// This would be in a separate Firebase Functions project
// For reference only - not part of the Next.js app

import * as functions from "firebase-functions/v1" // Explicitly use v1
import * as admin from "firebase-admin"
// @ts-ignore - No type definitions available
import * as QRCode from "qrcode"

admin.initializeApp()

const db = admin.firestore()
const storage = admin.storage()

// Function to generate QR code when a visit is approved
export const generateQrCode = functions.firestore.document("visits/{visitId}").onUpdate(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
  const visitData = change.after.data()
  const previousData = change.before.data()

  // Check if status changed to approved
  if (visitData?.status === "approved" && previousData?.status !== "approved") {
    try {
      const visitId = context.params.visitId

      // Generate a unique token for the QR code
      const token = `${visitId}-${Date.now()}`

      // Generate QR code
      const qrCodeBuffer = await QRCode.toBuffer(token)

      // Upload QR code to Firebase Storage
      const bucket = storage.bucket()
      const file = bucket.file(`qr-codes/${visitId}.png`)
      await file.save(qrCodeBuffer, {
        metadata: {
          contentType: "image/png",
        },
      })

      // Get public URL
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: "03-01-2500", // Far future expiration
      })

      // Update visit document with QR code URL
      await db.collection("visits").doc(visitId).update({
        qrCodeUrl: url,
        qrCodeToken: token,
      })

      return { success: true }
    } catch (error) {
      console.error("Error generating QR code:", error)
      return { error: "Failed to generate QR code" }
    }
  }

  return null
})

// Function to deactivate guest accounts after visit date
export const deactivateExpiredGuestAccounts = functions.pubsub
  .schedule("0 0 * * *") // Run daily at midnight
  .onRun(async (context: functions.EventContext) => {
    try {
      const now = admin.firestore.Timestamp.now()

      // Get all guest users with expiry date in the past
      const usersSnapshot = await db
        .collection("users")
        .where("role", "==", "guest")
        .where("accountStatus", "==", "active")
        .where("expiryDate", "<", now)
        .get()

      if (usersSnapshot.empty) {
        console.log("No expired guest accounts found")
        return null
      }

      // Update each user's account status to inactive
      const batch = db.batch()

      usersSnapshot.forEach((doc) => {
        batch.update(doc.ref, { accountStatus: "inactive" })
      })

      await batch.commit()

      console.log(`Deactivated ${usersSnapshot.size} expired guest accounts`)
      return { deactivatedCount: usersSnapshot.size }
    } catch (error) {
      console.error("Error deactivating expired guest accounts:", error)
      return { error: "Failed to deactivate expired guest accounts" }
    }
  })

