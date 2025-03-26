// This is a documentation file for Firestore security rules
// Actual rules should be deployed using Firebase CLI

/*
// Users collection - Basic user data
match /users/{userId} {
  // Anyone can read public user profiles
  allow read: if request.auth != null;
  
  // Users can only write their own data
  allow write: if request.auth.uid == userId;
  
  // Admins and SuperAdmins can write to any user document
  allow write: if getUserRole() in ["Admin", "SuperAdmin"];
}

// Projects collection - Real estate projects
match /projects/{projectId} {
  // All authenticated users can read project data
  allow read: if request.auth != null;
  
  // Only Admins and SuperAdmins can create/update projects
  allow write: if getUserRole() in ["Admin", "SuperAdmin"];
  
  // Nested collections
  match /plots/{plotId} {
    allow read: if request.auth != null;
    allow write: if getUserRole() in ["Admin", "SuperAdmin"];
  }
}

// Visits collection - Property visit requests
match /visits/{visitId} {
  // Users can read their own visits
  allow read: if request.auth.uid == resource.data.userId;
  
  // Managers can read visits for their assigned projects
  allow read: if 
    getUserRole() == "Manager" && 
    exists(/databases/$(database)/documents/projects/$(resource.data.projectId)/managers/$(request.auth.uid));
  
  // Admins and SuperAdmins can read all visits
  allow read: if getUserRole() in ["Admin", "SuperAdmin"];
  
  // Users can create visit requests
  allow create: if 
    request.auth != null && 
    request.resource.data.userId == request.auth.uid;
  
  // Managers can update visits for their projects
  allow update: if 
    getUserRole() == "Manager" && 
    exists(/databases/$(database)/documents/projects/$(resource.data.projectId)/managers/$(request.auth.uid));
  
  // Admins and SuperAdmins can update any visit
  allow update: if getUserRole() in ["Admin", "SuperAdmin"];
}

// Tasks collection - Manager tasks
match /tasks/{taskId} {
  // Managers can read their assigned tasks
  allow read: if 
    getUserRole() == "Manager" && 
    resource.data.assignedTo == request.auth.uid;
  
  // Admins and SuperAdmins can read and write all tasks
  allow read, write: if getUserRole() in ["Admin", "SuperAdmin"];
  
  // Managers can update their own tasks (e.g., mark as complete)
  allow update: if 
    getUserRole() == "Manager" && 
    resource.data.assignedTo == request.auth.uid;
}

// Announcements collection
match /announcements/{announcementId} {
  // All authenticated users can read announcements
  allow read: if request.auth != null;
  
  // Only Admins and SuperAdmins can create/update/delete announcements
  allow write: if getUserRole() in ["Admin", "SuperAdmin"];
}

// Audit logs collection
match /auditLogs/{logId} {
  // Only Admins and SuperAdmins can read audit logs
  allow read: if getUserRole() in ["Admin", "SuperAdmin"];
  
  // Allow creates from any authenticated user (system will log actions)
  allow create: if request.auth != null;
  
  // No one can update or delete audit logs
  allow update, delete: if false;
}

// Helper function to get user role
function getUserRole() {
  let uid = request.auth.uid;
  let userDoc = get(/databases/$(database)/documents/users/$(uid));
  return userDoc.data.role;
}
*/
