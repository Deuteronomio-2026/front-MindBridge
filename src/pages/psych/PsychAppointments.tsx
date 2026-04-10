import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Calendar, Video, Users, MessageCircle, Clock, Search, Sparkles } from "lucide-react";
import { schedulingService, type SchedulingAppointment } from "../../service/schedulingService";
import { eventService } from "../../service/eventService";
import type { GroupEvent } from "../../types/groupEvent";
import { featureFlags } from "../../config/featureFlags";

const TEAL = "#1A4A5C";
const SAGE = "#4E8B7A";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const MINT = "#A8D5C2";

const modalityMeta = {
  video: { icon: Video, label: "Videollamada", color: TEAL, bg: FOG },
  chat: { icon: MessageCircle, label: "Chat", color: "#0EA5E9", bg: "#F0F9FF" },
  presencial: { icon: Users, label: "Presencial", color: SAGE, bg: "#E8F5F1" },
};

type AgendaStatus = "upcoming" | "completed" | "cancelled";

type AgendaItem =
  | {
      kind: "appointment";
      id: string;
      status: AgendaStatus;
      timestamp: number;
      appointment: SchedulingAppointment;
    }
  | {
      kind: "group-event";
      id: string;
      status: AgendaStatus;
      timestamp: number;
      event: GroupEvent;
    };

const eventStatusToAgendaStatus = (status: GroupEvent["status"]): AgendaStatus => {
  if (status === "FINISHED") return "completed";
  if (status === "CANCELLED") return "cancelled";
  return "upcoming";
};

const eventStatusLabel: Record<GroupEvent["status"], { label: string; bg: string; color: string }> = {
  SCHEDULED: { label: "Evento Programado", bg: FOG, color: TEAL },
  LIVE: { label: "Evento En Vivo", bg: "#E8F5F1", color: SAGE },
  FINISHED: { label: "Evento Finalizado", bg: "#F3F4F6", color: "#4B5563" },
  CANCELLED: { label: "Evento Cancelado", bg: "#FEF2F2", color: "#EF4444" },
};

const formatDateLabel = (dateInput: string) =>
  new Date(dateInput).toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

