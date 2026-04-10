import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Calendar, Video, Users, MessageCircle, Clock, Search } from "lucide-react";
import { schedulingService, type SchedulingAppointment } from "../../service/schedulingService";

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

export default function PsychAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<SchedulingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);
      setError(null);

      try {
        const list = await schedulingService.getMyAppointments("PSYCHOLOGIST");
        setAppointments(list);
      } catch {
        setError("No se pudieron cargar tus citas.");
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const filtered = appointments.filter(
    (a) =>
      a.status === activeTab &&
      String(a.patientName ?? "Paciente").toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    upcoming: appointments.filter((a) => a.status === "upcoming").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr + "T00:00:00").toLocaleDateString("es-MX", {
      weekday: "short", day: "numeric", month: "short",
    });

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
              { label: "Total", count: appointments.length },
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

        {/* Appointment list */}
        {loading ? (
          <div className="text-center py-14 bg-white rounded-2xl border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
            <p className="text-slate-500" style={{ fontWeight: 600 }}>Cargando citas...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
            <Calendar size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500" style={{ fontWeight: 600 }}>No hay citas en esta categoría</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((apt) => {
              const meta = modalityMeta[apt.modality];
              const Icon = meta.icon;
              return (
                <div key={apt.id} className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
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
                          <span>{formatDate(apt.date)}</span>
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
            })}
          </div>
        )}
      </div>
    </div>
  );
}
