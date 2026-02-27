import React from "react";
import { EventData } from "@/services/eventService";
import { MapPin, CalendarDays } from "lucide-react";

interface Props {
  event: EventData;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

const EventCard: React.FC<Props> = ({ event, onView, onEdit, onDelete, isAdmin }) => {
  const dateStr = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isPast = new Date(event.date) < new Date();

  return (
    <div className="group rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:gradient-card-hover">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-lg font-semibold text-card-foreground group-hover:text-accent transition-colors">
          {event.title}
        </h3>
        {isPast && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Past
          </span>
        )}
      </div>

      <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>

      <div className="mb-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <CalendarDays className="h-4 w-4 text-accent" />
          {dateStr}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-4 w-4 text-accent" />
          {event.venue}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView(event.eventId!)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          View Details
        </button>
        {isAdmin && onEdit && (
          <button
            onClick={() => onEdit(event.eventId!)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Edit
          </button>
        )}
        {isAdmin && onDelete && (
          <button
            onClick={() => onDelete(event.eventId!)}
            className="rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard;
