// Registration routes
const express = require("express");
const router = express.Router();
const { getFirestore } = require("../config/firebase");
const { verifyToken } = require("../middleware/auth");

const REGISTRATIONS = "registrations";

// GET registrations by event (requires auth)
router.get("/event/:eventId", verifyToken, async (req, res) => {
  try {
    const db = getFirestore();
    const snapshot = await db
      .collection(REGISTRATIONS)
      .where("eventId", "==", req.params.eventId)
      .get();

    const registrations = snapshot.docs.map((doc) => ({
      registrationId: doc.id,
      ...doc.data(),
    }));

    console.log(`Fetched ${registrations.length} registrations for event ${req.params.eventId}`);
    res.json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error.message);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

// GET registrations by user (requires auth)
router.get("/user/:userId", verifyToken, async (req, res) => {
  try {
    // Only allow users to see their own registrations
    if (req.user.uid !== req.params.userId) {
      return res.status(403).json({ error: "Forbidden: Cannot view other users' registrations" });
    }

    const db = getFirestore();
    const snapshot = await db
      .collection(REGISTRATIONS)
      .where("userId", "==", req.params.userId)
      .get();

    const registrations = snapshot.docs.map((doc) => ({
      registrationId: doc.id,
      ...doc.data(),
    }));

    console.log(`Fetched ${registrations.length} registrations for user ${req.params.userId}`);
    res.json(registrations);
  } catch (error) {
    console.error("Error fetching user registrations:", error.message);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

// GET my registrations (current user)
router.get("/my", verifyToken, async (req, res) => {
  try {
    const db = getFirestore();
    const snapshot = await db
      .collection(REGISTRATIONS)
      .where("userId", "==", req.user.uid)
      .get();

    const registrations = snapshot.docs.map((doc) => ({
      registrationId: doc.id,
      ...doc.data(),
    }));

    console.log(`Fetched ${registrations.length} registrations for current user`);
    res.json(registrations);
  } catch (error) {
    console.error("Error fetching my registrations:", error.message);
    res.status(500).json({ error: "Failed to fetch registrations" });
  }
});

// POST register for event (requires auth)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.uid;

    if (!eventId) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    const db = getFirestore();

    // Check if already registered
    const existingSnapshot = await db
      .collection(REGISTRATIONS)
      .where("userId", "==", userId)
      .where("eventId", "==", eventId)
      .get();

    if (!existingSnapshot.empty) {
      return res.status(409).json({ error: "Already registered for this event" });
    }

    // Check if event exists
    const eventDoc = await db.collection("events").doc(eventId).get();
    if (!eventDoc.exists) {
      return res.status(404).json({ error: "Event not found" });
    }

    const registrationData = {
      userId,
      eventId,
      registeredAt: new Date().toISOString(),
    };

    const docRef = await db.collection(REGISTRATIONS).add(registrationData);

    console.log(`User ${userId} registered for event ${eventId}`);
    res.status(201).json({ registrationId: docRef.id, ...registrationData });
  } catch (error) {
    console.error("Error creating registration:", error.message);
    res.status(500).json({ error: "Failed to register for event" });
  }
});

// DELETE unregister from event (requires auth)
router.delete("/:registrationId", verifyToken, async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection(REGISTRATIONS).doc(req.params.registrationId);

    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Registration not found" });
    }

    // Only allow users to delete their own registrations
    if (doc.data().userId !== req.user.uid) {
      return res.status(403).json({ error: "Forbidden: Cannot delete other users' registrations" });
    }

    await docRef.delete();

    console.log(`Deleted registration: ${req.params.registrationId}`);
    res.json({ message: "Successfully unregistered from event" });
  } catch (error) {
    console.error("Error deleting registration:", error.message);
    res.status(500).json({ error: "Failed to unregister from event" });
  }
});

module.exports = router;
