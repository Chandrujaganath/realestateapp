import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc, writeBatch, serverTimestamp, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { ref, uploadString } from 'firebase/storage';

import { functions } from '../lib/firebase';
import { auth, db, storage } from '../lib/firebase';

// Function to set custom claims (requires Firebase Admin SDK on the server)
const _setCustomUserClaim = httpsCallable(functions, 'setCustomUserClaim');

// Helper function to generate random dates within the last 10 days
const getRandomDate = (daysAgo = 10) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return Timestamp.fromDate(date);
};

// Helper function to generate random future dates within the next 10 days
const getRandomFutureDate = (daysAhead = 10) => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead));
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return Timestamp.fromDate(date);
};

// Helper function to generate a random QR code data URL
const _generateQRCodeDataURL = (_data: string) => {
  // This is a placeholder. In a real app, you would use a QR code library
  return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEX///8AAABVwtN+AAACT0lEQVR42uyYMY7jMAxFGRdTpPQRfBQdxUfwUXSUHMFFCmMwH0nUOAvsLrDYaWbK+bUg8T8+SUmNw+FwOBwOh8PhcDgcDofD4XA4HA6Hw+FwOBwOh8Ph8P+Gy7RMl7Ztl2VaWMhP4fTrZ9q2n7/SU/5H+DJP7TqXPM/tOk9L/gNe2nZtJZ2XVkq7ti3/Fi9Lu7Tn+/JWnnlp5Xd4WS7L9FZyKeVtmi7LsvwKf/9eWkvT9P1d/gUvb+WtlFbSNJVSSvkRvkzT9NLK9Yd8b+WllWX6AV6m6aW0VlprpbRW0rSk9AP8Jy+5tdxKbqW1nL+Dl2lKf/LcWm4t55xz/gZe0vSS8/Oa13LOOa/rV/hPnvO65pxzXte85pzXr/D0kta8rnld17zmvK7rmtev8JLSmvO6rjnndc15Xdc1fx9PSSmtOec155zXnNd1Xdf1G3hJKa05r2vOOec155zXdd3wN/GUUlpzXnPOOa9rzjmv67rh7+IppbTmnHPOOec155zXdcPfxVNKac0555xzzjnnvK4b/i6eUkrrmtc155xzzjnndcPfxVNKaV3Xdc0555xzzhv+Lp5SSuu6ruuac84554Y3/F08pZTWdV3XnHPOueFv4ymllNZ1Xdc155wbvuHv4imltK7ruq7rhjf8fTyllNZ1Xdd1wxv+Pp5SSuu6rhu+4e/jKaW0rhu+4R/gKSWHw+FwOBwOh8PhcDgcDofD4XA4HA6Hw+FwOBwOh8P/Bv8DTo8DJZjmfUoAAAAASUVORK5CYII=`;
};

// Create users with different roles
async function createUsers() {
  const users = [];
  const _roles = ['guest', 'client', 'manager', 'admin', 'superadmin'];

  for (const role of roles) {
    for (let i = 1; i <= 5; i++) {
      const email = `${role}${i}@realestate-app.com`;
      const password = `${role}${i}Pass123!`;
      const displayName = `${role.charAt(0).toUpperCase() + role.slice(1)} User ${i}`;

      try {
        // Create user in Firebase Auth
        const _userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile with display name
        await updateProfile(user, { displayName });

        // Set custom claim for role
        await setCustomUserClaim({ uid: user.uid, role });

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email,
          displayName,
          role,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isActive: true,
          phoneNumber: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          address: `${Math.floor(100 + Math.random() * 9900)} Main St, City, State`,
          profileImageUrl: '',
        });

        // Add to users array
        users.push({
          email,
          password,
          role,
          displayName,
          uid: user.uid,
        });

        console.log(`Created ${role} user: ${email}`);

        // Sign out after creating user
        await signOut(auth);
      } catch (error) {
        console.error(`Error creating ${role} user ${i}:`, error);
      }
    }
  }

  return users;
}

