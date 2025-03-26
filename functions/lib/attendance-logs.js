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
exports.recordGeofenceEvent = exports.compileManagerAttendanceLogs = void 0;
const functions = __importStar(require('firebase-functions/v1'));
const admin = __importStar(require('firebase-admin'));
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();
/**
 * Scheduled function that runs daily to compile manager attendance logs
 */
exports.compileManagerAttendanceLogs = functions.pubsub
  .schedule('5 0 * * *') // Run at 00:05 every day
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      console.log('Compiling daily manager attendance logs');
      // Calculate yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);
      const yesterdayTimestamp = admin.firestore.Timestamp.fromDate(yesterday);
      const yesterdayEndTimestamp = admin.firestore.Timestamp.fromDate(yesterdayEnd);
      // Get all managers
      const managersSnapshot = await db
        .collection('users')
        .where('role', '==', 'manager')
        .where('status', '==', 'active')
        .get();
      if (managersSnapshot.empty) {
        console.log('No active managers found');
        return null;
      }
      // Process each manager's attendance
      const attendancePromises = managersSnapshot.docs.map(async (managerDoc) => {
        const managerId = managerDoc.id;
        // Get geofence logs for this manager from yesterday
        const logsSnapshot = await db
          .collection('geofenceLogs')
          .where('userId', '==', managerId)
          .where('timestamp', '>=', yesterdayTimestamp)
          .where('timestamp', '<=', yesterdayEndTimestamp)
          .orderBy('timestamp', 'asc')
          .get();
        if (logsSnapshot.empty) {
          console.log(
            `No geofence logs found for manager ${managerId} on ${yesterday.toDateString()}`
          );
          // Create an empty attendance record
          await db.collection('attendanceSummaries').add({
            userId: managerId,
            date: yesterdayTimestamp,
            totalHours: 0,
            status: 'absent',
            logs: [],
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          return;
        }
        // Process logs to calculate total hours
        const logs = logsSnapshot.docs.map((doc) => Object.assign({ id: doc.id }, doc.data()));
        let totalMilliseconds = 0;
        let currentCheckIn = null;
        const processedLogs = [];
        // Calculate hours based on check-in/check-out pairs
        for (const log of logs) {
          if (log.type === 'check-in' && !currentCheckIn) {
            currentCheckIn = log;
          } else if (log.type === 'check-out' && currentCheckIn) {
            const duration = log.timestamp.toMillis() - currentCheckIn.timestamp.toMillis();
            totalMilliseconds += duration;
            processedLogs.push({
              checkIn: currentCheckIn.timestamp,
              checkOut: log.timestamp,
              projectId: log.projectId,
              duration: duration,
              locationName: log.locationName || 'Unknown',
            });
            currentCheckIn = null;
          }
        }
        // Handle case where there's a check-in without a check-out
        if (currentCheckIn) {
          // Use end of day as implicit check-out
          const implicitCheckOut = yesterdayEndTimestamp;
          const duration = implicitCheckOut.toMillis() - currentCheckIn.timestamp.toMillis();
          totalMilliseconds += duration;
          processedLogs.push({
            checkIn: currentCheckIn.timestamp,
            checkOut: implicitCheckOut,
            projectId: currentCheckIn.projectId,
            duration: duration,
            locationName: currentCheckIn.locationName || 'Unknown',
            isImplicitCheckOut: true,
          });
        }
        // Convert to hours
        const totalHours = totalMilliseconds / (1000 * 60 * 60);
        // Determine attendance status
        let status = 'absent';
        if (totalHours >= 7) {
          status = 'present';
        } else if (totalHours >= 4) {
          status = 'half-day';
        }
        // Create attendance summary
        await db.collection('attendanceSummaries').add({
          userId: managerId,
          date: yesterdayTimestamp,
          totalHours: Number.parseFloat(totalHours.toFixed(2)),
          status,
          logs: processedLogs,
          rawLogCount: logs.length,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(
          `Created attendance summary for manager ${managerId}: ${totalHours.toFixed(2)} hours (${status})`
        );
      });
      await Promise.all(attendancePromises);
      console.log('Daily attendance compilation completed');
      return null;
    } catch (error) {
      console.error('Error in compileManagerAttendanceLogs:', error);
      return null;
    }
  });
/**
 * Function to validate and record geofence check-ins/outs
 */
exports.recordGeofenceEvent = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to record geofence events'
    );
  }
  const userId = context.auth.uid;
  // Validate request data
  const { type, projectId, latitude, longitude, locationName } = data;
  if (!type || !['check-in', 'check-out'].includes(type)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Type must be either "check-in" or "check-out"'
    );
  }
  if (!projectId) {
    throw new functions.https.HttpsError('invalid-argument', 'Project ID is required');
  }
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Valid latitude and longitude are required'
    );
  }
  try {
    // Get project geofence data
    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Project not found');
    }
    const projectData = projectDoc.data();
    // Validate user is a manager assigned to this project
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }
    const userData = userDoc.data();
    if (
      !userData ||
      userData.role !== 'manager' ||
      !userData.assignedProjects.includes(projectId)
    ) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'User is not a manager assigned to this project'
      );
    }
    // Verify location is within project geofence
    if (projectData && projectData.geofence) {
      const isWithinGeofence = isPointInPolygon(
        { lat: latitude, lng: longitude },
        projectData.geofence
      );
      if (!isWithinGeofence) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Location is outside the project geofence'
        );
      }
    }
    // Record the geofence event
    const logRef = await db.collection('geofenceLogs').add({
      userId,
      type,
      projectId,
      latitude,
      longitude,
      locationName: locationName || (projectData && projectData.name) || 'Unknown',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      deviceInfo: context.rawRequest
        ? {
            userAgent: context.rawRequest.headers['user-agent'],
            ip: context.rawRequest.headers['x-forwarded-for'] || 'unknown',
          }
        : null,
    });
    console.log(`Recorded ${type} for user ${userId} at project ${projectId}`);
    return {
      success: true,
      logId: logRef.id,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error in recordGeofenceEvent:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while recording the geofence event'
    );
  }
});
/**
 * Helper function to check if a point is within a polygon
 */
function isPointInPolygon(point, polygon) {
  // Ray casting algorithm
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat;
    const yi = polygon[i].lng;
    const xj = polygon[j].lat;
    const yj = polygon[j].lng;
    const intersect =
      yi > point.lng !== yj > point.lng &&
      point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
//# sourceMappingURL=attendance-logs.js.map
