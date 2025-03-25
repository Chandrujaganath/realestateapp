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
exports.reactivateAdminUser = exports.deactivateAdminUser = exports.createAdminUser = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Create Admin User
exports.createAdminUser = functions.https.onCall(async (data, context) => {
    var _a;
    // Type-cast data to expected interface
    const { email, name } = data;
    // Check if the caller is a SuperAdmin
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const callerUid = context.auth.uid;
    const callerDoc = await admin.firestore().collection("users").doc(callerUid).get();
    if (!callerDoc.exists || ((_a = callerDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== "SuperAdmin") {
        throw new functions.https.HttpsError("permission-denied", "Only SuperAdmins can create Admin users.");
    }
    // Validate input
    if (!email || !name) {
        throw new functions.https.HttpsError("invalid-argument", 'The function requires "email" and "name" parameters.');
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
            role: "Admin",
        });
        // Create the user document in Firestore
        const now = admin.firestore.Timestamp.now();
        await admin.firestore().collection("users").doc(userRecord.uid).set({
            name,
            email,
            role: "Admin",
            isActive: true,
            createdAt: now,
            createdBy: callerUid,
        });
        // Return the new admin user
        return {
            id: userRecord.uid,
            name,
            email,
            role: "Admin",
            isActive: true,
            createdAt: now.toDate(),
        };
    }
    catch (error) {
        console.error("Error creating admin user:", error);
        throw new functions.https.HttpsError("internal", "An error occurred while creating the admin user.");
    }
});
// Deactivate Admin User
exports.deactivateAdminUser = functions.https.onCall(async (data, context) => {
    var _a;
    // Type-cast data to expected interface
    const { adminId } = data;
    // Check if the caller is a SuperAdmin
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const callerUid = context.auth.uid;
    const callerDoc = await admin.firestore().collection("users").doc(callerUid).get();
    if (!callerDoc.exists || ((_a = callerDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== "SuperAdmin") {
        throw new functions.https.HttpsError("permission-denied", "Only SuperAdmins can deactivate Admin users.");
    }
    try {
        // Disable the user in Firebase Auth
        await admin.auth().updateUser(adminId, {
            disabled: true,
        });
        // Update the user document in Firestore
        await admin.firestore().collection("users").doc(adminId).update({
            isActive: false,
            updatedAt: admin.firestore.Timestamp.now(),
            updatedBy: context.auth.uid,
        });
        return { success: true };
    }
    catch (error) {
        console.error("Error deactivating admin user:", error);
        throw new functions.https.HttpsError("internal", "An error occurred while deactivating the admin user.");
    }
});
// Reactivate Admin User
exports.reactivateAdminUser = functions.https.onCall(async (data, context) => {
    var _a;
    // Type-cast data to expected interface
    const { adminId } = data;
    // Check if the caller is a SuperAdmin
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }
    const callerUid = context.auth.uid;
    const callerDoc = await admin.firestore().collection("users").doc(callerUid).get();
    if (!callerDoc.exists || ((_a = callerDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== "SuperAdmin") {
        throw new functions.https.HttpsError("permission-denied", "Only SuperAdmins can reactivate Admin users.");
    }
    try {
        // Enable the user in Firebase Auth
        await admin.auth().updateUser(adminId, {
            disabled: false,
        });
        // Update the user document in Firestore
        await admin.firestore().collection("users").doc(adminId).update({
            isActive: true,
            updatedAt: admin.firestore.Timestamp.now(),
            updatedBy: context.auth.uid,
        });
        return { success: true };
    }
    catch (error) {
        console.error("Error reactivating admin user:", error);
        throw new functions.https.HttpsError("internal", "An error occurred while reactivating the admin user.");
    }
});
// Helper function to generate a temporary password
function generateTemporaryPassword() {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}
//# sourceMappingURL=admin-management.js.map