import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, MapPin, BadgeCheck, Languages, Video, Users, MessageCircle, Star, Clock, Calendar, Loader2 } from "lucide-react";
import { StarRating } from "../../components/StarRating";
import { userService } from "../../service/userService";
import type { PsychologistSchedule } from "../../service/userService";
import type { Psychologist } from "../../types/user";

const TEAL = "#1A4A5C";
const SAGE = "#4E8B7A";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const MINT = "#A8D5C2";

const DAY_LABELS: Record<string, string> = {
  LUNES: "Lunes",
  MARTES: "Martes",
  MIERCOLES: "Miércoles",
  JUEVES: "Jueves",
  VIERNES: "Viernes",
  SABADO: "Sábado",
  DOMINGO: "Domingo",
};

const MODALITY_ICONS: Record<string, React.ElementType> = {
  VideoConferencia: Video,
  Presencial: Users,
  Chat: MessageCircle,
};

const MODALITY_COLORS: Record<string, string> = {
  VideoConferencia: TEAL,
  Presencial: SAGE,
  Chat: "#0EA5E9",
};

const mapPsychologistToLocal = (p: Psychologist) => ({
  id: p.id,
  name: `${p.name} ${p.lastName}`,
  title: p.specialization,
  verified: p.verificationStatus === "VERIFIED",
  specialties: [p.specialization],
  location: p.address || p.officeLocation || "Ubicación no especificada",
  rating: 4.8,
  reviewCount: 12,
  experience: p.yearsOfExperience,
  bio: p.biography || "",
  languages: p.languages || [],
  education: [],
  prices: {
    video: p.consultationFee,
    presencial: p.consultationFee + 50,
    chat: p.consultationFee - 30,
  },
  schedule: {},
  reviews: [
    { id: "1", user: "María G.", avatar: "MG", rating: 5, date: "15/03/2026", comment: "Excelente profesional, muy empático y resolutivo." },
    { id: "2", user: "Carlos L.", avatar: "CL", rating: 4.5, date: "02/04/2026", comment: "Muy buena terapia, me ayudó mucho." },
    { id: "3", user: "Ana R.", avatar: "AR", rating: 5, date: "20/03/2026", comment: "Recomendado 100%. Profesional con mucha experiencia." }
  ],
  photo: "https://via.placeholder.com/120",
});

