import { expect, describe, it, beforeAll, afterAll } from '@jest/globals';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as functionsTest from 'firebase-functions-test';

import { generateQRCodeOnApproval } from '../qr-code-generation';

// Initialize the firebase-functions-test SDK
const _testEnv = functionsTest.default();

// Create a mock EventContext
const createMockEventContext = (visitId: string): functions.EventContext => ({
  eventId: 'test-event-id',
  timestamp: new Date().toISOString(),
  eventType: 'google.firestore.document.update',
  resource: {
    name: `projects/test-project/databases/(default)/documents/visits/${visitId}`,
    service: 'firestore.googleapis.com',
  },
  params: { visitId } as Record<string, string>,
});

// Mock Timestamp class
const mockTimestamp = {
  now: jest.fn().mockReturnValue({ toDate: () => new Date() }),
  fromDate: jest.fn().mockImplementation((date) => ({
    toDate: () => date,
    toMillis: () => date.getTime(),
  })),
};

describe('QR Code Generation', () => {
  // Setup mock services
  let firestoreStub: any;
  let storageStub: any;
  let messagingStub: any;

  beforeAll(() => {
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
    const _fileStub = {
      save: jest.fn().mockResolvedValue(undefined),
      getSignedUrl: jest.fn().mockResolvedValue(['https://example.com/qrcode.png']),
    };

    const _bucketStub = {
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
      value: jest.fn().mockReturnValue({} as any),
    });

    Object.defineProperty(admin, 'firestore', {
      get: () => {
        const firestoreFn = () => firestoreStub;
        // Add Timestamp to the firestore function
        firestoreFn.Timestamp = mockTimestamp;
        return firestoreFn;
      },
    });

    Object.defineProperty(admin, 'storage', {
      get: () => () => storageStub,
    });

    Object.defineProperty(admin, 'messaging', {
      get: () => () => messagingStub,
    });
  });

  afterAll(() => {
    testEnv.cleanup();
    jest.restoreAllMocks();
  });

  it('should generate QR code when visit status changes to approved', async () => {
    // Create a visit document change - mocking the Firestore DocumentSnapshot
    const beforeSnapshot = {
      data: () => ({
        status: 'pending',
        guestId: 'guest123',
        projectId: 'project123',
        visitDate: mockTimestamp.fromDate(new Date()),
      }),
      exists: true,
      id: 'visit123',
      ref: { id: 'visit123' },
    };

    const afterSnapshot = {
      data: () => ({
        status: 'approved',
        guestId: 'guest123',
        projectId: 'project123',
        visitDate: mockTimestamp.fromDate(new Date()),
      }),
      exists: true,
      id: 'visit123',
      ref: { id: 'visit123' },
    };

    const change = { before: beforeSnapshot, after: afterSnapshot } as any;
    const context = createMockEventContext('visit123');

    // Call the function
    await generateQRCodeOnApproval(change, context);

    // Verify Firestore update was called
    expect(firestoreStub.collection).toHaveBeenCalledWith('visits');
    expect(firestoreStub.doc).toHaveBeenCalledWith('visit123');
    expect(firestoreStub.update).toHaveBeenCalled();
  });

  it('should not generate QR code if status is not changed to approved', async () => {
    // Create a visit document change
    const beforeSnapshot = {
      data: () => ({
        status: 'pending',
        guestId: 'guest123',
        projectId: 'project123',
        visitDate: mockTimestamp.fromDate(new Date()),
      }),
      exists: true,
      id: 'visit123',
      ref: { id: 'visit123' },
    };

    const afterSnapshot = {
      data: () => ({
        status: 'rejected',
        guestId: 'guest123',
        projectId: 'project123',
        visitDate: mockTimestamp.fromDate(new Date()),
      }),
      exists: true,
      id: 'visit123',
      ref: { id: 'visit123' },
    };

    const change = { before: beforeSnapshot, after: afterSnapshot } as any;
    const context = createMockEventContext('visit123');

    // Reset mocks
    firestoreStub.update.mockClear();

    // Call the function
    await generateQRCodeOnApproval(change, context);

    // Verify Firestore update was not called
    expect(firestoreStub.update).not.toHaveBeenCalled();
  });
});
