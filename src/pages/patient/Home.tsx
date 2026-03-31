import { useNavigate } from "react-router";
import { Search, Star, Sparkles, ChevronRight, Clock, Video, Users, MessageCircle } from "lucide-react";
import { useState } from "react";
import { psychologists, specialtyOptions } from "../../data/psychologists";
import { PsychologistCard } from "../../components/PsychologistCard";
import { useUser } from "../../hooks/useUser";

const TEAL = "#1A4A5C";
const TEAL_DARK = "#0D2E38";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const MINT = "#A8D5C2";

const QUICK_SPECIALTIES = specialtyOptions.slice(0, 8);

// ── Mock oferta activa ──────────────────────────────────────────────────────
// Cuando conectes la API: reemplaza esto con un fetch a /api/offers/active
// Si status === "TAKEN", significa que un psicólogo ya se suscribió
const activeOffer = {
  psychologistId: "1", // ID del psicólogo ganador (el que se suscribió)
  discountPercent: 20,
  label: "Oferta Abril",
  endDate: "2026-04-30",
};
// ───────────────────────────────────────────────────────────────────────────

const modalityIcon = {
  video: Video,
  presencial: Users,
  chat: MessageCircle,
};

export default function Home() {
  const navigate = useNavigate();
  const { appointments } = useUser();
  const [searchQuery, setSearchQuery] = useState("");

  // Psicólogo destacado (ganador de la oferta)
  const featuredPsychologist = psychologists.find((p) => p.id === activeOffer.psychologistId);

  // Los otros 3 destacados — excluye al ganador para no repetirlo
  const regularFeatured = psychologists
    .filter((p) => p.id !== activeOffer.psychologistId)
    .slice(0, 3);

  const nextAppointment = appointments
    .filter((a) => a.status === "upcoming")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/paciente/psicologos${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`);
  };

  const formatNextDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return "Hoy";
    if (date.toDateString() === tomorrow.toDateString()) return "Mañana";
    return date.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "short" });
  };

  return (
    <div style={{ background: FOG }}>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${TEAL_DARK} 0%, ${TEAL} 60%, #2D7D9A 100%)` }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${MINT}, transparent)`, transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${MINT}, transparent)`, transform: "translate(-30%, 30%)" }} />

        <div className="max-w-4xl mx-auto px-6 py-16 lg:py-20 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 mb-5"
              style={{ background: "rgba(255,255,255,0.1)" }}>
              <Sparkles size={13} style={{ color: CORAL }} />
              <span className="text-white" style={{ fontSize: "0.78rem", fontWeight: 500 }}>
                +500 psicólogos certificados en México
              </span>
            </div>
            <h1 className="text-white mb-4" style={{ fontWeight: 800, fontSize: "clamp(1.8rem, 5vw, 3rem)", lineHeight: 1.15 }}>
              Tu bienestar mental,{" "}
              <span style={{ color: MINT }}>siempre accesible</span>
            </h1>
            <p className="mb-8 mx-auto" style={{ color: "#C8DDE8", fontSize: "1rem", maxWidth: 480, lineHeight: 1.65 }}>
              Conectamos personas con psicólogos verificados. Sesiones por videollamada, presenciales o por chat.
            </p>
            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-6">
              <div className="flex-1 flex items-center gap-3 rounded-xl px-4 border border-white/20"
                style={{ background: "rgba(255,255,255,0.12)" }}>
                <Search size={17} style={{ color: MINT }} className="flex-shrink-0" />
                <input type="text" placeholder="Busca por especialidad o nombre..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white outline-none py-3.5 placeholder-white/50"
                  style={{ fontSize: "0.9rem" }} />
              </div>
              <button type="submit"
                className="px-5 py-3 rounded-xl flex-shrink-0 hover:opacity-90 transition-opacity"
                style={{ background: CORAL, color: "white", fontWeight: 700, fontSize: "0.875rem" }}>
                Buscar
              </button>
            </form>
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_SPECIALTIES.map((s) => (
                <button key={s} onClick={() => navigate(`/paciente/psicologos?q=${s}`)}
                  className="px-3 py-1 rounded-full border border-white/20 hover:bg-white/20 transition-colors"
                  style={{ color: MINT, fontSize: "0.78rem", background: "rgba(255,255,255,0.08)" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 leading-none">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 48L1440 48L1440 24C1200 56 800 -8 0 24L0 48Z" fill={FOG} />
          </svg>
        </div>
      </section>

      {/* ── PRÓXIMA CITA ── */}
      {nextAppointment && (() => {
        const Icon = modalityIcon[nextAppointment.modality];
        return (
          <div className="max-w-4xl mx-auto px-6 pt-8">
            <div className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
              style={{ borderColor: "rgba(26,74,92,0.1)" }}
              onClick={() => navigate("/paciente/mis-citas")}>
              <img src={nextAppointment.psychologistPhoto} alt={nextAppointment.psychologistName}
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-slate-500" style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Próxima sesión
                </p>
                <p className="text-slate-900 truncate" style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                  {nextAppointment.psychologistName}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock size={11} className="text-slate-400" />
                  <span className="text-slate-500" style={{ fontSize: "0.78rem" }}>
                    {formatNextDate(nextAppointment.date)} · {nextAppointment.time} hrs
                  </span>
                  <Icon size={11} style={{ color: TEAL }} />
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0" style={{ color: TEAL }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Ver cita</span>
                <ChevronRight size={15} />
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── PSICÓLOGO DESTACADO (ganador de la oferta) ── */}
      {featuredPsychologist && (
        <section className="max-w-4xl mx-auto px-6 pt-10">
          {/* Header con contexto de la oferta */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} style={{ color: "#F59E0B" }} />
              <div>
                <h2 className="text-slate-900" style={{ fontWeight: 800, fontSize: "1.15rem" }}>
                  Psicólogo destacado del mes
                </h2>
                <p className="text-slate-400" style={{ fontSize: "0.75rem" }}>
                  {activeOffer.discountPercent}% de descuento en todas las sesiones · Válido hasta {activeOffer.endDate}
                </p>
              </div>
            </div>
            <button onClick={() => navigate("/paciente/psicologos")}
              className="flex items-center gap-1 flex-shrink-0"
              style={{ color: TEAL, fontSize: "0.8rem", fontWeight: 600 }}>
              Ver todos <ChevronRight size={14} />
            </button>
          </div>

          {/* Card del destacado en variante list para más impacto */}
          <PsychologistCard
            psychologist={featuredPsychologist}
            variant="list"
            featuredOffer={{ discountPercent: activeOffer.discountPercent, label: activeOffer.label }}
          />
        </section>
      )}

      {/* ── OTROS PSICÓLOGOS DESTACADOS ── */}
      <section className="max-w-4xl mx-auto px-6 pt-8 pb-14">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Star size={14} style={{ color: "#F59E0B", fill: "#F59E0B" }} />
            <h2 className="text-slate-900" style={{ fontWeight: 800, fontSize: "1.15rem" }}>Mejor valorados</h2>
          </div>
          <button onClick={() => navigate("/paciente/psicologos")}
            className="flex items-center gap-1"
            style={{ color: TEAL, fontSize: "0.8rem", fontWeight: 600 }}>
            Ver todos <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {regularFeatured.map((p) => (
            <PsychologistCard key={p.id} psychologist={p} />
          ))}
        </div>
      </section>

    </div>
  );
}