import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Search, Video, Users, MessageCircle, ArrowRight, Star,
  Shield, Clock, BadgeCheck, ChevronRight, Brain, Sparkles, HeartHandshake
} from "lucide-react";
import { psychologists } from "../../data/psychologists";
import { PsychologistCard } from "../../components/PsychologistCard";
import { StarRating } from "../../components/StarRating";

const TEAL = "#1A4A5C";
const TEAL_DARK = "#0D2E38";
const SAGE = "#4E8B7A";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const SAND = "#F5EDD8";
const MINT = "#A8D5C2";

const HERO_IMAGE = "https://images.unsplash.com/photo-1709768700195-5887077e0bf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800";
const VIDEO_IMAGE = "https://images.unsplash.com/photo-1644698430283-457235154c99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=700";
const CALM_IMAGE = "https://images.unsplash.com/photo-1758273240112-c7724c9bb4a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600";

const stats = [
  { value: "500+", label: "Psicólogos certificados" },
  { value: "50k+", label: "Sesiones realizadas" },
  { value: "4.9★", label: "Calificación promedio" },
  { value: "98%", label: "Pacientes satisfechos" },
];

const howItWorks = [
  {
    step: "01",
    icon: Search,
    title: "Encuentra tu psicólogo",
    desc: "Busca entre nuestra red de profesionales certificados por especialidad, modalidad y precio.",
    color: TEAL,
    bg: FOG,
  },
  {
    step: "02",
    icon: Clock,
    title: "Elige fecha y horario",
    desc: "Consulta la disponibilidad en tiempo real y selecciona el horario que mejor se adapte a ti.",
    color: SAGE,
    bg: "#E8F5F1",
  },
  {
    step: "03",
    icon: HeartHandshake,
    title: "Comienza tu terapia",
    desc: "Conéctate con tu psicólogo por videollamada, en persona o por chat. Así de sencillo.",
    color: CORAL,
    bg: "#FCF0EB",
  },
];

const modalities = [
  {
    icon: Video,
    title: "Videollamada",
    desc: "Sesiones online desde la comodidad de tu hogar o donde estés.",
    color: TEAL,
    bg: FOG,
  },
  {
    icon: Users,
    title: "Presencial",
    desc: "Visita el consultorio de tu psicólogo para una sesión cara a cara.",
    color: SAGE,
    bg: "#E8F5F1",
  },
  {
    icon: MessageCircle,
    title: "Chat",
    desc: "Escríbete con tu psicólogo en tiempo real a través de mensajes.",
    color: "#0EA5E9",
    bg: "#F0F9FF",
  },
];

