import { useNavigate } from "react-router";
import {
  Calendar, Clock, Users, TrendingUp, Video, MessageCircle,
  ChevronRight, Star, CheckCircle, Sparkles,
} from "lucide-react";
import { psychologists } from "../../data/psychologists";

const TEAL = "#1A4A5C";
const SAGE = "#4E8B7A";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const MINT = "#A8D5C2";

const psych = psychologists[0];

const todaySessions = [
  { id: "s1", patient: "Ana García", time: "09:00", modality: "video", status: "upcoming", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" },
  { id: "s2", patient: "Luis Martínez", time: "10:00", modality: "chat", status: "upcoming", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" },
  { id: "s3", patient: "Carmen Vega", time: "11:00", modality: "presencial", status: "completed", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" },
  { id: "s4", patient: "Roberto Díaz", time: "14:00", modality: "video", status: "upcoming", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
  { id: "s5", patient: "Mariana López", time: "15:00", modality: "video", status: "upcoming", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
];

const stats = [
  { label: "Sesiones hoy", value: "5", icon: Calendar, color: TEAL, bg: FOG },
  { label: "Pacientes activos", value: "28", icon: Users, color: SAGE, bg: "#E8F5F1" },
  { label: "Calificación", value: "4.9★", icon: Star, color: "#F59E0B", bg: "#FFF7ED" },
  { label: "Sesiones este mes", value: "64", icon: TrendingUp, color: CORAL, bg: "#FCF0EB" },
];

const modalityMeta: Record<string, { icon: typeof Video; label: string; color: string; bg: string }> = {
  video: { icon: Video, label: "Videollamada", color: TEAL, bg: FOG },
  chat: { icon: MessageCircle, label: "Chat", color: "#0EA5E9", bg: "#F0F9FF" },
  presencial: { icon: Users, label: "Presencial", color: SAGE, bg: "#E8F5F1" },
};

// Mock: hay una oferta activa disponible
const hasActiveOffer = true;

export default function PsychHome() {
  const navigate = useNavigate();

  const upcoming = todaySessions.filter((s) => s.status === "upcoming");
  const completed = todaySessions.filter((s) => s.status === "completed");
  const nextSession = upcoming[0];

  return (
    <div className="min-h-screen" style={{ background: FOG }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #0D2E38 0%, ${TEAL} 100%)` }} className="py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <p style={{ color: MINT, fontSize: "0.875rem", fontWeight: 500 }}>Bienvenida de vuelta</p>
              <h1 className="text-white mt-1" style={{ fontWeight: 800, fontSize: "1.8rem" }}>
                {psych.title} {psych.name.split(" ")[0]} 👋
              </h1>
              <p style={{ color: "#A8D5C2", fontSize: "0.9rem", marginTop: 4 }}>
                Hoy tienes <strong className="text-white">{upcoming.length} sesiones</strong> pendientes
              </p>
            </div>
            <img src={psych.photo} alt={psych.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Offer alert banner */}
        {hasActiveOffer && (
          <div
            className="flex items-center justify-between gap-4 rounded-2xl px-5 py-4 mb-6 cursor-pointer"
            style={{ background: "linear-gradient(135deg, #F59E0B 0%, #F97316 100%)" }}
            onClick={() => navigate("/panel-psicologo/ofertas")}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)" }}>
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white" style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                  ¡Nueva oferta de visibilidad disponible!
                </p>
                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.78rem" }}>
                  Solo el primer psicólogo en suscribirse obtiene el beneficio. ¡Actúa rápido!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.2)" }}>
              <span className="text-white" style={{ fontWeight: 600, fontSize: "0.8rem" }}>Ver oferta</span>
              <ChevronRight size={15} className="text-white" />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                    <Icon size={20} style={{ color: s.color }} />
                  </div>
                </div>
                <p style={{ color: TEAL, fontWeight: 800, fontSize: "1.6rem" }}>{s.value}</p>
                <p className="text-slate-500" style={{ fontSize: "0.8rem" }}>{s.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's sessions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "rgba(26,74,92,0.06)" }}>
                <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1rem" }}>Agenda de hoy</h2>
                <button
                  onClick={() => navigate("/panel-psicologo/citas")}
                  className="flex items-center gap-1"
                  style={{ color: TEAL, fontSize: "0.8rem", fontWeight: 600 }}
                >
                  Ver todas <ChevronRight size={14} />
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {todaySessions.map((session) => {
                  const meta = modalityMeta[session.modality];
                  const Icon = meta.icon;
                  return (
                    <div key={session.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                      <div className="relative flex-shrink-0">
                        <img src={session.photo} alt={session.patient} className="w-11 h-11 rounded-xl object-cover" />
                        {session.status === "completed" && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: SAGE }}>
                            <CheckCircle size={11} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900" style={{ fontWeight: 600, fontSize: "0.9rem" }}>{session.patient}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Clock size={12} className="text-slate-400" />
                          <span className="text-slate-400" style={{ fontSize: "0.78rem" }}>{session.time} hrs</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <div className="flex items-center gap-1">
                            <Icon size={11} style={{ color: meta.color }} />
                            <span style={{ color: meta.color, fontSize: "0.75rem", fontWeight: 500 }}>{meta.label}</span>
                          </div>
                        </div>
                      </div>
                      {session.status === "upcoming" ? (
                        <button
                          onClick={() => navigate("/chat/apt-1")}
                          className="px-3 py-1.5 rounded-lg text-white flex items-center gap-1.5"
                          style={{ background: session.modality === "presencial" ? SAGE : TEAL, fontSize: "0.78rem", fontWeight: 600 }}
                        >
                          {session.modality === "video" ? <Video size={13} /> : session.modality === "chat" ? <MessageCircle size={13} /> : <Users size={13} />}
                          {session.modality === "video" ? "Iniciar" : session.modality === "chat" ? "Abrir chat" : "Confirmar"}
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full" style={{ background: "#E8F5F1", color: SAGE, fontSize: "0.75rem", fontWeight: 600 }}>
                          Completada
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* Next session highlight */}
            {nextSession && (
              <div className="rounded-2xl p-5" style={{ background: `linear-gradient(135deg, ${TEAL} 0%, #2D7D9A 100%)` }}>
                <p className="text-white/70 mb-1" style={{ fontSize: "0.78rem", fontWeight: 500 }}>Próxima sesión</p>
                <div className="flex items-center gap-3 mb-4">
                  <img src={nextSession.photo} alt={nextSession.patient} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <p className="text-white" style={{ fontWeight: 700, fontSize: "0.95rem" }}>{nextSession.patient}</p>
                    <p style={{ color: MINT, fontSize: "0.78rem" }}>{nextSession.time} hrs · {modalityMeta[nextSession.modality].label}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/chat/apt-1")}
                  className="w-full py-2.5 rounded-xl text-white flex items-center justify-center gap-2"
                  style={{ background: "rgba(255,255,255,0.15)", fontWeight: 600, fontSize: "0.85rem" }}
                >
                  <Video size={16} /> Iniciar sesión
                </button>
              </div>
            )}

            {/* Day summary */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
              <h3 className="text-slate-900 mb-4" style={{ fontWeight: 700, fontSize: "0.9rem" }}>Resumen del día</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500" style={{ fontSize: "0.82rem" }}>Completadas</span>
                  <span style={{ color: SAGE, fontWeight: 700 }}>{completed.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500" style={{ fontSize: "0.82rem" }}>Pendientes</span>
                  <span style={{ color: TEAL, fontWeight: 700 }}>{upcoming.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500" style={{ fontSize: "0.82rem" }}>Ingresos hoy</span>
                  <span style={{ color: CORAL, fontWeight: 700 }}>$275</span>
                </div>
                <div className="w-full rounded-full overflow-hidden" style={{ background: FOG, height: 6 }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(completed.length / todaySessions.length) * 100}%`, background: SAGE }}
                  />
                </div>
                <p className="text-slate-400" style={{ fontSize: "0.72rem" }}>
                  {Math.round((completed.length / todaySessions.length) * 100)}% del día completado
                </p>
              </div>
            </div>

            {/* Adjust schedule */}
            <button
              onClick={() => navigate("/panel-psicologo/agenda")}
              className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 border-2"
              style={{ borderColor: "rgba(26,74,92,0.2)", color: TEAL, fontWeight: 600, background: "white" }}
            >
              <Calendar size={18} />
              Ajustar agenda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}