// Import Firebase
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signOut } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyC0cpqQ2ifoUXFh9CQd8fQSRE0PdV601to',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'plotapp-a9f52.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'plotapp-a9f52',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'plotapp-a9f52.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '64567152996',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:64567152996:web:521e34fcf805acf97aea71',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-LJBPZYD610',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// User roles
const roles = ['guest', 'client', 'manager', 'admin', 'superadmin'];

// Seed users
async function seedUsers() {
  const users = [];

  for (const role of roles) {
    for (let i = 1; i <= 3; i++) {
      const email = `${role}${i}@realestate-app.com`;
      const password = `${role}${i}Pass123!`;
      const displayName = `${role.charAt(0).toUpperCase() + role.slice(1)} User ${i}`;

      try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email,
          displayName,
          role,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isActive: true,
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

// Seed data function for properties
async function seedData() {
  try {
    // Add some sample properties to Firestore
    const projects = [
      {
        id: 'project1',
        name: 'Sunrise Valley',
        location: 'North City',
        totalPlots: 50,
        status: 'active',
        createdAt: serverTimestamp(),
      },
      {
        id: 'project2',
        name: 'Green Meadows',
        location: 'South Hills',
        totalPlots: 75,
        status: 'active',
        createdAt: serverTimestamp(),
      },
    ];

    for (const project of projects) {
      await setDoc(doc(db, 'projects', project.id), project);
      console.log(`Created project: ${project.name}`);
    }

    // Create plots for each project
    for (const project of projects) {
      for (let i = 1; i <= 10; i++) {
        const plotId = `${project.id}-plot${i}`;
        const status = i <= 5 ? 'available' : i <= 8 ? 'booked' : 'sold';

        await setDoc(doc(db, 'plots', plotId), {
          id: plotId,
          projectId: project.id,
          projectName: project.name,
          number: `${i}`,
          status: status,
          size: `${Math.floor(Math.random() * 1000) + 1000} sq ft`,
          price: Math.floor(Math.random() * 50000) + 100000,
          location: `Block ${Math.floor(i / 5) + 1}, Plot ${i % 5 === 0 ? 5 : i % 5}`,
          createdAt: serverTimestamp(),
        });
      }
      console.log(`Created 10 plots for project: ${project.name}`);
    }

    console.log('Sample data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

// Run both seeding functions
async function runSeeding() {
  try {
    console.log('Starting to seed users...');
    const users = await seedUsers();
    console.log('Users created successfully:', users.length);

    console.log('Starting to seed data...');
    await seedData();
    console.log('All data seeded successfully!');
  } catch (error) {
    console.error('Error in seeding process:', error);
  } finally {
    process.exit(0);
  }
}

runSeeding();
