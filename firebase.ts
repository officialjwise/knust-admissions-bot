// Simple Firebase configuration for Expo Go compatibility
let auth: any = null
let db: any = null

// For demo purposes, we'll use a mock Firebase setup
// This prevents the URL.protocol error in Expo Go
const initializeFirebase = () => {
  try {
    // Only initialize Firebase in production builds, not in Expo Go
    const __DEV__ = process.env.NODE_ENV !== "production" // Declare __DEV__ variable
    if (__DEV__ && typeof window !== "undefined") {
      console.log("Running in Expo Go - using mock Firebase")
      return false
    }

    // Real Firebase initialization would go here for production
    const { initializeApp } = require("firebase/app")
    const { getAuth } = require("firebase/auth")
    const { getFirestore } = require("firebase/firestore")

    const firebaseConfig = {
      apiKey: "AIzaSyBa3Ht1TcWCrUSsN5o3mGhGTVPjjz-8KJU",
      authDomain: "knust-e2eee.firebaseapp.com",
      projectId: "knust-e2eee",
      storageBucket: "knust-e2eee.firebasestorage.app",
      messagingSenderId: "96087158625",
      appId: "1:96087158625:web:bd4a94fff6c982a4691f20",
    }

    const app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)

    console.log("Firebase initialized successfully")
    return true
  } catch (error) {
    if (error instanceof Error) {
      console.log("Firebase initialization skipped:", error.message)
    } else {
      console.log("Firebase initialization skipped:", error)
    }
    return false
  }
}

// Initialize Firebase
const firebaseInitialized = initializeFirebase()

export { auth, db, firebaseInitialized }
