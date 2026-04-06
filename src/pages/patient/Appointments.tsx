import { useState } from "react";
import { useNavigate } from "react-router";
import { Calendar, Video, Users, MessageCircle, Clock, XCircle, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { useUser } from "../../hooks/useUser";
import type { Appointment } from "../../types/user";

const TEAL = "#1A4A5C";
const SAGE = "#4E8B7A";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const SAND = "#F5EDD8";

const modalityIcons = {
  video: Video,
  presencial: Users,
  chat: MessageCircle,
};

const modalityColors = {
  video: { color: TEAL, bg: FOG, label: "Videollamada" },
  presencial: { color: SAGE, bg: "#E8F5F1", label: "Presencial" },
  chat: { color: "#0EA5E9", bg: "#F0F9FF", label: "Chat" },
};

const statusConfig = {
  upcoming: {
    label: "Próxima",
    icon: Clock,
    style: { background: "#EAF2F5", color: TEAL },
  },
  completed: {
    label: "Completada",
    icon: CheckCircle,
    style: { background: "#E8F5F1", color: SAGE },
  },
  cancelled: {
    label: "Cancelada",
    icon: XCircle,
    style: { background: "#FEF2F2", color: "#EF4444" },
  },
};

function AppointmentCard({ appointment, onCancel }: { appointment: Appointment; onCancel: (id: string) => void }) {
  const navigate = useNavigate();
  const [showCancel, setShowCancel] = useState(false);
  const modality = modalityColors[appointment.modality];
  const ModalityIcon = modalityIcons[appointment.modality];
  const status = statusConfig[appointment.status];
  const StatusIcon = status.icon;

  const formattedDate = new Date(appointment.date + "T00:00:00").toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const capitalizeFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div
      className="bg-white rounded-2xl p-5 shadow-sm border"
      style={{
        borderColor: appointment.status === "cancelled" ? "#FEE2E2" : "rgba(26,74,92,0.1)",
        opacity: appointment.status === "cancelled" ? 0.75 : 1,
      }}
    >
      <div className="flex items-start gap-4">
        <img
          src={appointment.psychologistPhoto}
          alt={appointment.psychologistName}
          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
            <div>
              <p className="text-slate-900" style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                {appointment.psychologistName}
              </p>
              <p style={{ color: TEAL, fontSize: "0.8rem" }}>{appointment.specialty}</p>
            </div>
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ ...status.style, fontSize: "0.75rem", fontWeight: 600 }}
            >
              <StatusIcon size={12} />
              {status.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5 text-slate-500" style={{ fontSize: "0.8rem" }}>
              <Calendar size={13} />
              <span>{capitalizeFirst(formattedDate)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500" style={{ fontSize: "0.8rem" }}>
              <Clock size={13} />
              <span>{appointment.time} hrs</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: modality.bg, fontSize: "0.78rem", fontWeight: 500, color: modality.color }}
            >
              <ModalityIcon size={12} />
              {modality.label}
            </div>
            <div className="px-2.5 py-1 rounded-full" style={{ background: FOG, color: "#4a6572", fontSize: "0.78rem" }}>
              {appointment.sessionType === "primera" ? "Primera sesión" : "Seguimiento"}
            </div>
            <div className="ml-auto" style={{ color: TEAL, fontWeight: 700, fontSize: "0.9rem" }}>
              ${appointment.price} USD
            </div>
          </div>
        </div>
      </div>

      {appointment.status === "upcoming" && (
        <div className="mt-4 pt-4 border-t flex gap-2" style={{ borderColor: "rgba(26,74,92,0.07)" }}>
          <button
            onClick={() => navigate(`/paciente/psicologo/${appointment.psychologistId}`)}
            className="flex-1 py-2.5 rounded-xl border transition-colors"
            style={{ borderColor: "rgba(26,74,92,0.25)", color: TEAL, fontWeight: 600, fontSize: "0.825rem" }}
          >
            Ver perfil
          </button>
          {/* Chat button for video/chat modalities */}
          {(appointment.modality === "video" || appointment.modality === "chat") && (
            <button
              onClick={() => navigate(`/chat/${appointment.id}`)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white transition-colors"
              style={{ background: TEAL, fontWeight: 600, fontSize: "0.825rem" }}
            >
              {appointment.modality === "video" ? <Video size={14} /> : <MessageCircle size={14} />}
              {appointment.modality === "video" ? "Iniciar sesión" : "Abrir chat"}
            </button>
          )}
          {!showCancel ? (
            <button
              onClick={() => setShowCancel(true)}
              className="px-4 py-2.5 border rounded-xl transition-colors"
              style={{ borderColor: "#e2e8f0", color: "#94a3b8", fontWeight: 600, fontSize: "0.825rem" }}
            >
              Cancelar
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { onCancel(appointment.id); setShowCancel(false); }}
                className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
                style={{ fontWeight: 600, fontSize: "0.825rem" }}
              >
                Confirmar
              </button>
              <button
                onClick={() => setShowCancel(false)}
                className="px-3 py-2.5 border rounded-xl transition-colors"
                style={{ borderColor: "#e2e8f0", color: "#94a3b8", fontSize: "0.825rem" }}
              >
                No
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Appointments() {
  const navigate = useNavigate();
  const { appointments, cancelAppointment } = useUser();
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");

  const upcoming = appointments.filter((a) => a.status === "upcoming");
  const completed = appointments.filter((a) => a.status === "completed");
  const cancelled = appointments.filter((a) => a.status === "cancelled");

  const tabData = {
    upcoming: { label: "Próximas", count: upcoming.length, appointments: upcoming },
    completed: { label: "Completadas", count: completed.length, appointments: completed },
    cancelled: { label: "Canceladas", count: cancelled.length, appointments: cancelled },
  };

  const currentAppointments = tabData[activeTab].appointments;

  return (
    <div className="min-h-screen" style={{ background: FOG }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #0D2E38 0%, ${TEAL} 100%)` }} className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="text-white" style={{ fontWeight: 800, fontSize: "2rem" }}>Mis Citas</h1>
              <p className="mt-1" style={{ color: "#A8D5C2", fontSize: "0.95rem" }}>
                Gestiona tus sesiones de terapia
              </p>
            </div>
            <button
              onClick={() => navigate("/paciente/psicologos")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors border border-white/20 text-white"
              style={{ background: "rgba(255,255,255,0.15)", fontWeight: 600, fontSize: "0.875rem" }}
            >
              <Plus size={15} />
              Nueva cita
            </button>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Próximas", count: upcoming.length },
              { label: "Completadas", count: completed.length },
              { label: "Total", count: appointments.length },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/20 rounded-xl p-3 text-center">
                <p className="text-white" style={{ fontWeight: 800, fontSize: "1.5rem" }}>{stat.count}</p>
                <p style={{ color: "#A8D5C2", fontSize: "0.75rem" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm border mb-6" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
          {(Object.keys(tabData) as Array<keyof typeof tabData>).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
              style={{
                background: activeTab === tab ? TEAL : "transparent",
                color: activeTab === tab ? "white" : "#6a8a9a",
                fontWeight: activeTab === tab ? 700 : 500,
                fontSize: "0.875rem",
              }}
            >
              {tabData[tab].label}
              {tabData[tab].count > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full"
                  style={{
                    background: activeTab === tab ? "rgba(255,255,255,0.2)" : FOG,
                    color: activeTab === tab ? "white" : "#6a8a9a",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                  }}
                >
                  {tabData[tab].count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Appointment list */}
        {currentAppointments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: FOG }}>
              {activeTab === "upcoming" ? (
                <Calendar size={28} className="text-slate-400" />
              ) : activeTab === "completed" ? (
                <CheckCircle size={28} className="text-slate-400" />
              ) : (
                <AlertCircle size={28} className="text-slate-400" />
              )}
            </div>
            <h3 className="text-slate-700 mb-2" style={{ fontWeight: 700, fontSize: "1rem" }}>
              No hay citas {tabData[activeTab].label.toLowerCase()}
            </h3>
            <p className="text-slate-400 mb-6" style={{ fontSize: "0.875rem" }}>
              {activeTab === "upcoming"
                ? "Reserva una sesión con un psicólogo para comenzar."
                : activeTab === "completed"
                ? "Tus sesiones completadas aparecerán aquí."
                : "Las citas canceladas aparecerán aquí."}
            </p>
            {activeTab === "upcoming" && (
              <button
                onClick={() => navigate("/paciente/psicologos")}
                className="px-6 py-3 text-white rounded-xl transition-colors"
                style={{ background: TEAL, fontWeight: 700 }}
              >
                Buscar psicólogo
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {currentAppointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                onCancel={cancelAppointment}
              />
            ))}
          </div>
        )}

        {/* CTA to book more */}
        {appointments.length > 0 && (
          <div
            className="mt-8 p-6 rounded-2xl text-center"
            style={{ background: SAND }}
          >
            <p className="text-slate-700 mb-3" style={{ fontWeight: 700, fontSize: "1rem" }}>
              ¿Necesitas reservar otra sesión?
            </p>
            <p className="text-slate-500 mb-4" style={{ fontSize: "0.875rem" }}>
              Explora nuestra red de psicólogos verificados.
            </p>
            <button
              onClick={() => navigate("/paciente/psicologos")}
              className="px-6 py-3 text-white rounded-xl transition-colors hover:opacity-90"
              style={{ background: CORAL, fontWeight: 700, fontSize: "0.875rem" }}
            >
              Explorar psicólogos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