const testimonials = [
  {
    name: "Laura S.",
    avatar: "LS",
    rating: 5,
    comment: "MindBridge me ayudó a encontrar la psicóloga perfecta en minutos. El proceso de reserva es súper fácil y la atención fue excelente.",
    specialty: "Ansiedad",
  },
  {
    name: "Ricardo F.",
    avatar: "RF",
    rating: 5,
    comment: "Nunca pensé que pedir ayuda sería tan sencillo. Las sesiones por videollamada son muy convenientes y profesionales.",
    specialty: "Estrés laboral",
  },
  {
    name: "Valentina C.",
    avatar: "VC",
    rating: 5,
    comment: "Encontré una terapeuta especializada en trauma que realmente me entendió. La plataforma es hermosa y muy intuitiva.",
    specialty: "Trauma",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/paciente/psicologos${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`);
  };

  const featuredPsychologists = psychologists.slice(0, 3);

  return (
    <div>
      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${TEAL_DARK} 0%, ${TEAL} 55%, #2D7D9A 100%)` }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${MINT}, transparent)`, transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${MINT}, transparent)`, transform: "translate(-30%, 30%)" }} />

        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full mb-6 border border-white/20">
                <Sparkles size={14} style={{ color: CORAL }} />
                <span style={{ fontSize: "0.8rem", fontWeight: 500 }}>La plataforma #1 de salud mental en México</span>
              </div>
              <h1 className="text-white mb-6" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.15 }}>
                Tu bienestar mental,{" "}
                <span style={{ color: MINT }}>siempre accesible</span>
              </h1>
              <p className="mb-8 leading-relaxed" style={{ color: "#C8DDE8", fontSize: "1.1rem" }}>
                Conectamos personas con psicólogos certificados. Reserva sesiones por videollamada,
                presenciales o por chat, y comienza tu proceso de transformación hoy.
              </p>

              {/* Search */}
              <form onSubmit={handleSearch} className="flex gap-2 mb-8">
                <div className="flex-1 flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4">
                  <Search size={18} style={{ color: MINT }} className="flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Busca por especialidad o nombre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-white outline-none py-3.5"
                    style={{ fontSize: "0.9rem" }}
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3.5 rounded-xl transition-colors flex-shrink-0"
                  style={{ background: CORAL, color: "white", fontWeight: 700, fontSize: "0.9rem" }}
                >
                  Buscar
                </button>
              </form>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {["Ansiedad", "Depresión", "Pareja", "Trauma", "Estrés"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => navigate(`/paciente/psicologos?q=${tag}`)}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full border border-white/15 transition-colors"
                    style={{ color: MINT, fontSize: "0.8rem" }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Right - floating cards */}
            <div className="hidden lg:flex justify-center items-center relative">
              <div className="relative w-80">
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img src={HERO_IMAGE} alt="Terapia" className="w-full h-64 object-cover" />
                </div>
                <div className="absolute -bottom-6 -left-12 bg-white rounded-2xl p-4 shadow-xl w-56">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={psychologists[0].photo} alt={psychologists[0].name} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <p className="text-slate-900" style={{ fontWeight: 600, fontSize: "0.85rem" }}>Dra. Sofía Ramírez</p>
                      <p style={{ color: TEAL, fontSize: "0.75rem" }}>Ansiedad · Depresión</p>
                    </div>
                  </div>
                  <StarRating rating={4.9} size={12} reviewCount={128} />
                </div>
                <div className="absolute -top-5 -right-8 bg-white rounded-2xl px-4 py-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: SAGE }} />
                    <p className="text-slate-700" style={{ fontWeight: 600, fontSize: "0.8rem" }}>Disponible hoy</p>
                  </div>
                  <p className="text-slate-400 mt-0.5" style={{ fontSize: "0.75rem" }}>3 horarios libres</p>
                </div>
                <div className="absolute -right-10 top-1/2 rounded-xl px-3 py-2 shadow-lg" style={{ background: TEAL }}>
                  <p className="text-white text-center" style={{ fontWeight: 800, fontSize: "1.2rem" }}>500+</p>
                  <p style={{ color: MINT, fontSize: "0.7rem" }}>Psicólogos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 30C1200 70 800 -10 0 30L0 60Z" fill={FOG} />
          </svg>
        </div>
      </section>

      {/* STATS */}
      <section className="py-12" style={{ background: FOG }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.value} className="text-center">
                <p style={{ color: TEAL, fontSize: "2rem", fontWeight: 800 }}>{stat.value}</p>
                <p className="text-slate-500" style={{ fontSize: "0.85rem" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20" style={{ background: SAND }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{ background: "#EAF2F5", color: TEAL }}>
              <Sparkles size={14} />
              <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Proceso simple</span>
            </div>
            <h2 className="text-slate-900 mb-3" style={{ fontSize: "2rem", fontWeight: 800 }}>¿Cómo funciona?</h2>
            <p className="text-slate-500 max-w-md mx-auto" style={{ fontSize: "1rem" }}>
              En tres pasos sencillos puedes comenzar tu proceso de bienestar mental.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, idx) => (
              <div key={step.step} className="relative">
                {idx < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-px border-t-2 border-dashed z-0" style={{ borderColor: "rgba(26,74,92,0.2)", width: "calc(100% - 2rem)" }} />
                )}
                <div className="bg-white rounded-2xl p-7 shadow-sm border relative z-10" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: step.bg }}>
                      <step.icon size={22} style={{ color: step.color }} />
                    </div>
                    <span className="text-slate-100" style={{ fontSize: "2.5rem", fontWeight: 800, lineHeight: 1 }}>
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-slate-900 mb-2" style={{ fontWeight: 700, fontSize: "1.05rem" }}>{step.title}</h3>
                  <p className="text-slate-500" style={{ fontSize: "0.875rem", lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODALITIES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{ background: "#EAF2F5", color: TEAL }}>
                <Brain size={14} />
                <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Modalidades de atención</span>
              </div>
              <h2 className="text-slate-900 mb-4" style={{ fontSize: "2rem", fontWeight: 800 }}>
                Elige cómo quieres recibir tu atención
              </h2>
              <p className="text-slate-500 mb-8" style={{ fontSize: "1rem", lineHeight: 1.7 }}>
                Sabemos que cada persona es diferente. Por eso ofrecemos tres modalidades
                de atención para que elijas la que mejor se adapte a tu estilo de vida.
              </p>
              <div className="flex flex-col gap-4">
                {modalities.map((m) => (
                  <div
                    key={m.title}
                    className="flex items-start gap-4 p-4 rounded-xl border hover:shadow-sm transition-all cursor-pointer"
                    style={{ borderColor: "rgba(26,74,92,0.1)" }}
                    onClick={() => navigate("/paciente/psicologos")}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: m.bg }}>
                      <m.icon size={20} style={{ color: m.color }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-slate-900 mb-0.5" style={{ fontWeight: 600, fontSize: "0.95rem" }}>{m.title}</h4>
                      <p className="text-slate-500" style={{ fontSize: "0.85rem" }}>{m.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 mt-1 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img src={VIDEO_IMAGE} alt="Videollamada con psicólogo" className="w-full h-96 object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-xl max-w-56">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: SAGE }} />
                  <span style={{ color: SAGE, fontWeight: 600, fontSize: "0.8rem" }}>Sesión en curso</span>
                </div>
                <div className="flex items-center gap-3">
                  <img src={psychologists[1].photo} alt="" className="w-9 h-9 rounded-lg object-cover" />
                  <div>
                    <p className="text-slate-800" style={{ fontWeight: 600, fontSize: "0.8rem" }}>Dr. Carlos Mendez</p>
                    <p className="text-slate-400" style={{ fontSize: "0.72rem" }}>Videollamada · 45 min</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PSYCHOLOGISTS */}
      <section className="py-20" style={{ background: FOG }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{ background: "#EAF2F5", color: TEAL }}>
                <Star size={14} style={{ fill: TEAL, color: TEAL }} />
                <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Mejor valorados</span>
              </div>
              <h2 className="text-slate-900" style={{ fontSize: "2rem", fontWeight: 800 }}>Psicólogos destacados</h2>
            </div>
            <button
              onClick={() => navigate("/paciente/psicologos")}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 border rounded-xl transition-all hover:shadow-sm"
              style={{ borderColor: "rgba(26,74,92,0.2)", color: TEAL, fontWeight: 500, fontSize: "0.875rem" }}
            >
              Ver todos <ArrowRight size={15} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredPsychologists.map((p) => (
              <PsychologistCard key={p.id} psychologist={p} />
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <button
              onClick={() => navigate("/paciente/psicologos")}
              className="px-6 py-3 text-white rounded-xl hover:opacity-90 transition-opacity"
              style={{ background: TEAL, fontWeight: 600 }}
            >
              Ver todos los psicólogos
            </button>
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="rounded-3xl overflow-hidden shadow-xl">
                <img src={CALM_IMAGE} alt="Bienestar mental" className="w-full h-80 object-cover" />
              </div>
              <div className="absolute -top-5 -right-5 rounded-2xl p-5 text-white shadow-lg" style={{ background: TEAL }}>
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={18} style={{ color: MINT }} />
                  <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>100% Seguro</span>
                </div>
                <p style={{ color: MINT, fontSize: "0.75rem" }}>Tus datos están protegidos</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{ background: "#E8F5F1", color: SAGE }}>
                <Shield size={14} />
                <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Confianza y seguridad</span>
              </div>
              <h2 className="text-slate-900 mb-4" style={{ fontSize: "2rem", fontWeight: 800 }}>
                Psicólogos verificados y certificados
              </h2>
              <p className="text-slate-500 mb-8" style={{ fontSize: "1rem", lineHeight: 1.7 }}>
                Todos nuestros profesionales pasan por un riguroso proceso de verificación
                de credenciales, cédula profesional y experiencia clínica antes de unirse a la plataforma.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: BadgeCheck, text: "Cédula profesional verificada" },
                  { icon: Shield, text: "Confidencialidad garantizada" },
                  { icon: Star, text: "Calificaciones reales de pacientes" },
                  { icon: Clock, text: "Disponibilidad en tiempo real" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#E8F5F1" }}>
                      <item.icon size={15} style={{ color: SAGE }} />
                    </div>
                    <p className="text-slate-700" style={{ fontSize: "0.875rem", fontWeight: 500 }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20" style={{ background: SAND }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{ background: "#FCF0EB", color: CORAL }}>
              <Star size={14} style={{ fill: CORAL, color: CORAL }} />
              <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Testimonios reales</span>
            </div>
            <h2 className="text-slate-900" style={{ fontSize: "2rem", fontWeight: 800 }}>Lo que dicen nuestros usuarios</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#EAF2F5" }}>
                      <span style={{ color: TEAL, fontWeight: 700, fontSize: "0.8rem" }}>{t.avatar}</span>
                    </div>
                    <div>
                      <p className="text-slate-900" style={{ fontWeight: 600, fontSize: "0.9rem" }}>{t.name}</p>
                      <p style={{ color: SAGE, fontSize: "0.75rem" }}>{t.specialty}</p>
                    </div>
                  </div>
                  <StarRating rating={t.rating} size={13} showNumber={false} />
                </div>
                <p className="text-slate-600 leading-relaxed" style={{ fontSize: "0.875rem" }}>"{t.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20"
        style={{ background: `linear-gradient(135deg, ${TEAL_DARK} 0%, ${TEAL} 100%)` }}
      >
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-white mb-4" style={{ fontSize: "2.2rem", fontWeight: 800 }}>
            ¿Listo para comenzar tu proceso?
          </h2>
          <p className="mb-8" style={{ color: MINT, fontSize: "1.05rem" }}>
            Da el primer paso hacia tu bienestar mental. Encuentra al psicólogo ideal para ti hoy mismo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/paciente/psicologos")}
              className="px-8 py-4 rounded-xl transition-colors hover:opacity-90"
              style={{ background: CORAL, color: "white", fontWeight: 700, fontSize: "1rem" }}
            >
              Encontrar psicólogo
            </button>
            <button
              onClick={() => navigate("/paciente/psicologos")}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transition-colors"
              style={{ fontWeight: 600, fontSize: "1rem" }}
            >
              Ver cómo funciona
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
