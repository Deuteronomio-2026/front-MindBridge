import { useParams, useNavigate } from "react-router";
import { ArrowLeft, MapPin, BadgeCheck, GraduationCap, Languages, Video, Users, MessageCircle, Star, Clock, Calendar } from "lucide-react";
import { psychologists, dayNames, dayFromDate } from "../../data/psychologists";
import { StarRating } from "../../components/StarRating";

const TEAL = "#1A4A5C";
const SAGE = "#4E8B7A";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const MINT = "#A8D5C2";

export default function PsychologistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const psychologist = psychologists.find((p) => p.id === id);

  if (!psychologist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-slate-500 mb-4">Psicólogo no encontrado</p>
        <button onClick={() => navigate("/paciente/psicologos")} style={{ color: TEAL }}>
          Volver a la lista
        </button>
      </div>
    );
  }

  const nextDays = Array.from({ length: 5 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date;
  });

  const modalities = [
    {
      key: "video",
      label: "Videollamada",
      icon: Video,
      price: psychologist.prices.video,
      color: TEAL,
      bg: FOG,
      desc: "Sesión online desde cualquier lugar",
    },
    {
      key: "presencial",
      label: "Presencial",
      icon: Users,
      price: psychologist.prices.presencial,
      color: SAGE,
      bg: "#E8F5F1",
      desc: "En el consultorio del psicólogo",
    },
    {
      key: "chat",
      label: "Chat",
      icon: MessageCircle,
      price: psychologist.prices.chat,
      color: "#0EA5E9",
      bg: "#F0F9FF",
      desc: "Mensajes en tiempo real",
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: FOG }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #0D2E38 0%, ${TEAL} 100%)` }} className="py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate("/paciente/psicologos")}
            className="flex items-center gap-2 mb-6 transition-colors hover:text-white"
            style={{ color: MINT, fontSize: "0.875rem" }}
          >
            <ArrowLeft size={16} />
            Volver a psicólogos
          </button>

          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative flex-shrink-0">
              <img
                src={psychologist.photo}
                alt={`${psychologist.title} ${psychologist.name}`}
                className="w-32 h-32 rounded-2xl object-cover shadow-xl"
              />
              {psychologist.verified && (
                <div className="absolute -bottom-2 -right-2 rounded-full p-1 border-2 border-white" style={{ background: TEAL }}>
                  <BadgeCheck size={16} className="text-white" strokeWidth={2} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-3 mb-2">
                <h1 className="text-white" style={{ fontSize: "1.75rem", fontWeight: 800 }}>
                  {psychologist.title} {psychologist.name}
                </h1>
                {psychologist.verified && (
                  <span className="px-2.5 py-1 rounded-full flex items-center gap-1.5 mt-1" style={{ background: "rgba(255,255,255,0.15)", color: MINT, fontSize: "0.75rem", fontWeight: 500 }}>
                    <BadgeCheck size={12} />
                    Verificado
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {psychologist.specialties.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-full" style={{ background: "rgba(168,213,194,0.2)", color: MINT, fontSize: "0.8rem" }}>
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <StarRating rating={psychologist.rating} reviewCount={psychologist.reviewCount} size={15} />
                <div className="flex items-center gap-1" style={{ color: MINT, fontSize: "0.85rem" }}>
                  <MapPin size={14} />
                  <span>{psychologist.location}</span>
                </div>
                <div className="flex items-center gap-1" style={{ color: MINT, fontSize: "0.85rem" }}>
                  <Clock size={14} />
                  <span>{psychologist.experience} años de experiencia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {/* Left - Main content */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Bio */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
              <h2 className="text-slate-900 mb-3" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Sobre mí</h2>
              <p className="text-slate-600 leading-relaxed" style={{ fontSize: "0.9rem" }}>
                {psychologist.bio}
              </p>
            </div>

            {/* Education */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: FOG }}>
                  <GraduationCap size={16} style={{ color: TEAL }} />
                </div>
                <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Formación académica</h2>
              </div>
              <ul className="flex flex-col gap-3">
                {psychologist.education.map((e, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: MINT }} />
                    <span className="text-slate-600" style={{ fontSize: "0.875rem" }}>{e}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Languages */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#F0F9FF" }}>
                  <Languages size={16} style={{ color: "#0EA5E9" }} />
                </div>
                <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Idiomas</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {psychologist.languages.map((l) => (
                  <span key={l} className="px-3 py-1.5 rounded-full" style={{ background: "#F0F9FF", color: "#0EA5E9", fontSize: "0.875rem", fontWeight: 500 }}>
                    {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Availability preview */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#E8F5F1" }}>
                  <Calendar size={16} style={{ color: SAGE }} />
                </div>
                <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Disponibilidad esta semana</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {nextDays.map((date) => {
                  const dayKey = dayFromDate(date);
                  const slots = psychologist.schedule[dayKey] || [];
                  const hasSlots = slots.length > 0;
                  return (
                    <div
                      key={date.toISOString()}
                      className="rounded-xl p-3 text-center border"
                      style={{
                        background: hasSlots ? "#E8F5F1" : "#F8FAFB",
                        borderColor: hasSlots ? "#A8D5C2" : "#e2e8f0",
                      }}
                    >
                      <p
                        className="capitalize mb-1"
                        style={{ color: hasSlots ? SAGE : "#94a3b8", fontSize: "0.75rem", fontWeight: 600 }}
                      >
                        {dayNames[dayKey]?.slice(0, 3) || dayKey.slice(0, 3)}
                      </p>
                      <p style={{ color: hasSlots ? "#1a3328" : "#94a3b8", fontWeight: 700, fontSize: "1.1rem" }}>
                        {date.getDate()}
                      </p>
                      <p style={{ color: hasSlots ? SAGE : "#94a3b8", fontSize: "0.7rem" }}>
                        {hasSlots ? `${slots.length} horarios` : "Sin disponibilidad"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#FFF7ED" }}>
                  <Star size={16} className="text-amber-500 fill-amber-400" />
                </div>
                <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                  Reseñas ({psychologist.reviewCount})
                </h2>
              </div>
              {/* Rating summary */}
              <div className="flex items-center gap-4 mb-6 p-4 rounded-xl" style={{ background: FOG }}>
                <div className="text-center">
                  <p className="text-slate-900" style={{ fontWeight: 800, fontSize: "2.5rem", lineHeight: 1 }}>
                    {psychologist.rating.toFixed(1)}
                  </p>
                  <StarRating rating={psychologist.rating} size={14} showNumber={false} />
                  <p className="text-slate-400 mt-1" style={{ fontSize: "0.75rem" }}>
                    {psychologist.reviewCount} reseñas
                  </p>
                </div>
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct = star >= 4 ? (star === 5 ? 70 : 20) : star === 3 ? 8 : 2;
                    return (
                      <div key={star} className="flex items-center gap-2 mb-1">
                        <span className="text-slate-400 w-3" style={{ fontSize: "0.75rem" }}>{star}</span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#e2e8f0" }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#F59E0B" }} />
                        </div>
                        <span className="text-slate-400 w-7 text-right" style={{ fontSize: "0.7rem" }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {psychologist.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: "rgba(26,74,92,0.06)" }}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#EAF2F5" }}>
                          <span style={{ color: TEAL, fontWeight: 700, fontSize: "0.75rem" }}>
                            {review.avatar}
                          </span>
                        </div>
                        <div>
                          <p className="text-slate-800" style={{ fontWeight: 600, fontSize: "0.875rem" }}>{review.user}</p>
                          <p className="text-slate-400" style={{ fontSize: "0.75rem" }}>{review.date}</p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size={12} showNumber={false} />
                    </div>
                    <p className="text-slate-600 leading-relaxed" style={{ fontSize: "0.875rem" }}>
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar - Booking widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
                <h3 className="text-slate-900 mb-4" style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                  Reservar sesión
                </h3>

                <div className="flex flex-col gap-3 mb-5">
                  {modalities.map((m) => (
                    <div
                      key={m.key}
                      className="flex items-center gap-3 p-3 rounded-xl border"
                      style={{ borderColor: "rgba(26,74,92,0.08)" }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: m.bg }}
                      >
                        <m.icon size={18} style={{ color: m.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-800" style={{ fontWeight: 600, fontSize: "0.85rem" }}>{m.label}</p>
                        <p className="text-slate-400" style={{ fontSize: "0.75rem" }}>{m.desc}</p>
                      </div>
                      <span className="text-slate-900" style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                        ${m.price}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ✅ CORRECCIÓN AQUÍ: se agregó el prefijo "/paciente" */}
                <button
                  onClick={() => navigate(`/paciente/reservar/${psychologist.id}`)}
                  className="w-full py-3.5 text-white rounded-xl transition-colors hover:opacity-90"
                  style={{ background: CORAL, fontWeight: 700, fontSize: "0.95rem" }}
                >
                  Reservar cita
                </button>

                <div className="mt-4 flex items-start gap-2 p-3 rounded-xl" style={{ background: "#E8F5F1" }}>
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 animate-pulse" style={{ background: SAGE }} />
                  <div>
                    <p style={{ color: SAGE, fontWeight: 600, fontSize: "0.8rem" }}>
                      Disponibilidad en tiempo real
                    </p>
                    <p style={{ color: "#4a8a74", fontSize: "0.75rem" }}>
                      Los horarios se actualizan automáticamente
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick info */}
              <div className="rounded-2xl p-5 mt-4" style={{ background: "#F5EDD8" }}>
                <p className="text-slate-700 mb-3" style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  Primera sesión sin costo adicional de evaluación
                </p>
                <p className="text-slate-500" style={{ fontSize: "0.8rem" }}>
                  Programa tu primera consulta y descubre si hay compatibilidad terapéutica.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}