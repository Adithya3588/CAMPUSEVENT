// Firebase Admin SDK Configuration
const admin = require("firebase-admin");

// Initialize Firebase Admin with default credentials
// In production, use a service account key file
const initializeFirebase = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: "college-event-system-88e9b",
    });
  }
  return admin;
};

const getFirestore = () => {
  initializeFirebase();
  return admin.firestore();
};

const getAuth = () => {
  initializeFirebase();
  return admin.auth();
};

module.exports = {
  initializeFirebase,
  getFirestore,
  getAuth,
  admin,
};
