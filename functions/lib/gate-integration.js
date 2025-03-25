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
exports.validateVisitQR = exports.verifyQRCode = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * HTTP function to verify QR codes at the gate
 */
exports.verifyQRCode = functions.https.onCall(async (data, context) => {
    try {
        const { qrData, gateId, scanType } = data;
        if (!qrData) {
            throw new functions.https.HttpsError("invalid-argument", "QR code data is required");
        }
        if (!scanType || !["entry", "exit"].includes(scanType)) {
            throw new functions.https.HttpsError("invalid-argument", 'Scan type must be either "entry" or "exit"');
        }
        // Parse QR data
        let parsedData;
        try {
            parsedData = JSON.parse(qrData);
        }
        catch (e) {
            throw new functions.https.HttpsError("invalid-argument", "Invalid QR code format");
        }
        // Do not use timestamp, only extract what we need
        const { visitId, guestId, projectId, validUntil } = parsedData;
        if (!visitId || !guestId || !projectId) {
            throw new functions.https.HttpsError("invalid-argument", "QR code missing required fields");
        }
        // Check if QR code is expired
        const now = Date.now();
        if (validUntil && now > validUntil) {
            throw new functions.https.HttpsError("failed-precondition", "QR code has expired");
        }
        // Verify visit exists and is approved
        const visitDoc = await db.collection("visits").doc(visitId).get();
        if (!visitDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Visit not found");
        }
        const visitData = visitDoc.data();
        if (!visitData || visitData.status !== "approved") {
            throw new functions.https.HttpsError("failed-precondition", "Visit is not approved");
        }
        if (visitData.guestId !== guestId) {
            throw new functions.https.HttpsError("permission-denied", "QR code does not match guest ID");
        }
        // Record the scan
        const scanRef = db.collection("visits").doc(visitId).collection("scans").doc();
        await scanRef.set({
            type: scanType,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            gateId: gateId || "unknown",
            scannedBy: context.auth ? context.auth.uid : "gate-system",
            deviceInfo: context.rawRequest
                ? {
                    userAgent: context.rawRequest.headers["user-agent"],
                    ip: context.rawRequest.headers["x-forwarded-for"] || "unknown",
                }
                : null,
        });
        // Update visit status if this is an entry scan
        if (scanType === "entry" && visitData.status === "approved" && !visitData.entryTime) {
            await visitDoc.ref.update({
                entryTime: admin.firestore.FieldValue.serverTimestamp(),
                status: "in-progress",
            });
        }
        // Update visit status if this is an exit scan
        if (scanType === "exit" && visitData.status === "in-progress" && !visitData.exitTime) {
            await visitDoc.ref.update({
                exitTime: admin.firestore.FieldValue.serverTimestamp(),
                status: "completed",
            });
        }
        return {
            success: true,
            guestName: visitData.guestName || "Guest",
            projectName: visitData.projectName || "Project",
            visitDate: visitData.visitDate.toDate().toISOString(),
            scanId: scanRef.id,
            message: `${scanType === "entry" ? "Entry" : "Exit"} recorded successfully`,
        };
    }
    catch (error) {
        console.error("Error in verifyQRCode:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "An error occurred while verifying the QR code");
    }
});
/**
 * Function to validate QR codes at gate entrances
 * Called by security personnel when a visitor presents a QR code
 */
exports.validateVisitQR = functions.https.onCall(async (data, context) => {
    try {
        // Get the QR code data
        const { qrCode } = data;
        if (!qrCode) {
            throw new functions.https.HttpsError("invalid-argument", "QR code data is required");
        }
        // Parse the QR code
        let parsedData;
        try {
            parsedData = JSON.parse(qrCode);
        }
        catch (e) {
            throw new functions.https.HttpsError("invalid-argument", "Invalid QR code format");
        }
        // Extract only the fields we need, ignoring any potential 'timestamp' field
        const { visitId, guestId, projectId, validUntil } = parsedData;
        if (!visitId || !guestId || !projectId) {
            throw new functions.https.HttpsError("invalid-argument", "QR code missing required data");
        }
        // Check if QR code is expired
        if (validUntil && Date.now() > validUntil) {
            throw new functions.https.HttpsError("failed-precondition", "QR code has expired");
        }
        // Fetch the visit from Firestore
        const visitDoc = await admin.firestore().collection("visits").doc(visitId).get();
        if (!visitDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Visit record not found");
        }
        const visitData = visitDoc.data();
        // Ensure visit is approved
        if ((visitData === null || visitData === void 0 ? void 0 : visitData.status) !== "approved") {
            throw new functions.https.HttpsError("permission-denied", `Visit is not approved. Current status: ${(visitData === null || visitData === void 0 ? void 0 : visitData.status) || "unknown"}`);
        }
        // Verify visitor matches
        if (visitData.guestId !== guestId) {
            throw new functions.https.HttpsError("permission-denied", "QR code does not match visitor");
        }
        // Update visit record with entry timestamp
        await admin.firestore().collection("visits").doc(visitId).update({
            enteredAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "active",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Return success
        return {
            success: true,
            visitorName: visitData.guestName || "Unknown",
            projectName: visitData.projectName || "Unknown",
            scheduledTime: visitData.scheduledTime,
        };
    }
    catch (error) {
        console.error("Error validating QR code:", error);
        // Forward HTTP errors
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to validate QR code");
    }
});
//# sourceMappingURL=gate-integration.js.map