const formatTimeLabel = (dateInput: string) => {
  const date = new Date(dateInput);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export default function PsychAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<SchedulingAppointment[]>([]);
  const [groupEvents, setGroupEvents] = useState<GroupEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);
      setError(null);

      try {
        const [list, events] = await Promise.all([
          schedulingService.getMyAppointments("PSYCHOLOGIST"),
          featureFlags.groupEvents ? eventService.listPsychologistAgenda().catch(() => []) : Promise.resolve([]),
        ]);

        setAppointments(list);
        setGroupEvents(events);
      } catch {
        setError("No se pudieron cargar tus citas.");
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const filteredAppointments = appointments.filter(
    (a) =>
      a.status === activeTab &&
      String(a.patientName ?? "Paciente").toLowerCase().includes(search.toLowerCase())
  );

  const filteredEvents = featureFlags.groupEvents
    ? groupEvents.filter((event) => {
        const eventTab = eventStatusToAgendaStatus(event.status);
        const searchable = `${event.title} ${event.psychologistName ?? ""}`.toLowerCase();
        return eventTab === activeTab && searchable.includes(search.toLowerCase());
      })
    : [];

  const agendaItems: AgendaItem[] = useMemo(() => {
    const appointmentItems: AgendaItem[] = filteredAppointments.map((appointment) => ({
      kind: "appointment",
      id: appointment.id,
      status: appointment.status,
      timestamp: new Date(`${appointment.date}T${appointment.time}:00`).getTime(),
      appointment,
    }));

    const eventItems: AgendaItem[] = filteredEvents.map((event) => ({
      kind: "group-event",
      id: event.id,
      status: eventStatusToAgendaStatus(event.status),
      timestamp: new Date(event.scheduledStart).getTime(),
      event,
    }));

    return [...appointmentItems, ...eventItems].sort((a, b) => b.timestamp - a.timestamp);
  }, [filteredAppointments, filteredEvents]);

  const eventCounts = {
    upcoming: groupEvents.filter((event) => eventStatusToAgendaStatus(event.status) === "upcoming").length,
    completed: groupEvents.filter((event) => eventStatusToAgendaStatus(event.status) === "completed").length,
    cancelled: groupEvents.filter((event) => eventStatusToAgendaStatus(event.status) === "cancelled").length,
  };

  const counts = {
    upcoming: appointments.filter((a) => a.status === "upcoming").length + (featureFlags.groupEvents ? eventCounts.upcoming : 0),
    completed: appointments.filter((a) => a.status === "completed").length + (featureFlags.groupEvents ? eventCounts.completed : 0),
    cancelled: appointments.filter((a) => a.status === "cancelled").length + (featureFlags.groupEvents ? eventCounts.cancelled : 0),
  };

  const totalItems = appointments.length + (featureFlags.groupEvents ? groupEvents.length : 0);

  return (
    <div className="min-h-screen" style={{ background: FOG }}>
      <div style={{ background: `linear-gradient(135deg, #0D2E38 0%, ${TEAL} 100%)` }} className="py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-white" style={{ fontWeight: 800, fontSize: "1.8rem" }}>Mis Citas</h1>
          <p style={{ color: MINT, fontSize: "0.9rem", marginTop: 4 }}>Gestiona todas tus sesiones</p>

          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { label: "Próximas", count: counts.upcoming },
              { label: "Completadas", count: counts.completed },
              { label: "Total", count: totalItems },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 rounded-xl p-3 text-center">
                <p className="text-white" style={{ fontWeight: 800, fontSize: "1.5rem" }}>{s.count}</p>
                <p style={{ color: MINT, fontSize: "0.75rem" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700" style={{ fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-3 bg-white rounded-xl px-4 shadow-sm border mb-5" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
          <Search size={17} className="text-slate-400" />
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 py-3 bg-transparent outline-none"
            style={{ fontSize: "0.9rem", color: "#2d4a5a" }}
          />
        </div>

        {/* Tabs */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm border mb-6" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
          {(["upcoming", "completed", "cancelled"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all"
              style={{
                background: activeTab === tab ? TEAL : "transparent",
                color: activeTab === tab ? "white" : "#6a8a9a",
                fontWeight: activeTab === tab ? 700 : 500,
                fontSize: "0.875rem",
              }}
            >
              {{ upcoming: "Próximas", completed: "Completadas", cancelled: "Canceladas" }[tab]}
              <span
                className="px-1.5 py-0.5 rounded-full"
                style={{
                  background: activeTab === tab ? "rgba(255,255,255,0.2)" : FOG,
                  color: activeTab === tab ? "white" : "#6a8a9a",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                }}
              >
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Appointment and group event list */}
        {loading ? (
          <div className="text-center py-14 bg-white rounded-2xl border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
            <p className="text-slate-500" style={{ fontWeight: 600 }}>Cargando citas...</p>
          </div>
        ) : agendaItems.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
            <Calendar size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500" style={{ fontWeight: 600 }}>No hay citas en esta categoría</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {agendaItems.map((item) => {
              if (item.kind === "appointment") {
                const apt = item.appointment;
                const meta = modalityMeta[apt.modality];
                const Icon = meta.icon;

                return (
                  <div key={`apt-${apt.id}`} className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
                    <div className="flex items-start gap-4">
                      <img src={apt.patientPhoto || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"} alt={apt.patientName || "Paciente"} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-slate-900" style={{ fontWeight: 700, fontSize: "0.95rem" }}>{apt.patientName || "Paciente"}</p>
                            <p style={{ color: TEAL, fontSize: "0.8rem" }}>{apt.specialty}</p>
                          </div>
                          <span
                            className="px-2.5 py-1 rounded-full flex-shrink-0"
                            style={{
                              background: apt.status === "completed" ? "#E8F5F1" : apt.status === "upcoming" ? FOG : "#FEF2F2",
                              color: apt.status === "completed" ? SAGE : apt.status === "upcoming" ? TEAL : "#EF4444",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            {apt.status === "completed" ? "Completada" : apt.status === "upcoming" ? "Próxima" : "Cancelada"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <div className="flex items-center gap-1.5 text-slate-400" style={{ fontSize: "0.8rem" }}>
                            <Calendar size={12} />
                            <span>{formatDateLabel(`${apt.date}T00:00:00`)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400" style={{ fontSize: "0.8rem" }}>
                            <Clock size={12} />
                            <span>{apt.time} hrs</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color, fontSize: "0.75rem", fontWeight: 500 }}>
                            <Icon size={11} />
                            {meta.label}
                          </div>
                          <div className="ml-auto" style={{ color: CORAL, fontWeight: 700, fontSize: "0.9rem" }}>
                            ${apt.price}
                          </div>
                        </div>
                      </div>
                    </div>
                    {apt.status === "upcoming" && (
                      <div className="mt-3 pt-3 border-t flex gap-2" style={{ borderColor: "rgba(26,74,92,0.07)" }}>
                        {apt.modality === "video" || apt.modality === "chat" ? (
                          <button
                            onClick={() => navigate(`/panel-psicologo/chat/${apt.id}`)}
                            className="flex-1 py-2.5 rounded-xl text-white flex items-center justify-center gap-1.5 transition-colors"
                            style={{ background: TEAL, fontWeight: 600, fontSize: "0.82rem" }}
                          >
                            <Icon size={14} />
                            {apt.modality === "video" ? "Iniciar videollamada" : "Abrir chat"}
                          </button>
                        ) : (
                          <div
                            className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                            style={{ background: "#F1F5F9", color: "#64748B", fontWeight: 600, fontSize: "0.82rem" }}
                          >
                            <Users size={14} />
                            Cita presencial
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              const event = item.event;
              const badge = eventStatusLabel[event.status];
              return (
                <div key={`evt-${event.id}`} className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-slate-900" style={{ fontWeight: 700, fontSize: "0.95rem" }}>{event.title}</p>
                      <p className="mt-1" style={{ color: "#475569", fontSize: "0.8rem" }}>{event.description}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: badge.bg, color: badge.color, fontSize: "0.73rem", fontWeight: 700 }}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <div className="flex items-center gap-1.5 text-slate-400" style={{ fontSize: "0.8rem" }}>
                      <Calendar size={12} />
                      <span>{formatDateLabel(event.scheduledStart)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400" style={{ fontSize: "0.8rem" }}>
                      <Clock size={12} />
                      <span>{formatTimeLabel(event.scheduledStart)} hrs</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ background: "#FFF7ED", color: "#C2410C", fontSize: "0.75rem", fontWeight: 600 }}>
                      <Sparkles size={11} />
                      Cita especial grupal
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ background: FOG, color: TEAL, fontSize: "0.75rem", fontWeight: 600 }}>
                      <Users size={11} />
                      {event.enrolledCount}/{event.capacity}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
