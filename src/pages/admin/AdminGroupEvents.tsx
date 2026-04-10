import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Calendar, Loader2, PlayCircle, Plus, StopCircle, Users, XCircle } from "lucide-react";
import { eventService } from "../../service/eventService";
import type { CreateGroupEventRequest, GroupEvent } from "../../types/groupEvent";
import { featureFlags } from "../../config/featureFlags";

const TEAL = "#1A4A5C";
const CORAL = "#E8856A";
const SAGE = "#4E8B7A";
const FOG = "#EEF4F7";

const defaultFormState: CreateGroupEventRequest = {
  title: "",
  description: "",
  psychologistId: "",
  scheduledStart: "",
  scheduledEnd: "",
  capacity: 30,
  audience: "ALL_PATIENTS",
};

const statusLabel: Record<GroupEvent["status"], { label: string; bg: string; color: string }> = {
  SCHEDULED: { label: "Programado", bg: "#E8F2F7", color: TEAL },
  LIVE: { label: "En vivo", bg: "#E8F7EE", color: SAGE },
  FINISHED: { label: "Finalizado", bg: "#F3F4F6", color: "#4B5563" },
  CANCELLED: { label: "Cancelado", bg: "#FEF2F2", color: "#DC2626" },
};

function toLocalDatetimeInput(isoValue?: string): string {
  if (!isoValue) {
    return "";
  }

  const date = new Date(isoValue);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

function fromLocalDatetimeInput(value: string): string {
  if (!value) {
    return "";
  }
  return new Date(value).toISOString();
}

export default function AdminGroupEvents() {
  const [events, setEvents] = useState<GroupEvent[]>([]);
  const [formState, setFormState] = useState<CreateGroupEventRequest>(defaultFormState);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await eventService.listEvents();
      setEvents(response);
    } catch {
      setError("No se pudieron cargar los eventos grupales. Verifica que EventService esté disponible.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(b.scheduledStart).getTime() - new Date(a.scheduledStart).getTime());
  }, [events]);

  const resetSuccess = () => {
    if (!success) {
      return;
    }

    setTimeout(() => setSuccess(null), 3000);
  };

  useEffect(() => {
    resetSuccess();
  }, [success]);

  const onChangeField = <K extends keyof CreateGroupEventRequest>(field: K, value: CreateGroupEventRequest[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!formState.title.trim()) return "El título es obligatorio.";
    if (!formState.description.trim()) return "La descripción es obligatoria.";
    if (!formState.psychologistId.trim()) return "El ID del psicólogo es obligatorio.";
    if (!formState.scheduledStart) return "La fecha de inicio es obligatoria.";
    if (!formState.scheduledEnd) return "La fecha de fin es obligatoria.";
    if (new Date(formState.scheduledEnd).getTime() <= new Date(formState.scheduledStart).getTime()) {
      return "La fecha de fin debe ser posterior al inicio.";
    }
    if (formState.capacity < 2) return "La capacidad mínima es 2.";
    return null;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await eventService.createEvent(formState);
      setSuccess("Evento grupal creado correctamente.");
      setFormState(defaultFormState);
      await loadEvents();
    } catch {
      setError("No se pudo crear el evento grupal.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusAction = async (eventId: string, action: "start" | "finish" | "cancel") => {
    setError(null);

    try {
      if (action === "start") {
        await eventService.startEvent(eventId);
        setSuccess("Evento iniciado.");
      }

      if (action === "finish") {
        await eventService.finishEvent(eventId);
        setSuccess("Evento finalizado.");
      }

      if (action === "cancel") {
        await eventService.cancelEvent(eventId);
        setSuccess("Evento cancelado.");
      }

      await loadEvents();
    } catch {
      setError("No se pudo actualizar el estado del evento.");
    }
  };

  if (!featureFlags.groupEvents) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: FOG }}>
        <div className="max-w-xl rounded-2xl border bg-white p-6 text-center" style={{ borderColor: "rgba(26,74,92,0.12)" }}>
          <p style={{ color: TEAL, fontWeight: 800, fontSize: "1.1rem" }}>Eventos grupales desactivados</p>
          <p className="mt-2" style={{ color: "#475569", fontSize: "0.9rem" }}>
            Activa la variable VITE_FEATURE_GROUP_EVENTS=true para habilitar este módulo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: FOG }}>
      <div style={{ background: `linear-gradient(135deg, #0D2E38 0%, ${TEAL} 100%)` }} className="py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-white" style={{ fontWeight: 800, fontSize: "1.8rem" }}>Eventos Grupales</h1>
          <p className="mt-1" style={{ color: "#A8D5C2", fontSize: "0.9rem" }}>
            Crea, inicia y administra sesiones grupales sin afectar las citas individuales existentes.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {error && (
          <div className="rounded-xl border px-4 py-3 flex items-center gap-2" style={{ borderColor: "#FECACA", background: "#FEF2F2", color: "#B91C1C" }}>
            <AlertCircle size={16} />
            <span style={{ fontSize: "0.86rem", fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {success && (
          <div className="rounded-xl border px-4 py-3" style={{ borderColor: "#BBF7D0", background: "#F0FDF4", color: "#166534" }}>
            <span style={{ fontSize: "0.86rem", fontWeight: 600 }}>{success}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Plus size={18} style={{ color: TEAL }} />
            <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "#0F172A" }}>Crear evento grupal</h2>
          </div>

          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block mb-1.5" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>Título</label>
              <input
                value={formState.title}
                onChange={(e) => onChangeField("title", e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none"
                style={{ borderColor: "rgba(26,74,92,0.2)", fontSize: "0.88rem" }}
                placeholder="Sesión grupal de manejo de ansiedad"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1.5" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>Descripción</label>
              <textarea
                value={formState.description}
                onChange={(e) => onChangeField("description", e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none resize-none"
                style={{ borderColor: "rgba(26,74,92,0.2)", fontSize: "0.88rem" }}
                rows={3}
                placeholder="Sesión guiada para pacientes con estrategias prácticas."
              />
            </div>

            <div>
              <label className="block mb-1.5" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>ID Psicólogo</label>
              <input
                value={formState.psychologistId}
                onChange={(e) => onChangeField("psychologistId", e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none"
                style={{ borderColor: "rgba(26,74,92,0.2)", fontSize: "0.88rem" }}
                placeholder="uuid-psicologo"
              />
            </div>

            <div>
              <label className="block mb-1.5" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>Capacidad</label>
              <input
                type="number"
                min={2}
                max={500}
                value={formState.capacity}
                onChange={(e) => onChangeField("capacity", Number(e.target.value))}
                className="w-full rounded-xl border px-4 py-3 outline-none"
                style={{ borderColor: "rgba(26,74,92,0.2)", fontSize: "0.88rem" }}
              />
            </div>

            <div>
              <label className="block mb-1.5" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>Inicio</label>
              <input
                type="datetime-local"
                value={toLocalDatetimeInput(formState.scheduledStart)}
                onChange={(e) => onChangeField("scheduledStart", fromLocalDatetimeInput(e.target.value))}
                className="w-full rounded-xl border px-4 py-3 outline-none"
                style={{ borderColor: "rgba(26,74,92,0.2)", fontSize: "0.88rem" }}
              />
            </div>

            <div>
              <label className="block mb-1.5" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>Fin</label>
              <input
                type="datetime-local"
                value={toLocalDatetimeInput(formState.scheduledEnd)}
                onChange={(e) => onChangeField("scheduledEnd", fromLocalDatetimeInput(e.target.value))}
                className="w-full rounded-xl border px-4 py-3 outline-none"
                style={{ borderColor: "rgba(26,74,92,0.2)", fontSize: "0.88rem" }}
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl text-white flex items-center gap-2"
                style={{ background: TEAL, fontWeight: 700, fontSize: "0.86rem", opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                Crear evento
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
          <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
            <Calendar size={17} style={{ color: TEAL }} />
            <h2 style={{ fontWeight: 700, fontSize: "1rem", color: "#0F172A" }}>Eventos creados</h2>
          </div>

          {loading ? (
            <div className="px-6 py-10 text-center text-slate-500" style={{ fontSize: "0.9rem" }}>Cargando eventos...</div>
          ) : sortedEvents.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-500" style={{ fontSize: "0.9rem" }}>
              No hay eventos todavía.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sortedEvents.map((event) => {
                const status = statusLabel[event.status];
                return (
                  <div key={event.id} className="px-6 py-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A" }}>{event.title}</p>
                        <p style={{ fontSize: "0.82rem", color: "#475569", marginTop: 4 }}>{event.description}</p>
                        <p style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 8 }}>
                          {new Date(event.scheduledStart).toLocaleString("es-CO")} - {new Date(event.scheduledEnd).toLocaleString("es-CO")}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full" style={{ background: status.bg, color: status.color, fontSize: "0.73rem", fontWeight: 700 }}>
                        {status.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: FOG, color: TEAL, fontSize: "0.72rem", fontWeight: 600 }}>
                        <Users size={12} /> {event.enrolledCount}/{event.capacity}
                      </span>

                      {event.status === "SCHEDULED" && (
                        <>
                          <button
                            onClick={() => void handleStatusAction(event.id, "start")}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-white"
                            style={{ background: SAGE, fontSize: "0.75rem", fontWeight: 700 }}
                          >
                            <PlayCircle size={13} /> Iniciar
                          </button>
                          <button
                            onClick={() => void handleStatusAction(event.id, "cancel")}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-white"
                            style={{ background: CORAL, fontSize: "0.75rem", fontWeight: 700 }}
                          >
                            <XCircle size={13} /> Cancelar
                          </button>
                        </>
                      )}

                      {event.status === "LIVE" && (
                        <button
                          onClick={() => void handleStatusAction(event.id, "finish")}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-white"
                          style={{ background: TEAL, fontSize: "0.75rem", fontWeight: 700 }}
                        >
                          <StopCircle size={13} /> Finalizar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
