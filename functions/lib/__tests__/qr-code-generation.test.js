'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });
const admin = __importStar(require('firebase-admin'));
const functionsTest = __importStar(require('firebase-functions-test'));
const qr_code_generation_1 = require('../qr-code-generation');
const globals_1 = require('@jest/globals');
// Initialize the firebase-functions-test SDK
const testEnv = functionsTest.default();
// Create a mock EventContext
const createMockEventContext = (visitId) => ({
  eventId: 'test-event-id',
  timestamp: new Date().toISOString(),
  eventType: 'google.firestore.document.update',
  resource: {
    name: `projects/test-project/databases/(default)/documents/visits/${visitId}`,
    service: 'firestore.googleapis.com',
  },
  params: { visitId },
});
(0, globals_1.describe)('QR Code Generation', () => {
  // Setup mock services
  let firestoreStub;
  let storageStub;
  let messagingStub;
  (0, globals_1.beforeAll)(() => {
    // Mock Firestore
    firestoreStub = {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      update: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue({
        data: () => ({
          fcmToken: 'test-token',
        }),
        exists: true,
      }),
    };
    // Mock Storage
    const fileStub = {
      save: jest.fn().mockResolvedValue(undefined),
      getSignedUrl: jest.fn().mockResolvedValue(['https://example.com/qrcode.png']),
    };
    const bucketStub = {
      file: jest.fn().mockReturnValue(fileStub),
    };
    storageStub = {
      bucket: jest.fn().mockReturnValue(bucketStub),
    };
    // Mock Messaging
    messagingStub = {
      send: jest.fn().mockResolvedValue(undefined),
    };
    // Mock the admin initialization
    Object.defineProperty(admin, 'initializeApp', {
      value: jest.fn().mockReturnValue({}),
    });
    Object.defineProperty(admin, 'firestore', {
      get: () => () => firestoreStub,
    });
    Object.defineProperty(admin, 'storage', {
      get: () => () => storageStub,
    });
    Object.defineProperty(admin, 'messaging', {
      get: () => () => messagingStub,
    });
  });
  (0, globals_1.afterAll)(() => {
    testEnv.cleanup();
    jest.restoreAllMocks();
  });
  (0, globals_1.it)('should generate QR code when visit status changes to approved', async () => {
    // Create a visit document change - mocking the Firestore DocumentSnapshot
    const beforeSnapshot = {
      data: () => ({
        status: 'pending',
        guestId: 'guest123',
        projectId: 'project123',
        visitDate: admin.firestore.Timestamp.fromDate(new Date()),
      }),
      exists: true,
      id: 'visit123',
      ref: { id: 'visit123' },
      readTime: admin.firestore.Timestamp.now(),
      createTime: admin.firestore.Timestamp.now(),
      updateTime: admin.firestore.Timestamp.now(),
    };
    const afterSnapshot = {
      data: () => ({
        status: 'approved',
        guestId: 'guest123',
        projectId: 'project123',
        visitDate: admin.firestore.Timestamp.fromDate(new Date()),
      }),
      exists: true,
      id: 'visit123',
      ref: { id: 'visit123' },
      readTime: admin.firestore.Timestamp.now(),
      createTime: admin.firestore.Timestamp.now(),
      updateTime: admin.firestore.Timestamp.now(),
    };
    const change = { before: beforeSnapshot, after: afterSnapshot };
    const context = createMockEventContext('visit123');
    // Call the function
    await (0, qr_code_generation_1.generateQRCodeOnApproval)(change, context);
    // Verify Firestore update was called
    (0, globals_1.expect)(firestoreStub.collection).toHaveBeenCalledWith('visits');
    (0, globals_1.expect)(firestoreStub.doc).toHaveBeenCalledWith('visit123');
    (0, globals_1.expect)(firestoreStub.update).toHaveBeenCalled();
  });
  (0, globals_1.it)(
    'should not generate QR code if status is not changed to approved',
    async () => {
      // Create a visit document change
      const beforeSnapshot = {
        data: () => ({
          status: 'pending',
          guestId: 'guest123',
          projectId: 'project123',
          visitDate: admin.firestore.Timestamp.fromDate(new Date()),
        }),
        exists: true,
        id: 'visit123',
        ref: { id: 'visit123' },
        readTime: admin.firestore.Timestamp.now(),
        createTime: admin.firestore.Timestamp.now(),
        updateTime: admin.firestore.Timestamp.now(),
      };
      const afterSnapshot = {
        data: () => ({
          status: 'rejected',
          guestId: 'guest123',
          projectId: 'project123',
          visitDate: admin.firestore.Timestamp.fromDate(new Date()),
        }),
        exists: true,
        id: 'visit123',
        ref: { id: 'visit123' },
        readTime: admin.firestore.Timestamp.now(),
        createTime: admin.firestore.Timestamp.now(),
        updateTime: admin.firestore.Timestamp.now(),
      };
      const change = { before: beforeSnapshot, after: afterSnapshot };
      const context = createMockEventContext('visit123');
      // Reset mocks
      firestoreStub.update.mockClear();
      // Call the function
      await (0, qr_code_generation_1.generateQRCodeOnApproval)(change, context);
      // Verify Firestore update was not called
      (0, globals_1.expect)(firestoreStub.update).not.toHaveBeenCalled();
    }
  );
});
//# sourceMappingURL=qr-code-generation.test.js.map
