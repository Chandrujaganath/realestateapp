import { auth, db } from "../lib/firebase"
import { createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { httpsCallable } from "firebase/functions"
import { functions } from "../lib/firebase"

// User roles
const roles = ["guest", "client", "manager", "admin", "superadmin"]

// Function to set custom claims (requires Firebase Admin SDK on the server)
const setCustomUserClaim = httpsCallable(functions, "setCustomUserClaim")

// Generate users for each role
async function seedUsers() {
  const users = []

  for (const role of roles) {
    for (let i = 1; i <= 5; i++) {
      const email = `${role}${i}@realestate-app.com`
      const password = `${role}${i}Pass123!`
      const displayName = `${role.charAt(0).toUpperCase() + role.slice(1)} User ${i}`

      try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Update profile with display name
        await updateProfile(user, { displayName })

        // Set custom claim for role
        await setCustomUserClaim({ uid: user.uid, role })

        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
          email,
          displayName,
          role,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isActive: true,
          phoneNumber: "",
          address: "",
          profileImageUrl: "",
        })

        // Add to users array
        users.push({
          email,
          password,
          role,
          displayName,
          uid: user.uid,
        })

        console.log(`Created ${role} user: ${email}`)

        // Sign out after creating user
        await signOut(auth)
      } catch (error) {
        console.error(`Error creating ${role} user ${i}:`, error)
      }
    }
  }

  return users
}

// Run the seed function
seedUsers()
  .then((users) => {
    console.log("All users created successfully:")
    console.table(users)
  })
  .catch((error) => {
    console.error("Error seeding users:", error)
  })

