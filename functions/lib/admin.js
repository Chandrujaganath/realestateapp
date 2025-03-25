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
exports.validateUserClaim = exports.getUserRole = exports.admin = exports.storage = exports.auth = exports.db = void 0;
const admin = __importStar(require("firebase-admin"));
exports.admin = admin;
// Initialize the Firebase Admin SDK if it hasn't already been initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
// Export the admin services that are used across multiple functions
exports.db = admin.firestore();
exports.auth = admin.auth();
exports.storage = admin.storage();
// Utility function to get user role
async function getUserRole(userId) {
    var _a;
    try {
        const userDoc = await exports.db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            return null;
        }
        return ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.role) || null;
    }
    catch (error) {
        console.error("Error getting user role:", error);
        return null;
    }
}
exports.getUserRole = getUserRole;
// Utility function to validate user claim
async function validateUserClaim(userId, requiredRoles) {
    try {
        const role = await getUserRole(userId);
        return !!role && requiredRoles.includes(role.toLowerCase());
    }
    catch (error) {
        console.error("Error validating user claim:", error);
        return false;
    }
}
exports.validateUserClaim = validateUserClaim;
//# sourceMappingURL=admin.js.map