export default function PsychologistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [psychologist, setPsychologist] = useState<ReturnType<typeof mapPsychologistToLocal> | null>(null);
  const [schedule, setSchedule] = useState<PsychologistSchedule | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID de psicólogo no proporcionado");
      setLoading(false);
      return;
    }

    const fetchPsychologist = async () => {
      try {
        setLoading(true);
        const data = await userService.getPsychologistById(id);
        setPsychologist(mapPsychologistToLocal(data));

        try {
          const scheduleData = await userService.getPsychologistSchedule(id);
          setSchedule(scheduleData);
          const firstEnabledDay = scheduleData.days.find(d => d.enabled);
          if (firstEnabledDay) setSelectedDay(firstEnabledDay.dayOfWeek);
        } catch {
          setSchedule(null);
        }

        setError(null);
      } catch (err) {
        console.error("Error cargando psicólogo:", err);
        setError("No se pudo cargar la información del psicólogo");
      } finally {
        setLoading(false);
      }
    };

    fetchPsychologist();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: FOG }}>
        <Loader2 className="animate-spin" size={32} style={{ color: TEAL }} />
      </div>
    );
  }

  if (error || !psychologist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-slate-500 mb-4">{error || "Psicólogo no encontrado"}</p>
        <button onClick={() => navigate("/paciente/psicologos")} style={{ color: TEAL }}>
          Volver a la lista
        </button>
      </div>
    );
  }

  const modalities = [
    { key: "video", label: "Videollamada", icon: Video, price: psychologist.prices.video, color: TEAL, bg: FOG, desc: "Sesión online desde cualquier lugar" },
    { key: "presencial", label: "Presencial", icon: Users, price: psychologist.prices.presencial, color: SAGE, bg: "#E8F5F1", desc: "En el consultorio del psicólogo" },
    { key: "chat", label: "Chat", icon: MessageCircle, price: psychologist.prices.chat, color: "#0EA5E9", bg: "#F0F9FF", desc: "Mensajes en tiempo real" },
  ];

  const enabledDays = schedule?.days.filter(d => d.enabled) ?? [];
  const selectedDayData = enabledDays.find(d => d.dayOfWeek === selectedDay);
  const availableSlots = selectedDayData?.slots.filter(s => s.status === "AVAILABLE") ?? [];

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
              <img src={psychologist.photo} alt={psychologist.name} className="w-32 h-32 rounded-2xl object-cover shadow-xl" />
              {psychologist.verified && (
                <div className="absolute -bottom-2 -right-2 rounded-full p-1 border-2 border-white" style={{ background: TEAL }}>
                  <BadgeCheck size={16} className="text-white" strokeWidth={2} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-3 mb-2">
                <h1 className="text-white" style={{ fontSize: "1.75rem", fontWeight: 800 }}>{psychologist.name}</h1>
                {psychologist.verified && (
                  <span className="px-2.5 py-1 rounded-full flex items-center gap-1.5 mt-1" style={{ background: "rgba(255,255,255,0.15)", color: MINT, fontSize: "0.75rem", fontWeight: 500 }}>
                    <BadgeCheck size={12} />
                    Verificado
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {psychologist.specialties.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-full" style={{ background: "rgba(168,213,194,0.2)", color: MINT, fontSize: "0.8rem" }}>{s}</span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <StarRating rating={psychologist.rating} reviewCount={psychologist.reviewCount} size={15} />
                <div className="flex items-center gap-1" style={{ color: MINT, fontSize: "0.85rem" }}>
                  <MapPin size={14} /><span>{psychologist.location}</span>
                </div>
                <div className="flex items-center gap-1" style={{ color: MINT, fontSize: "0.85rem" }}>
                  <Clock size={14} /><span>{psychologist.experience} años de experiencia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Bio */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
              <h2 className="text-slate-900 mb-3" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Sobre mí</h2>
              <p className="text-slate-600 leading-relaxed" style={{ fontSize: "0.9rem" }}>
                {psychologist.bio || "Sin información adicional."}
              </p>
            </div>

            {/* Languages */}
            {psychologist.languages.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#F0F9FF" }}>
                    <Languages size={16} style={{ color: "#0EA5E9" }} />
                  </div>
                  <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Idiomas</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {psychologist.languages.map((l) => (
                    <span key={l} className="px-3 py-1.5 rounded-full" style={{ background: "#F0F9FF", color: "#0EA5E9", fontSize: "0.875rem", fontWeight: 500 }}>{l}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Availability with tabs */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#E8F5F1" }}>
                  <Calendar size={16} style={{ color: SAGE }} />
                </div>
                <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Disponibilidad</h2>
              </div>

              {enabledDays.length === 0 ? (
                <p className="text-slate-400" style={{ fontSize: "0.9rem" }}>Este psicólogo no tiene horarios configurados.</p>
              ) : (
                <>
                  {/* Day tabs */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {enabledDays.map((day) => {
                      const isSelected = selectedDay === day.dayOfWeek;
                      const availableCount = day.slots.filter(s => s.status === "AVAILABLE").length;
                      return (
                        <button
                          key={day.dayOfWeek}
                          onClick={() => setSelectedDay(day.dayOfWeek)}
                          className="px-4 py-2 rounded-xl transition-all"
                          style={{
                            background: isSelected ? TEAL : "#F1F5F9",
                            color: isSelected ? "white" : "#64748b",
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: "0.85rem",
                            border: `2px solid ${isSelected ? TEAL : "transparent"}`,
                          }}
                        >
                          {DAY_LABELS[day.dayOfWeek] ?? day.dayOfWeek}
                          <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs" style={{ background: isSelected ? "rgba(255,255,255,0.2)" : "#e2e8f0", color: isSelected ? "white" : "#94a3b8" }}>
                            {availableCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Slots for selected day */}
                  {availableSlots.length === 0 ? (
                    <p className="text-slate-400" style={{ fontSize: "0.875rem" }}>No hay horarios disponibles para este día.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {availableSlots.map((slot, idx) => {
                        const Icon = MODALITY_ICONS[slot.modality] ?? Video;
                        const color = MODALITY_COLORS[slot.modality] ?? TEAL;
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-xl border"
                            style={{ borderColor: "rgba(26,74,92,0.08)", background: "#F8FAFB" }}
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                              <Icon size={15} style={{ color }} />
                            </div>
                            <div>
                              <p className="text-slate-800" style={{ fontWeight: 700, fontSize: "0.9rem" }}>{slot.time}</p>
                              <p className="text-slate-400" style={{ fontSize: "0.72rem" }}>{slot.modality}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#FFF7ED" }}>
                  <Star size={16} className="text-amber-500 fill-amber-400" />
                </div>
                <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Reseñas ({psychologist.reviewCount})</h2>
              </div>
              <div className="flex items-center gap-4 mb-6 p-4 rounded-xl" style={{ background: FOG }}>
                <div className="text-center">
                  <p className="text-slate-900" style={{ fontWeight: 800, fontSize: "2.5rem", lineHeight: 1 }}>{psychologist.rating.toFixed(1)}</p>
                  <StarRating rating={psychologist.rating} size={14} showNumber={false} />
                  <p className="text-slate-400 mt-1" style={{ fontSize: "0.75rem" }}>{psychologist.reviewCount} reseñas</p>
                </div>
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    let pct = 0;
                    if (star === 5) pct = Math.min(80, psychologist.rating * 15);
                    else if (star === 4) pct = Math.min(60, psychologist.rating * 10);
                    else if (star === 3) pct = 10;
                    else if (star === 2) pct = 5;
                    else pct = 2;
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
                          <span style={{ color: TEAL, fontWeight: 700, fontSize: "0.75rem" }}>{review.avatar}</span>
                        </div>
                        <div>
                          <p className="text-slate-800" style={{ fontWeight: 600, fontSize: "0.875rem" }}>{review.user}</p>
                          <p className="text-slate-400" style={{ fontSize: "0.75rem" }}>{review.date}</p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size={12} showNumber={false} />
                    </div>
                    <p className="text-slate-600 leading-relaxed" style={{ fontSize: "0.875rem" }}>{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
                <h3 className="text-slate-900 mb-4" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Reservar sesión</h3>
                <div className="flex flex-col gap-3 mb-5">
                  {modalities.map((m) => (
                    <div key={m.key} className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: m.bg }}>
                        <m.icon size={18} style={{ color: m.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-800" style={{ fontWeight: 600, fontSize: "0.85rem" }}>{m.label}</p>
                        <p className="text-slate-400" style={{ fontSize: "0.75rem" }}>{m.desc}</p>
                      </div>
                      <span className="text-slate-900" style={{ fontWeight: 700, fontSize: "0.9rem" }}>${m.price}</span>
                    </div>
                  ))}
                </div>
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
                    <p style={{ color: SAGE, fontWeight: 600, fontSize: "0.8rem" }}>Disponibilidad en tiempo real</p>
                    <p style={{ color: "#4a8a74", fontSize: "0.75rem" }}>Los horarios se actualizan automáticamente</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl p-5 mt-4" style={{ background: "#F5EDD8" }}>
                <p className="text-slate-700 mb-3" style={{ fontWeight: 600, fontSize: "0.875rem" }}>Primera sesión sin costo adicional de evaluación</p>
                <p className="text-slate-500" style={{ fontSize: "0.8rem" }}>Programa tu primera consulta y descubre si hay compatibilidad terapéutica.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}