// Create projects and plots
async function createProjectsAndPlots(users) {
  const batch = writeBatch(db);
  const projectNames = [
    'Sunset Valley Estates',
    'Riverside Heights',
    'Mountain View Residences',
    'Lakefront Villas',
    'Urban Central Towers',
  ];

  const projects = [];

  for (let i = 0; i < projectNames.length; i++) {
    const projectId = `project-${i + 1}`;
    const project = {
      id: projectId,
      name: projectNames[i],
      description: `Luxury ${i % 2 === 0 ? 'residential' : 'commercial'} project with modern amenities and prime location.`,
      location: `${Math.floor(100 + Math.random() * 9900)} Business District, City, State`,
      status: ['planning', 'in-progress', 'completed'][Math.floor(Math.random() * 3)],
      startDate: getRandomDate(100),
      completionDate: getRandomFutureDate(365),
      managerId: users.find((u) => u.role === 'manager')?.uid || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      imageUrl: `/projects/${projectId}.jpg`,
      features: [
        'Swimming Pool',
        'Fitness Center',
        'Security System',
        'Landscaped Gardens',
        'Community Center',
      ].slice(0, Math.floor(Math.random() * 5) + 1),
    };

    batch.set(doc(db, 'projects', projectId), project);
    projects.push(project);

    // Create plots for this project
    const plotTypes = ['residential', 'commercial', 'mixed-use'];
    const plotStatuses = ['available', 'reserved', 'sold'];

    for (let j = 0; j < 20; j++) {
      const plotId = `${projectId}-plot-${j + 1}`;
      const _plotType = plotTypes[Math.floor(Math.random() * plotTypes.length)];
      const plotStatus = plotStatuses[Math.floor(Math.random() * plotStatuses.length)];
      const clientUser = users.find((u) => u.role === 'client');

      const plot = {
        id: plotId,
        projectId,
        number: `P-${j + 1}`,
        type: plotType,
        size: Math.floor(1000 + Math.random() * 9000),
        price: Math.floor(100000 + Math.random() * 900000),
        status: plotStatus,
        ownerId: plotStatus === 'sold' ? clientUser?.uid || null : null,
        location: {
          x: Math.floor(Math.random() * 100),
          y: Math.floor(Math.random() * 100),
          width: Math.floor(20 + Math.random() * 30),
          height: Math.floor(20 + Math.random() * 30),
        },
        features: [
          'Corner Plot',
          'Park Facing',
          'Wide Road',
          'Near Entrance',
          'Premium Location',
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      batch.set(doc(db, 'plots', plotId), plot);
    }
  }

  await batch.commit();
  console.log(`Created ${projects.length} projects with plots`);
  return projects;
}

// Create visits
async function createVisits(users, projects) {
  const batch = writeBatch(db);
  const visits = [];

  const guestUsers = users.filter((u) => u.role === 'guest');
  const managerUsers = users.filter((u) => u.role === 'manager');

  for (let i = 0; i < 50; i++) {
    const visitId = `visit-${i + 1}`;
    const _guestUser = guestUsers[Math.floor(Math.random() * guestUsers.length)];
    const project = projects[Math.floor(Math.random() * projects.length)];
    const isCompleted = Math.random() > 0.3;
    const isApproved = Math.random() > 0.2;
    const managerUser = managerUsers[Math.floor(Math.random() * managerUsers.length)];

    const _visitDate = getRandomFutureDate(15);
    const entryTime = isCompleted ? getRandomDate(10) : null;
    const exitTime =
      entryTime && Math.random() > 0.2
        ? new Timestamp(entryTime.seconds + Math.floor(Math.random() * 7200), entryTime.nanoseconds)
        : null;

    const visit = {
      id: visitId,
      guestId: guestUser.uid,
      projectId: project.id,
      purpose: ['Site Visit', 'Property Viewing', 'Investment Inquiry', 'General Inquiry'][
        Math.floor(Math.random() * 4)
      ],
      status: isCompleted ? 'completed' : isApproved ? 'approved' : 'pending',
      scheduledDate: visitDate,
      entryTime,
      exitTime,
      notes: Math.random() > 0.7 ? 'Interested in corner plots' : '',
      approvedBy: isApproved ? managerUser.uid : null,
      approvedAt: isApproved ? getRandomDate(12) : null,
      qrCode: isApproved ? generateQRCodeDataURL(visitId) : null,
      createdAt: getRandomDate(15),
      updatedAt: serverTimestamp(),
    };

    batch.set(doc(db, 'visits', visitId), visit);
    visits.push(visit);

    // Upload QR code to storage if approved
    if (isApproved && visit.qrCode) {
      try {
        const _storageRef = ref(storage, `qrcodes/visits/${visitId}.png`);
        await uploadString(storageRef, visit.qrCode, 'data_url');
      } catch (error) {
        console.error(`Error uploading QR code for visit ${visitId}:`, error);
      }
    }
  }

  await batch.commit();
  console.log(`Created ${visits.length} visits`);
  return visits;
}

// Create announcements
async function createAnnouncements(users) {
  const batch = writeBatch(db);
  const announcements = [];

  const adminUsers = users.filter((u) => u.role === 'admin' || u.role === 'superadmin');

  for (let i = 0; i < 15; i++) {
    const announcementId = `announcement-${i + 1}`;
    const adminUser = adminUsers[Math.floor(Math.random() * adminUsers.length)];

    const announcement = {
      id: announcementId,
      title: [
        'New Project Launch',
        'Holiday Office Hours',
        'System Maintenance',
        'Special Promotion',
        'Community Event',
      ][Math.floor(Math.random() * 5)],
      content: `This is an important announcement for all users. Please read carefully and take appropriate action. ${Math.random().toString(36).substring(2, 15)}`,
      createdBy: adminUser.uid,
      createdAt: getRandomDate(10),
      updatedAt: serverTimestamp(),
      expiresAt: getRandomFutureDate(30),
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      targetRoles:
        Math.random() > 0.5
          ? ['all']
          : ['client', 'manager'].slice(0, Math.floor(Math.random() * 2) + 1),
    };

    batch.set(doc(db, 'announcements', announcementId), announcement);
    announcements.push(announcement);
  }

  await batch.commit();
  console.log(`Created ${announcements.length} announcements`);
  return announcements;
}

// Create tasks for managers
async function createTasks(users, projects) {
  const batch = writeBatch(db);
  const tasks = [];

  const managerUsers = users.filter((u) => u.role === 'manager');
  const adminUsers = users.filter((u) => u.role === 'admin' || u.role === 'superadmin');

  for (let i = 0; i < 30; i++) {
    const taskId = `task-${i + 1}`;
    const managerUser = managerUsers[Math.floor(Math.random() * managerUsers.length)];
    const adminUser = adminUsers[Math.floor(Math.random() * adminUsers.length)];
    const project = projects[Math.floor(Math.random() * projects.length)];
    const isCompleted = Math.random() > 0.6;

    const task = {
      id: taskId,
      title: [
        'Client Meeting',
        'Site Inspection',
        'Document Verification',
        'Follow-up Call',
        'Report Preparation',
      ][Math.floor(Math.random() * 5)],
      description: `Task details: ${Math.random().toString(36).substring(2, 15)}`,
      assignedTo: managerUser.uid,
      assignedBy: adminUser.uid,
      projectId: project.id,
      status: isCompleted ? 'completed' : Math.random() > 0.5 ? 'in-progress' : 'pending',
      priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
      dueDate: getRandomFutureDate(15),
      completedAt: isCompleted ? getRandomDate(5) : null,
      createdAt: getRandomDate(10),
      updatedAt: serverTimestamp(),
    };

    batch.set(doc(db, 'tasks', taskId), task);
    tasks.push(task);
  }

  await batch.commit();
  console.log(`Created ${tasks.length} tasks`);
  return tasks;
}

// Create attendance records for managers
async function createAttendance(users) {
  const batch = writeBatch(db);
  const attendance = [];

  const managerUsers = users.filter((u) => u.role === 'manager');

  // Create attendance for the last 10 days
  for (let day = 0; day < 10; day++) {
    for (const manager of managerUsers) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      const _dateString = date.toISOString().split('T')[0];
      const attendanceId = `${manager.uid}-${dateString}`;

      // Skip some days randomly (weekends or leave)
      if (Math.random() > 0.8) continue;

      const checkInTime = new Date(date);
      checkInTime.setHours(8 + Math.floor(Math.random() * 2));
      checkInTime.setMinutes(Math.floor(Math.random() * 60));

      const checkOutTime = new Date(date);
      checkOutTime.setHours(17 + Math.floor(Math.random() * 3));
      checkOutTime.setMinutes(Math.floor(Math.random() * 60));

      const attendance = {
        id: attendanceId,
        userId: manager.uid,
        date: Timestamp.fromDate(date),
        checkInTime: Timestamp.fromDate(checkInTime),
        checkOutTime: Timestamp.fromDate(checkOutTime),
        location: {
          checkIn: {
            latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
            longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
          },
          checkOut: {
            latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
            longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
          },
        },
        status: 'present',
        notes: Math.random() > 0.8 ? 'Working from site' : '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      batch.set(doc(db, 'attendance', attendanceId), attendance);
    }
  }

  await batch.commit();
  console.log(`Created attendance records for managers`);
  return attendance;
}

// Create sell requests
async function createSellRequests(users, projects) {
  const batch = writeBatch(db);
  const sellRequests = [];

  const clientUsers = users.filter((u) => u.role === 'client');
  const adminUsers = users.filter((u) => u.role === 'admin');

  // Get all plots that are sold
  const soldPlots = [];
  for (const project of projects) {
    for (let j = 0; j < 20; j++) {
      const plotId = `${project.id}-plot-${j + 1}`;
      if (Math.random() > 0.7) {
        soldPlots.push({
          id: plotId,
          projectId: project.id,
          number: `P-${j + 1}`,
        });
      }
    }
  }

  for (let i = 0; i < 10; i++) {
    const requestId = `sell-request-${i + 1}`;
    const clientUser = clientUsers[Math.floor(Math.random() * clientUsers.length)];
    const adminUser = adminUsers[Math.floor(Math.random() * adminUsers.length)];
    const plot = soldPlots[Math.floor(Math.random() * soldPlots.length)];
    const isApproved = Math.random() > 0.5;

    const sellRequest = {
      id: requestId,
      plotId: plot.id,
      projectId: plot.projectId,
      requestedBy: clientUser.uid,
      requestedPrice: Math.floor(200000 + Math.random() * 800000),
      status: isApproved ? 'approved' : Math.random() > 0.5 ? 'pending' : 'rejected',
      notes: `Selling due to ${['relocation', 'investment', 'financial reasons', 'upgrade'][Math.floor(Math.random() * 4)]}`,
      approvedBy: isApproved ? adminUser.uid : null,
      approvedAt: isApproved ? getRandomDate(5) : null,
      createdAt: getRandomDate(10),
      updatedAt: serverTimestamp(),
    };

    batch.set(doc(db, 'sellRequests', requestId), sellRequest);
    sellRequests.push(sellRequest);
  }

  await batch.commit();
  console.log(`Created ${sellRequests.length} sell requests`);
  return sellRequests;
}

// Main function to seed all data
async function seedProductionData() {
  try {
    console.log('Starting to seed production data...');

    // Create users
    const users = await createUsers();
    console.log(`Created ${users.length} users`);

    // Create projects and plots
    const projects = await createProjectsAndPlots(users);

    // Create visits
    await createVisits(users, projects);

    // Create announcements
    await createAnnouncements(users);

    // Create tasks
    await createTasks(users, projects);

    // Create attendance
    await createAttendance(users);

    // Create sell requests
    await createSellRequests(users, projects);

    console.log('Seeding completed successfully!');

    // Return credentials for reference
    return users.map((user) => ({
      email: user.email,
      password: user.password,
      role: user.role,
    }));
  } catch (error) {
    console.error('Error seeding production data:', error);
    throw error;
  }
}

// Run the seeding function
seedProductionData()
  .then((_credentials) => {
    console.log('All data seeded successfully!');
    console.log('User credentials:');
    console.table(credentials);
  })
  .catch((error) => {
    console.error('Failed to seed data:', error);
  });
