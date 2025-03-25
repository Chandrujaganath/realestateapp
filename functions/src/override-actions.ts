import * as functions from "firebase-functions/v1"
import * as admin from "firebase-admin"

interface OverrideData {
  actionType: string;
  resourceType: string;
  resourceId: string;
  newData: any;
}

export const overrideAction = functions.https.onCall(async (data: OverrideData, context: functions.https.CallableContext) => {
  // Check if the caller is a SuperAdmin
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.")
  }

  const callerUid = context.auth.uid
  const callerDoc = await admin.firestore().collection("users").doc(callerUid).get()

  if (!callerDoc.exists || callerDoc.data()?.role !== "SuperAdmin") {
    throw new functions.https.HttpsError("permission-denied", "Only SuperAdmins can override actions.")
  }

  // Validate input
  if (!data.actionType || !data.resourceType || !data.resourceId || !data.newData) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      'The function requires "actionType", "resourceType", "resourceId", and "newData" parameters.',
    )
  }

  try {
    // Handle different types of overrides based on the resource type and action
    switch (data.resourceType) {
      case "visit":
        return handleVisitOverride(data)

      case "project":
        return handleProjectOverride(data)

      case "plot":
        return handlePlotOverride(data)

      case "task":
        return handleTaskOverride(data)

      default:
        throw new functions.https.HttpsError("invalid-argument", `Unsupported resource type: ${data.resourceType}`)
    }
  } catch (error) {
    console.error("Error overriding action:", error)
    throw new functions.https.HttpsError("internal", "An error occurred while overriding the action.")
  }
})

// Handle visit-related overrides
async function handleVisitOverride(data: OverrideData) {
  const { actionType, resourceId, newData } = data
  const visitRef = admin.firestore().collection("visits").doc(resourceId)

  switch (actionType) {
    case "REOPEN_VISIT":
      // Reopen a previously closed or rejected visit
      await visitRef.update({
        status: "pending",
        updatedAt: admin.firestore.Timestamp.now(),
        overrideReason: newData.reason || "Reopened by SuperAdmin",
      })
      return { success: true }

    case "REASSIGN_VISIT":
      // Reassign a visit to a different manager
      await visitRef.update({
        assignedTo: newData.managerId,
        updatedAt: admin.firestore.Timestamp.now(),
        overrideReason: newData.reason || "Reassigned by SuperAdmin",
      })
      return { success: true }

    case "CHANGE_VISIT_STATUS":
      // Directly change the status of a visit
      await visitRef.update({
        status: newData.status,
        updatedAt: admin.firestore.Timestamp.now(),
        overrideReason: newData.reason || "Status changed by SuperAdmin",
      })
      return { success: true }

    default:
      throw new functions.https.HttpsError("invalid-argument", `Unsupported action type for visit: ${actionType}`)
  }
}

// Handle project-related overrides
async function handleProjectOverride(data: OverrideData) {
  const { actionType, resourceId, newData } = data
  const projectRef = admin.firestore().collection("projects").doc(resourceId)

  switch (actionType) {
    case "CHANGE_PROJECT_STATUS":
      await projectRef.update({
        status: newData.status,
        updatedAt: admin.firestore.Timestamp.now(),
        overrideReason: newData.reason || "Status changed by SuperAdmin",
      })
      return { success: true }

    case "REASSIGN_PROJECT_MANAGER":
      // Remove old manager and assign new one
      const batch = admin.firestore().batch()

      // Add new manager to project
      const newManagerRef = projectRef.collection("managers").doc(newData.managerId)
      batch.set(newManagerRef, {
        assignedAt: admin.firestore.Timestamp.now(),
        assignedBy: "SuperAdmin",
        role: newData.role || "primary",
      })

      // If replacing a specific manager
      if (newData.oldManagerId) {
        const oldManagerRef = projectRef.collection("managers").doc(newData.oldManagerId)
        batch.delete(oldManagerRef)
      }

      await batch.commit()
      return { success: true }

    default:
      throw new functions.https.HttpsError("invalid-argument", `Unsupported action type for project: ${actionType}`)
  }
}

// Handle plot-related overrides
async function handlePlotOverride(data: OverrideData) {
  const { actionType, resourceId, newData } = data
  const [projectId, plotId] = resourceId.split("|")

  if (!projectId || !plotId) {
    throw new functions.https.HttpsError("invalid-argument", 'Plot resourceId must be in format "projectId|plotId"')
  }

  const plotRef = admin.firestore().collection("projects").doc(projectId).collection("plots").doc(plotId)

  switch (actionType) {
    case "CHANGE_PLOT_STATUS":
      await plotRef.update({
        status: newData.status,
        updatedAt: admin.firestore.Timestamp.now(),
        overrideReason: newData.reason || "Status changed by SuperAdmin",
      })
      return { success: true }

    case "REASSIGN_PLOT_OWNER":
      await plotRef.update({
        ownerId: newData.ownerId,
        updatedAt: admin.firestore.Timestamp.now(),
        overrideReason: newData.reason || "Owner reassigned by SuperAdmin",
      })
      return { success: true }

    default:
      throw new functions.https.HttpsError("invalid-argument", `Unsupported action type for plot: ${actionType}`)
  }
}

// Handle task-related overrides
async function handleTaskOverride(data: OverrideData) {
  const { actionType, resourceId, newData } = data
  const taskRef = admin.firestore().collection("tasks").doc(resourceId)

  switch (actionType) {
    case "REASSIGN_TASK":
      await taskRef.update({
        assignedTo: newData.managerId,
        updatedAt: admin.firestore.Timestamp.now(),
        overrideReason: newData.reason || "Reassigned by SuperAdmin",
      })
      return { success: true }

    case "CHANGE_TASK_STATUS":
      await taskRef.update({
        status: newData.status,
        updatedAt: admin.firestore.Timestamp.now(),
        overrideReason: newData.reason || "Status changed by SuperAdmin",
      })
      return { success: true }

    case "CHANGE_TASK_PRIORITY":
      await taskRef.update({
        priority: newData.priority,
        updatedAt: admin.firestore.Timestamp.now(),
        overrideReason: newData.reason || "Priority changed by SuperAdmin",
      })
      return { success: true }

    default:
      throw new functions.https.HttpsError("invalid-argument", `Unsupported action type for task: ${actionType}`)
  }
}

