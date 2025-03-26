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
exports.assignTask = void 0;
const functions = __importStar(require('firebase-functions'));
const admin = __importStar(require('firebase-admin'));
exports.assignTask = functions.https.onCall(async (data, context) => {
  try {
    // Type-cast data to expected interface
    const { title, description, projectId, priority, dueDate, assignedTo } = data;
    // Check if the user is authenticated and has admin role
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    const userData = userDoc.data();
    if (!userData || (userData.role !== 'admin' && userData.role !== 'superadmin')) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admin users can assign tasks'
      );
    }
    // Validate required fields
    if (!title || !projectId || !dueDate) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields: title, projectId, and dueDate are required'
      );
    }
    // Get the project to verify it exists
    const projectDoc = await admin.firestore().collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Project not found');
    }
    // If assignedTo is specified, verify it's a valid manager
    let assignedManagerId = assignedTo;
    if (!assignedManagerId) {
      // Auto-assign to a manager for the project if not specified
      const projectManagers = await admin
        .firestore()
        .collection('users')
        .where('role', '==', 'manager')
        .where('assignedProjects', 'array-contains', projectId)
        .where('isActive', '==', true)
        .where('isOnLeave', '==', false)
        .get();
      if (projectManagers.empty) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'No active managers found for this project'
        );
      }
      // Find the manager with the least number of active tasks
      const managersWithTaskCount = await Promise.all(
        projectManagers.docs.map(async (managerDoc) => {
          const activeTasks = await admin
            .firestore()
            .collection('tasks')
            .where('assignedTo', '==', managerDoc.id)
            .where('status', 'in', ['pending', 'in-progress'])
            .count()
            .get();
          return {
            managerId: managerDoc.id,
            taskCount: activeTasks.data().count,
          };
        })
      );
      const managerWithLeastTasks = managersWithTaskCount.reduce(
        (min, current) => (current.taskCount < min.taskCount ? current : min),
        managersWithTaskCount[0]
      );
      assignedManagerId = managerWithLeastTasks.managerId;
    }
    // Create the task
    const taskRef = admin.firestore().collection('tasks').doc();
    const taskData = {
      title,
      description: description || '',
      assignedTo: assignedManagerId,
      assignedBy: context.auth.uid,
      projectId,
      status: 'pending',
      priority: priority || 'medium',
      dueDate: new Date(dueDate),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await taskRef.set(taskData);
    // Create notification for the assigned manager
    await admin
      .firestore()
      .collection('notifications')
      .add({
        userId: assignedManagerId,
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${title}`,
        type: 'task_assignment',
        referenceId: taskRef.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
      });
    return Object.assign({ success: true, taskId: taskRef.id }, taskData);
  } catch (error) {
    console.error('Error assigning task:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to assign task');
  }
});
//# sourceMappingURL=assignTask.js.map
