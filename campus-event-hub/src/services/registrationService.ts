// Registration operations using Firestore

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Registration {
  registrationId?: string;
  userId: string;
  eventId: string;
  registeredAt: string;
}

const REGISTRATIONS = "registrations";

// Register for an event
export const registerForEvent = async (userId: string, eventId: string) => {
  // Check if already registered
  const existing = await getDocs(
    query(collection(db, REGISTRATIONS), where("userId", "==", userId), where("eventId", "==", eventId))
  );
  if (!existing.empty) throw new Error("Already registered for this event");

  const ref = await addDoc(collection(db, REGISTRATIONS), {
    userId,
    eventId,
    registeredAt: Timestamp.now().toDate().toISOString(),
  });
  return ref.id;
};

// Get registrations by event (admin view)
export const getRegistrationsByEvent = async (eventId: string): Promise<Registration[]> => {
  const q = query(collection(db, REGISTRATIONS), where("eventId", "==", eventId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ registrationId: d.id, ...d.data() } as Registration));
};

// Get registrations by user (student view)
export const getRegistrationsByUser = async (userId: string): Promise<Registration[]> => {
  const q = query(collection(db, REGISTRATIONS), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ registrationId: d.id, ...d.data() } as Registration));
};

// Unregister from an event
export const unregisterFromEvent = async (registrationId: string) => {
  await deleteDoc(doc(db, REGISTRATIONS, registrationId));
};
