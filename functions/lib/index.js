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
exports.firebaseAdmin = exports.reactivateAdminUser = exports.deactivateAdminUser = exports.createAdminUser = exports.generateQRCode = exports.assignTask = exports.sendPushNotification = exports.setCustomUserClaim = void 0;
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin SDK
admin.initializeApp();
// Export all functions
var setCustomUserClaim_1 = require("./auth/setCustomUserClaim");
Object.defineProperty(exports, "setCustomUserClaim", { enumerable: true, get: function () { return setCustomUserClaim_1.setCustomUserClaim; } });
var sendPushNotification_1 = require("./notifications/sendPushNotification");
Object.defineProperty(exports, "sendPushNotification", { enumerable: true, get: function () { return sendPushNotification_1.sendPushNotification; } });
var assignTask_1 = require("./tasks/assignTask");
Object.defineProperty(exports, "assignTask", { enumerable: true, get: function () { return assignTask_1.assignTask; } });
var generateQRCode_1 = require("./visits/generateQRCode");
Object.defineProperty(exports, "generateQRCode", { enumerable: true, get: function () { return generateQRCode_1.generateQRCode; } });
var admin_management_1 = require("./admin-management");
Object.defineProperty(exports, "createAdminUser", { enumerable: true, get: function () { return admin_management_1.createAdminUser; } });
Object.defineProperty(exports, "deactivateAdminUser", { enumerable: true, get: function () { return admin_management_1.deactivateAdminUser; } });
Object.defineProperty(exports, "reactivateAdminUser", { enumerable: true, get: function () { return admin_management_1.reactivateAdminUser; } });
// Exporting utility function to be used in tests
exports.firebaseAdmin = admin;
//# sourceMappingURL=index.js.map