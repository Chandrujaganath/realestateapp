"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivateGuestOnVisitCompletion = exports.deactivateExpiredGuestAccounts = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const auth = admin.auth();
/**
 * Scheduled function that runs daily to deactivate guest accounts
 * whose visit date has passed
 */
exports.deactivateExpiredGuestAccounts = functions.pubsub
    .schedule("0 0 * * *") // Run at midnight every day
    .timeZone("UTC")
    .onRun(async (context) => {
    try {
        console.log("Running scheduled guest account deactivation");
        const now = admin.firestore.Timestamp.now();
        // Query for guests with past visit dates
        const expiredVisitsSnapshot = await db
            .collection("visits")
            .where("visitDate", "<", now)
            .where("status", "==", "approved")
            .get();
        if (expiredVisitsSnapshot.empty) {
            console.log("No expired visits found");
            return null;
        }
        const guestIdsToDeactivate = new Set();
        // Collect unique guest IDs
        expiredVisitsSnapshot.forEach((doc) => {
            const visitData = doc.data();
            guestIdsToDeactivate.add(visitData.guestId);
        });
        console.log(`Found ${guestIdsToDeactivate.size} guests to deactivate`);
        // Process each guest
        const deactivationPromises = Array.from(guestIdsToDeactivate).map(async (guestId) => {
            // Verify user is a guest before deactivating
            const userDoc = await db.collection("users").doc(guestId).get();
            const userData = userDoc.data();
            if (!userData || userData.role !== "guest") {
                console.log(`Skipping ${guestId} - not a guest or user not found`);
                return;
            }
            // Check if already deactivated
            if (userData.status === "inactive") {
                console.log(`Guest ${guestId} already deactivated`);
                return;
            }
            // Update Firestore status
            await db.collection("users").doc(guestId).update({
                status: "inactive",
                deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
                deactivationReason: "Visit date expired",
            });
            // Disable Firebase Auth account
            await auth.updateUser(guestId, { disabled: true });
            console.log(`Deactivated guest account ${guestId}`);
        });
        await Promise.all(deactivationPromises);
        console.log("Guest account deactivation completed");
        return null;
    }
    catch (error) {
        console.error("Error in deactivateExpiredGuestAccounts:", error);
        return null;
    }
});
/**
 * Alternative implementation using Firestore triggers
 * This function deactivates a guest account when their visit is marked as completed
 */
exports.deactivateGuestOnVisitCompletion = functions.firestore
    .document("visits/{visitId}")
    .onUpdate(async (change, context) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();
    // Check if status changed to 'completed'
    if ((previousValue === null || previousValue === void 0 ? void 0 : previousValue.status) !== "completed" && (newValue === null || newValue === void 0 ? void 0 : newValue.status) === "completed") {
        const guestId = newValue === null || newValue === void 0 ? void 0 : newValue.guestId;
        if (!guestId) {
            console.log("No guest ID found in visit data");
            return null;
        }
        try {
            // Verify user is a guest
            const userDoc = await db.collection("users").doc(guestId).get();
            const userData = userDoc.data();
            if (!userData || userData.role !== "guest") {
                console.log(`Not deactivating ${guestId} - not a guest or user not found`);
                return null;
            }
            // Check if already deactivated
            if (userData.status === "inactive") {
                console.log(`Guest ${guestId} already deactivated`);
                return null;
            }
            // Update Firestore status
            await db.collection("users").doc(guestId).update({
                status: "inactive",
                deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
                deactivationReason: "Visit completed",
            });
            // Disable Firebase Auth account
            await auth.updateUser(guestId, { disabled: true });
            console.log(`Deactivated guest account ${guestId} after visit completion`);
            return { success: true };
        }
        catch (error) {
            console.error(`Error deactivating guest ${guestId}:`, error);
            return { error: "Failed to deactivate guest account" };
        }
    }
    return null;
});
//# sourceMappingURL=guest-deactivation.js.map