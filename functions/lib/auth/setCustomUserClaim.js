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
exports.setCustomUserClaim = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
exports.setCustomUserClaim = functions.https.onCall(async (data, context) => {
    try {
        // Type-cast data to expected interface
        const { uid, role } = data;
        // Check if the caller is authenticated
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
        }
        // Only allow admins or superadmins to set claims
        const callerUid = context.auth.uid;
        const callerDoc = await admin.firestore().collection("users").doc(callerUid).get();
        if (!callerDoc.exists) {
            throw new functions.https.HttpsError("permission-denied", "User not found");
        }
        const callerData = callerDoc.data();
        if (!callerData || (callerData.role !== "admin" && callerData.role !== "superadmin")) {
            throw new functions.https.HttpsError("permission-denied", "Only admins can set custom claims");
        }
        // Set the custom claim
        await admin.auth().setCustomUserClaims(uid, { role });
        // Update the user's role in Firestore
        await admin.firestore().collection("users").doc(uid).update({
            role,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedBy: callerUid
        });
        return {
            success: true,
            message: `User ${uid} now has role: ${role}`
        };
    }
    catch (error) {
        console.error("Error setting custom claim:", error);
        throw new functions.https.HttpsError("internal", "Failed to set custom claim");
    }
});
//# sourceMappingURL=setCustomUserClaim.js.map