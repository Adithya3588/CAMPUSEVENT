// Event routes
const express = require("express");
const router = express.Router();
const { getFirestore } = require("../config/firebase");
const { verifyToken, optionalAuth } = require("../middleware/auth");

const EVENTS = "events";

// GET all events (public)
router.get("/", optionalAuth, async (req, res) => {
  try {
    const db = getFirestore();
    const snapshot = await db
      .collection(EVENTS)
      .orderBy("date", "asc")
      .get();

    const events = snapshot.docs.map((doc) => ({
      eventId: doc.id,
      ...doc.data(),
    }));

    console.log(`Fetched ${events.length} events`);
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error.message);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// GET single event by ID (public)
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const db = getFirestore();
    const doc = await db.collection(EVENTS).doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ eventId: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching event:", error.message);
    res.status(500).json({ error: "Failed to fetch event" });
  }
});

// POST create new event (requires auth)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description, date, venue } = req.body;

    if (!title || !description || !date || !venue) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = getFirestore();
    const eventData = {
      title,
      description,
      date,
      venue,
      createdBy: req.user.uid,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection(EVENTS).add(eventData);

    console.log(`Created event: ${docRef.id}`);
    res.status(201).json({ eventId: docRef.id, ...eventData });
  } catch (error) {
    console.error("Error creating event:", error.message);
    res.status(500).json({ error: "Failed to create event" });
  }
});

// PUT update event (requires auth)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { title, description, date, venue } = req.body;
    const db = getFirestore();
    const docRef = db.collection(EVENTS).doc(req.params.id);

    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Event not found" });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (date) updateData.date = date;
    if (venue) updateData.venue = venue;
    updateData.updatedAt = new Date().toISOString();

    await docRef.update(updateData);

    console.log(`Updated event: ${req.params.id}`);
    res.json({ eventId: req.params.id, ...doc.data(), ...updateData });
  } catch (error) {
    console.error("Error updating event:", error.message);
    res.status(500).json({ error: "Failed to update event" });
  }
});

// DELETE event (requires auth)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = db.collection(EVENTS).doc(req.params.id);

    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Event not found" });
    }

    await docRef.delete();

    console.log(`Deleted event: ${req.params.id}`);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error.message);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

module.exports = router;
