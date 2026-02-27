// Firebase configuration for College Event System

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB_iPbNioUrUSCQZ89tWMRQCeqhOEEOj0k",
  authDomain: "college-event-system-88e9b.firebaseapp.com",
  projectId: "college-event-system-88e9b",
  storageBucket: "college-event-system-88e9b.firebasestorage.app",
  messagingSenderId: "1076756826242",
  appId: "1:1076756826242:web:12690b38e4cdd08c46cc9b",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
