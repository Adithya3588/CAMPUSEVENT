import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import EventForm from "@/components/EventForm";
import { EventData, getAllEvents, createEvent, updateEvent, deleteEvent, getEventById } from "@/services/eventService";
import { getRegistrationsByEvent, Registration } from "@/services/registrationService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Users, Calendar, RefreshCw } from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | undefined>();
  const [formLoading, setFormLoading] = useState(false);

  // Registration viewer state
  const [viewingRegs, setViewingRegs] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<(Registration & { userName?: string; userEmail?: string })[]>([]);
  const [regsLoading, setRegsLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    const data = await getAllEvents();
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleCreate = async (data: Omit<EventData, "eventId" | "createdBy">) => {
    setFormLoading(true);
    await createEvent({ ...data, createdBy: userProfile!.userId });
    setFormLoading(false);
    setShowForm(false);
    fetchEvents();
  };

  const handleEdit = async (id: string) => {
    const ev = await getEventById(id);
    if (ev) {
      setEditingEvent(ev);
      setShowForm(true);
    }
  };

  const handleUpdate = async (data: Omit<EventData, "eventId" | "createdBy">) => {
    if (!editingEvent?.eventId) return;
    setFormLoading(true);
    await updateEvent(editingEvent.eventId, data);
    setFormLoading(false);
    setShowForm(false);
    setEditingEvent(undefined);
    fetchEvents();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await deleteEvent(id);
    fetchEvents();
  };

  const handleViewRegistrations = async (eventId: string) => {
    setViewingRegs(eventId);
    setRegsLoading(true);
    const regs = await getRegistrationsByEvent(eventId);
    // Enrich with user info
    const enriched = await Promise.all(
      regs.map(async (r) => {
        const userSnap = await getDoc(doc(db, "users", r.userId));
        const userData = userSnap.exists() ? userSnap.data() : {};
        return { ...r, userName: userData.name || "Unknown", userEmail: userData.email || "" };
      })
    );
    setRegistrations(enriched);
    setRegsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage campus events and registrations</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchEvents}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <button
              onClick={() => { setEditingEvent(undefined); setShowForm(true); }}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-colors"
            >
              <Plus className="h-4 w-4" /> New Event
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent/10 p-2"><Calendar className="h-5 w-5 text-accent" /></div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{events.length}</p>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2"><Calendar className="h-5 w-5 text-success" /></div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">
                  {events.filter(e => new Date(e.date) >= new Date()).length}
                </p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2"><Users className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">
                  {events.filter(e => new Date(e.date) < new Date()).length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Events grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">No events yet</p>
            <p className="text-muted-foreground">Create your first event to get started</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => (
              <EventCard
                key={ev.eventId}
                event={ev}
                isAdmin
                onView={handleViewRegistrations}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Event Form Modal */}
      {showForm && (
        <EventForm
          initial={editingEvent}
          onSubmit={editingEvent ? handleUpdate : handleCreate}
          onCancel={() => { setShowForm(false); setEditingEvent(undefined); }}
          loading={formLoading}
        />
      )}

      {/* Registrations Modal */}
      {viewingRegs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-card-hover">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-card-foreground">Registrations</h2>
              <button onClick={() => setViewingRegs(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            {regsLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-accent border-t-transparent" />
              </div>
            ) : registrations.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No registrations yet</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {registrations.map((r) => (
                  <div key={r.registrationId} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.userName}</p>
                      <p className="text-xs text-muted-foreground">{r.userEmail}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.registeredAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
