import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import { EventData, getAllEvents, getEventById } from "@/services/eventService";
import { registerForEvent, getRegistrationsByUser, Registration } from "@/services/registrationService";
import { Calendar, CheckCircle, X, MapPin, CalendarDays } from "lucide-react";
import { toast } from "sonner";

const StudentDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [events, setEvents] = useState<EventData[]>([]);
  const [myRegs, setMyRegs] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "my">("all");

  // Event detail modal
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [registering, setRegistering] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [evts, regs] = await Promise.all([
      getAllEvents(),
      getRegistrationsByUser(userProfile!.userId),
    ]);
    setEvents(evts);
    setMyRegs(regs);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const isRegistered = (eventId: string) => myRegs.some((r) => r.eventId === eventId);

  const handleViewDetails = async (id: string) => {
    const ev = await getEventById(id);
    if (ev) setSelectedEvent(ev);
  };

  const handleRegister = async (eventId: string) => {
    setRegistering(true);
    try {
      await registerForEvent(userProfile!.userId, eventId);
      toast.success("Successfully registered!");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    }
    setRegistering(false);
    setSelectedEvent(null);
  };

  const myEventIds = myRegs.map((r) => r.eventId);
  const myEvents = events.filter((e) => myEventIds.includes(e.eventId!));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Welcome, {userProfile?.name}!</h1>
          <p className="text-muted-foreground">Discover and register for campus events</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg bg-secondary p-1 w-fit">
          <button
            onClick={() => setTab("all")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            onClick={() => setTab("my")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === "my" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Registrations ({myEvents.length})
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          </div>
        ) : (
          <>
            {tab === "all" && (
              events.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                  <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-lg font-medium text-foreground">No events available</p>
                  <p className="text-muted-foreground">Check back later for new events</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {events.map((ev) => (
                    <div key={ev.eventId} className="relative">
                      {isRegistered(ev.eventId!) && (
                        <div className="absolute -top-2 -right-2 z-10 rounded-full bg-success p-1">
                          <CheckCircle className="h-4 w-4 text-success-foreground" />
                        </div>
                      )}
                      <EventCard event={ev} onView={handleViewDetails} />
                    </div>
                  ))}
                </div>
              )
            )}

            {tab === "my" && (
              myEvents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                  <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-lg font-medium text-foreground">No registrations yet</p>
                  <p className="text-muted-foreground">Browse all events to register</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {myEvents.map((ev) => (
                    <EventCard key={ev.eventId} event={ev} onView={handleViewDetails} />
                  ))}
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-card-hover">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-xl font-bold text-card-foreground">{selectedEvent.title}</h2>
              <button onClick={() => setSelectedEvent(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-muted-foreground">{selectedEvent.description}</p>

            <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4 text-accent" />
                {new Date(selectedEvent.date).toLocaleDateString("en-US", {
                  weekday: "long", month: "long", day: "numeric", year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-accent" />
                {selectedEvent.venue}
              </span>
            </div>

            {isRegistered(selectedEvent.eventId!) ? (
              <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 p-3 text-sm text-success">
                <CheckCircle className="h-5 w-5" />
                You are already registered for this event
              </div>
            ) : (
              <button
                onClick={() => handleRegister(selectedEvent.eventId!)}
                disabled={registering}
                className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {registering ? "Registering..." : "Register for this Event"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
