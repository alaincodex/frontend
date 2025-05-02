// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAbJ0gQRSp6QOjRpb3S3qaUeN1ny6OxYJY",
  authDomain: "smartstudyapp-5bffe.firebaseapp.com",
  projectId: "smartstudyapp-5bffe",
  storageBucket: "smartstudyapp-5bffe.firebasestorage.app",
  messagingSenderId: "915956948481",
  appId: "1:915956948481:web:499c156c53e94b609c6a00",
  measurementId: "G-TQRC7NN49C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
