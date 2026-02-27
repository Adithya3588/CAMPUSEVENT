// Event CRUD operations using Firestore

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface EventData {
  eventId?: string;
  title: string;
  description: string;
  date: string; // ISO string
  venue: string;
  createdBy: string; // adminId
}

const EVENTS = "events";

// Create a new event (admin only)
export const createEvent = async (event: Omit<EventData, "eventId">) => {
  const ref = await addDoc(collection(db, EVENTS), {
    ...event,
    createdAt: Timestamp.now(),
  });
  return ref.id;
};

// Get all events
export const getAllEvents = async (): Promise<EventData[]> => {
  const q = query(collection(db, EVENTS), orderBy("date", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ eventId: d.id, ...d.data() } as EventData));
};

// Get single event by ID
export const getEventById = async (id: string): Promise<EventData | null> => {
  const snap = await getDoc(doc(db, EVENTS, id));
  if (!snap.exists()) return null;
  return { eventId: snap.id, ...snap.data() } as EventData;
};

// Update an event (admin only)
export const updateEvent = async (id: string, data: Partial<EventData>) => {
  await updateDoc(doc(db, EVENTS, id), data);
};

// Delete an event (admin only)
export const deleteEvent = async (id: string) => {
  await deleteDoc(doc(db, EVENTS, id));
};
