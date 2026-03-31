import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft, ArrowRight, Video, Users, MessageCircle,
  Check, Clock, RefreshCw, Calendar, UserPlus, RotateCcw
} from "lucide-react";
import { psychologists, dayNames, dayFromDate } from "../../data/psychologists";
import { useUser } from "../../hooks/useUser";
import { StarRating } from "../../components/StarRating";

const TEAL = "#1A4A5C";
const SAGE = "#4E8B7A";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const MINT = "#A8D5C2";

type SessionType = "primera" | "seguimiento";
type Modality = "video" | "presencial" | "chat";

interface SlotStatus {
  time: string;
  available: boolean;
}

function generateInitialBookedSlots(slots: string[]): string[] {
  return slots.filter(() => Math.random() > 0.6);
}

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addAppointment } = useUser();

  const psychologist = psychologists.find((p) => p.id === id);

  const [step, setStep] = useState(1);
  const [sessionType, setSessionType] = useState<SessionType | null>(null);
  const [modality, setModality] = useState<Modality | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<Record<string, string[]>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  }).filter((d) => {
    const dayKey = dayFromDate(d);
    return psychologist && (psychologist.schedule[dayKey]?.length ?? 0) > 0;
  });

  useEffect(() => {
    if (!psychologist) return;
    const initial: Record<string, string[]> = {};
    availableDates.forEach((d) => {
      const dayKey = dayFromDate(d);
      const slots = psychologist.schedule[dayKey] || [];
      initial[d.toDateString()] = generateInitialBookedSlots(slots);
    });
    setBookedSlots(initial);
  }, [psychologist?.id]);

  useEffect(() => {
    if (!psychologist) return;
    const interval = setInterval(() => {
      setIsUpdating(true);
      setTimeout(() => {
        setBookedSlots((prev) => {
          const updated = { ...prev };
          availableDates.forEach((d) => {
            const dayKey = dayFromDate(d);
            const slots = psychologist.schedule[dayKey] || [];
            if (Math.random() > 0.7) {
              updated[d.toDateString()] = generateInitialBookedSlots(slots);
            }
          });
          return updated;
        });
        setLastUpdated(new Date());
        setIsUpdating(false);
        if (selectedDate && selectedTime) {
          const key = selectedDate.toDateString();
          setBookedSlots((prev) => {
            if (prev[key]?.includes(selectedTime)) {
              setSelectedTime(null);
            }
            return prev;
          });
        }
      }, 600);
    }, 30000);
    return () => clearInterval(interval);
  }, [psychologist?.id, selectedDate, selectedTime]);

  if (!psychologist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-slate-500 mb-4">Psicólogo no encontrado</p>
        <button onClick={() => navigate("/paciente/psicologos")} style={{ color: TEAL }}>
          Volver
        </button>
      </div>
    );
  }

  const getDaySlots = (date: Date): SlotStatus[] => {
    const dayKey = dayFromDate(date);
    const allSlots = psychologist.schedule[dayKey] || [];
    const booked = bookedSlots[date.toDateString()] || [];
    return allSlots.map((time) => ({ time, available: !booked.includes(time) }));
  };

  const modalityOptions = [
    {
      key: "video" as Modality,
      label: "Videollamada",
      icon: Video,
      price: psychologist.prices.video,
      color: TEAL,
      bg: FOG,
      desc: "Sesión online desde cualquier lugar",
    },
    {
      key: "presencial" as Modality,
      label: "Presencial",
      icon: Users,
      price: psychologist.prices.presencial,
      color: SAGE,
      bg: "#E8F5F1",
      desc: `En el consultorio · ${psychologist.location}`,
    },
    {
      key: "chat" as Modality,
      label: "Chat",
      icon: MessageCircle,
      price: psychologist.prices.chat,
      color: "#0EA5E9",
      bg: "#F0F9FF",
      desc: "Mensajes de texto en tiempo real",
    },
  ];

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime || !sessionType || !modality) return;
    const appointment = {
      id: `apt-${Date.now()}`,
      psychologistId: psychologist.id,
      psychologistName: `${psychologist.title} ${psychologist.name}`,
      psychologistPhoto: psychologist.photo,
      specialty: psychologist.specialties[0],
      sessionType,
      modality,
      date: selectedDate.toISOString().split("T")[0],
      time: selectedTime,
      price: psychologist.prices[modality],
      status: "upcoming" as const,
    };
    addAppointment(appointment);
    setConfirmed(true);
  };

  const steps = [
    { num: 1, label: "Tipo" },
    { num: 2, label: "Modalidad" },
    { num: 3, label: "Horario" },
    { num: 4, label: "Confirmar" },
  ];

  const formatDate = (date: Date) =>
    date.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });

  // SUCCESS STATE
  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: FOG }}>
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-lg border" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "#E8F5F1" }}>
            <Check size={36} style={{ color: SAGE }} strokeWidth={2.5} />
          </div>
          <h2 className="text-slate-900 mb-2" style={{ fontWeight: 800, fontSize: "1.5rem" }}>
            ¡Cita reservada!
          </h2>
          <p className="text-slate-500 mb-8" style={{ fontSize: "0.9rem" }}>
            Tu cita con <strong>{psychologist.title} {psychologist.name}</strong> ha sido confirmada exitosamente.
          </p>
          <div className="rounded-2xl p-5 text-left mb-8" style={{ background: FOG }}>
            <div className="flex items-center gap-3 mb-4">
              <img src={psychologist.photo} alt="" className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <p className="text-slate-900" style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                  {psychologist.title} {psychologist.name}
                </p>
                <p style={{ color: TEAL, fontSize: "0.8rem" }}>
                  {psychologist.specialties[0]}
                </p>
              </div>
            </div>
            {[
              { label: "Tipo de sesión", value: sessionType === "primera" ? "Primera sesión" : "Sesión de seguimiento" },
              { label: "Modalidad", value: modality === "video" ? "Videollamada" : modality === "presencial" ? "Presencial" : "Chat" },
              { label: "Fecha", value: selectedDate ? formatDate(selectedDate) : "" },
              { label: "Hora", value: selectedTime || "" },
              { label: "Precio", value: `$${psychologist.prices[modality!]} USD` },
            ].map((item) => (
              <div key={item.label} className="flex justify-between py-1.5 border-b last:border-0" style={{ borderColor: "rgba(26,74,92,0.07)" }}>
                <span className="text-slate-500" style={{ fontSize: "0.825rem" }}>{item.label}</span>
                <span className="text-slate-800" style={{ fontWeight: 600, fontSize: "0.825rem" }}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/paciente/mis-citas")}
              className="w-full py-3.5 text-white rounded-xl transition-colors hover:opacity-90"
              style={{ background: TEAL, fontWeight: 700 }}
            >
              Ver mis citas
            </button>
            <button
              onClick={() => navigate("/paciente/psicologos")}
              className="w-full py-3 text-slate-500 hover:text-slate-700 transition-colors"
              style={{ fontSize: "0.875rem" }}
            >
              Buscar otro psicólogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: FOG }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #0D2E38 0%, ${TEAL} 100%)` }} className="py-8 px-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(`/paciente/psicologo/${psychologist.id}`)}
            className="flex items-center gap-2 mb-5 transition-colors hover:text-white"
            style={{ color: MINT, fontSize: "0.875rem" }}
          >
            <ArrowLeft size={16} />
            Volver al perfil
          </button>

          <div className="flex items-center gap-4 mb-8">
            <img src={psychologist.photo} alt="" className="w-14 h-14 rounded-xl object-cover shadow-md" />
            <div>
              <h1 className="text-white" style={{ fontWeight: 700, fontSize: "1.2rem" }}>
                Reservar con {psychologist.title} {psychologist.name}
              </h1>
              <p style={{ color: MINT, fontSize: "0.85rem" }}>
                {psychologist.specialties.join(" · ")}
              </p>
            </div>
          </div>

          {/* Progress steps */}
          <div className="flex items-center gap-2">
            {steps.map((s, idx) => (
              <div key={s.num} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: step > s.num ? SAGE : step === s.num ? "white" : "rgba(255,255,255,0.2)",
                    }}
                  >
                    {step > s.num ? (
                      <Check size={13} className="text-white" strokeWidth={3} />
                    ) : (
                      <span
                        style={{ color: step === s.num ? TEAL : "rgba(255,255,255,0.5)", fontSize: "0.75rem", fontWeight: 700 }}
                      >
                        {s.num}
                      </span>
                    )}
                  </div>
                  <span
                    className={`hidden sm:block ${step >= s.num ? "text-white" : "text-white/40"}`}
                    style={{ fontSize: "0.78rem", fontWeight: step === s.num ? 600 : 400 }}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className="flex-1 h-px mx-2"
                    style={{ background: step > s.num ? `${SAGE}80` : "rgba(255,255,255,0.2)" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <h2 className="text-slate-900 mb-2" style={{ fontWeight: 800, fontSize: "1.4rem" }}>
              ¿Qué tipo de sesión necesitas?
            </h2>
            <p className="text-slate-500 mb-7" style={{ fontSize: "0.9rem" }}>
              Esto nos ayuda a preparar la sesión de la mejor manera para ti.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                {
                  key: "primera" as SessionType,
                  icon: UserPlus,
                  title: "Primera sesión",
                  desc: "Es la primera vez que hablaré con este psicólogo. Quiero comenzar un proceso terapéutico.",
                  badge: "Evaluación inicial",
                  badgeColor: "teal",
                },
                {
                  key: "seguimiento" as SessionType,
                  icon: RotateCcw,
                  title: "Sesión de seguimiento",
                  desc: "Ya he tenido sesiones anteriores y quiero continuar mi proceso terapéutico.",
                  badge: "Continuación",
                  badgeColor: "sage",
                },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSessionType(opt.key)}
                  className="p-5 rounded-2xl border-2 text-left transition-all"
                  style={{
                    borderColor: sessionType === opt.key ? TEAL : "rgba(26,74,92,0.15)",
                    background: sessionType === opt.key ? FOG : "white",
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: sessionType === opt.key ? "#C8DDE8" : "#f1f5f9" }}
                    >
                      <opt.icon size={20} style={{ color: sessionType === opt.key ? TEAL : "#94a3b8" }} />
                    </div>
                    {sessionType === opt.key && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: TEAL }}>
                        <Check size={12} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <p className="mb-1.5" style={{ fontWeight: 700, fontSize: "1rem", color: sessionType === opt.key ? TEAL : "#1e293b" }}>
                    {opt.title}
                  </p>
                  <p style={{ color: sessionType === opt.key ? "#2d6a8a" : "#64748b", fontSize: "0.825rem", lineHeight: 1.5 }}>
                    {opt.desc}
                  </p>
                  <span
                    className="inline-block mt-3 px-2.5 py-0.5 rounded-full"
                    style={{
                      background: opt.badgeColor === "teal" ? "#EAF2F5" : "#E8F5F1",
                      color: opt.badgeColor === "teal" ? TEAL : SAGE,
                      fontSize: "0.72rem",
                      fontWeight: 600,
                    }}
                  >
                    {opt.badge}
                  </span>
                </button>
              ))}
            </div>
            <button
              disabled={!sessionType}
              onClick={() => setStep(2)}
              className="w-full py-4 text-white rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: TEAL, fontWeight: 700, fontSize: "0.95rem" }}
            >
              Continuar <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <h2 className="text-slate-900 mb-2" style={{ fontWeight: 800, fontSize: "1.4rem" }}>
              Elige la modalidad de tu sesión
            </h2>
            <p className="text-slate-500 mb-7" style={{ fontSize: "0.9rem" }}>
              Cada modalidad tiene un precio diferente. Selecciona la que prefieras.
            </p>
            <div className="flex flex-col gap-4 mb-8">
              {modalityOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setModality(opt.key)}
                  className="p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4"
                  style={{
                    borderColor: modality === opt.key ? TEAL : "rgba(26,74,92,0.15)",
                    background: modality === opt.key ? FOG : "white",
                  }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: opt.bg }}>
                    <opt.icon size={22} style={{ color: opt.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="mb-0.5" style={{ fontWeight: 700, fontSize: "0.95rem", color: modality === opt.key ? TEAL : "#1e293b" }}>
                      {opt.label}
                    </p>
                    <p style={{ color: modality === opt.key ? "#2d6a8a" : "#64748b", fontSize: "0.825rem" }}>
                      {opt.desc}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p style={{ fontWeight: 800, fontSize: "1.1rem", color: modality === opt.key ? TEAL : "#1e293b" }}>
                      ${opt.price}
                    </p>
                    <p className="text-slate-400" style={{ fontSize: "0.72rem" }}>por sesión</p>
                  </div>
                  {modality === opt.key && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: TEAL }}>
                      <Check size={12} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-4 border rounded-xl transition-colors"
                style={{ borderColor: "rgba(26,74,92,0.2)", color: "#64748b", fontWeight: 600 }}
              >
                <ArrowLeft size={16} />
              </button>
              <button
                disabled={!modality}
                onClick={() => setStep(3)}
                className="flex-1 py-4 text-white rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: TEAL, fontWeight: 700, fontSize: "0.95rem" }}
              >
                Continuar <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <div className="flex items-start justify-between mb-7">
              <div>
                <h2 className="text-slate-900 mb-1" style={{ fontWeight: 800, fontSize: "1.4rem" }}>
                  Selecciona fecha y hora
                </h2>
                <p className="text-slate-500" style={{ fontSize: "0.9rem" }}>
                  Los horarios disponibles se actualizan en tiempo real.
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "#E8F5F1" }}>
                {isUpdating ? (
                  <RefreshCw size={12} style={{ color: SAGE }} className="animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: SAGE }} />
                )}
                <span style={{ color: SAGE, fontSize: "0.72rem", fontWeight: 600 }}>
                  {isUpdating ? "Actualizando..." : "En vivo"}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-slate-700 mb-3" style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                <Calendar size={14} className="inline mr-1.5" style={{ color: TEAL }} />
                Fechas disponibles
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {availableDates.map((date) => {
                  const dayKey = dayFromDate(date);
                  const slots = getDaySlots(date);
                  const availableCount = slots.filter((s) => s.available).length;
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                      className="flex-shrink-0 w-16 py-3 rounded-xl border-2 text-center transition-all"
                      style={{
                        borderColor: isSelected ? TEAL : "rgba(26,74,92,0.2)",
                        background: isSelected ? TEAL : "white",
                      }}
                    >
                      <p className="capitalize" style={{ color: isSelected ? `${MINT}CC` : "#94a3b8", fontSize: "0.7rem", fontWeight: 600 }}>
                        {dayNames[dayKey]?.slice(0, 3) || ""}
                      </p>
                      <p style={{ color: isSelected ? "white" : "#1e293b", fontWeight: 800, fontSize: "1.1rem" }}>
                        {date.getDate()}
                      </p>
                      <p style={{ color: isSelected ? MINT : availableCount > 0 ? SAGE : "#94a3b8", fontSize: "0.65rem" }}>
                        {availableCount > 0 ? `${availableCount} libre${availableCount > 1 ? "s" : ""}` : "lleno"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-700" style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                    <Clock size={14} className="inline mr-1.5" style={{ color: TEAL }} />
                    Horarios disponibles · {formatDate(selectedDate)}
                  </p>
                  <p className="text-slate-400" style={{ fontSize: "0.75rem" }}>
                    Actualizado {lastUpdated.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {getDaySlots(selectedDate).map(({ time, available }) => (
                    <button
                      key={time}
                      disabled={!available}
                      onClick={() => setSelectedTime(time)}
                      className="py-3 rounded-xl border-2 text-center transition-all"
                      style={{
                        borderColor: !available ? "rgba(26,74,92,0.06)" : selectedTime === time ? TEAL : "rgba(26,74,92,0.18)",
                        background: !available ? "#f8fafc" : selectedTime === time ? TEAL : "white",
                        color: !available ? "#cbd5e1" : selectedTime === time ? "white" : "#334155",
                        cursor: !available ? "not-allowed" : "pointer",
                        fontWeight: selectedTime === time ? 700 : 500,
                        fontSize: "0.875rem",
                      }}
                    >
                      {time}
                      {!available && (
                        <span className="block text-slate-300" style={{ fontSize: "0.65rem" }}>Ocupado</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!selectedDate && (
              <div className="text-center py-10 bg-white rounded-2xl border border-dashed mb-6" style={{ borderColor: "rgba(26,74,92,0.2)" }}>
                <Calendar size={28} className="text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400" style={{ fontSize: "0.875rem" }}>
                  Selecciona una fecha para ver los horarios disponibles
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-4 border rounded-xl transition-colors"
                style={{ borderColor: "rgba(26,74,92,0.2)", color: "#64748b", fontWeight: 600 }}
              >
                <ArrowLeft size={16} />
              </button>
              <button
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep(4)}
                className="flex-1 py-4 text-white rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: TEAL, fontWeight: 700, fontSize: "0.95rem" }}
              >
                Continuar <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div>
            <h2 className="text-slate-900 mb-2" style={{ fontWeight: 800, fontSize: "1.4rem" }}>
              Resumen de tu reserva
            </h2>
            <p className="text-slate-500 mb-7" style={{ fontSize: "0.9rem" }}>
              Revisa los detalles antes de confirmar tu cita.
            </p>

            <div className="bg-white rounded-2xl p-5 border shadow-sm mb-4" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
              <div className="flex items-center gap-4">
                <img src={psychologist.photo} alt="" className="w-16 h-16 rounded-xl object-cover" />
                <div>
                  <p className="text-slate-900" style={{ fontWeight: 700, fontSize: "1rem" }}>
                    {psychologist.title} {psychologist.name}
                  </p>
                  <p style={{ color: TEAL, fontSize: "0.825rem" }}>
                    {psychologist.specialties.join(" · ")}
                  </p>
                  <StarRating rating={psychologist.rating} reviewCount={psychologist.reviewCount} size={12} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border shadow-sm mb-4" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
              {[
                { label: "Tipo de sesión", value: sessionType === "primera" ? "Primera sesión" : "Sesión de seguimiento" },
                { label: "Modalidad", value: modality === "video" ? "Videollamada" : modality === "presencial" ? "Presencial" : "Chat" },
                { label: "Fecha", value: selectedDate ? formatDate(selectedDate) : "" },
                { label: "Hora", value: selectedTime ? `${selectedTime} hrs` : "" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-2.5 border-b last:border-0" style={{ borderColor: "rgba(26,74,92,0.07)" }}>
                  <span className="text-slate-500" style={{ fontSize: "0.875rem" }}>{item.label}</span>
                  <span className="text-slate-800" style={{ fontWeight: 600, fontSize: "0.875rem" }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-5 mb-8" style={{ background: FOG }}>
              <div className="flex items-center justify-between">
                <span className="text-slate-700" style={{ fontWeight: 600, fontSize: "1rem" }}>Total a pagar</span>
                <span style={{ color: TEAL, fontWeight: 800, fontSize: "1.5rem" }}>
                  ${modality ? psychologist.prices[modality] : 0} USD
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-4 border rounded-xl transition-colors"
                style={{ borderColor: "rgba(26,74,92,0.2)", color: "#64748b", fontWeight: 600 }}
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-4 text-white rounded-xl transition-colors flex items-center justify-center gap-2 hover:opacity-90"
                style={{ background: CORAL, fontWeight: 700, fontSize: "0.95rem" }}
              >
                <Check size={18} />
                Confirmar cita
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
