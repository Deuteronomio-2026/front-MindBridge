import { useNavigate } from "react-router";
import { Search, Sparkles, Loader2, Users, Clock, Calendar as CalendarIcon, UserPlus, Video, X } from "lucide-react";
import { useState, useEffect } from "react";
import { specialtyOptions } from "../../data/psychologists";
import { PsychologistCard } from "../../components/PsychologistCard";
import { useUser } from "../../hooks/useUser";
import { useRealUser } from "../../hooks/useRealUser";
import { offerService } from "../../service/offerService";
import { userService } from "../../service/userService";
import { groupSessionService, type GroupSession } from "../../service/groupSessionService";
import type { Psychologist } from "../../types/user";

const TEAL = "#1A4A5C";
const TEAL_DARK = "#0D2E38";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const MINT = "#A8D5C2";


const QUICK_SPECIALTIES = specialtyOptions.slice(0, 8);

const GROUP_IMAGES = ["/images/group/group-1.jpg"];

const getGroupImage = (sessionId: string) => {
  const hash = parseInt(sessionId.slice(0, 8), 16);
  const index = hash % GROUP_IMAGES.length;
  return GROUP_IMAGES[index];
};

const mapToMockFormat = (p: Psychologist) => ({
  id: p.id,
  name: `${p.name} ${p.lastName}`,
  title: p.specialization,
  specialties: [p.specialization],
  location: p.address || p.officeLocation || "Ubicación no especificada",
  rating: 4.5,
  reviewCount: 0,
  photo: "https://via.placeholder.com/120",
  verified: p.verificationStatus === "VERIFIED",
  experience: p.yearsOfExperience,
  bio: p.biography || "",
  education: [],
  languages: p.languages,
  prices: {
    video: p.consultationFee,
    presencial: p.consultationFee + 50,
    chat: p.consultationFee - 30,
  },
  schedule: {},
  reviews: [],
});

export default function Home() {
  const navigate = useNavigate();
  const { appointments } = useUser();
  const { profile } = useRealUser();
  const [searchQuery, setSearchQuery] = useState("");

  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [loadingPsychologists, setLoadingPsychologists] = useState(true);

  const [activeOffer, setActiveOffer] = useState<{
    psychologistId: string;
    discountPercent: number;
    label: string;
    endDate: string;
  } | null>(null);

  const [groupSessions, setGroupSessions] = useState<GroupSession[]>([]);
  const [loadingGroupSessions, setLoadingGroupSessions] = useState(true);
  const [enrollingSessionId, setEnrollingSessionId] = useState<string | null>(null);
  const [enrollSuccess, setEnrollSuccess] = useState<string | null>(null);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const [selectedSession, setSelectedSession] = useState<GroupSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPsychologists = async () => {
      try {
        const data = await userService.getPsychologists();
        setPsychologists(data);
      } catch (err) {
        console.error("Error cargando psicólogos:", err);
      } finally {
        setLoadingPsychologists(false);
      }
    };
    fetchPsychologists();
  }, []);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const offers = await offerService.getTakenOffers();
        if (offers.length > 0) {
          const offer = offers[0];
          setActiveOffer({
            psychologistId: offer.psychologistId ?? "",
            discountPercent: offer.discountPercent,
            label: offer.title,
            endDate: offer.endDate,
          });
        } else {
          setActiveOffer(null);
        }
      } catch (err) {
        console.error("Error cargando ofertas destacadas:", err);
        setActiveOffer(null);
      }
    };
    fetchOffers();
  }, []);

  useEffect(() => {
    const fetchGroupSessions = async () => {
      try {
        const sessions = await groupSessionService.getApprovedSessions();
        setGroupSessions(sessions);
      } catch (err) {
        console.error("Error cargando sesiones grupales:", err);
      } finally {
        setLoadingGroupSessions(false);
      }
    };
    fetchGroupSessions();
  }, []);

  const featuredPsychologist = activeOffer
    ? psychologists.find((p) => p.id === activeOffer.psychologistId)
    : null;

  const regularFeatured = psychologists
    .filter((p) => p.id !== activeOffer?.psychologistId)
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

  const handleEnroll = async (sessionId: string) => {
    if (!profile || !profile.id) {
      setEnrollError("Debes iniciar sesión como paciente para inscribirte.");
      setTimeout(() => setEnrollError(null), 4000);
      return;
    }
    const patientId = profile.id;
    setEnrollingSessionId(sessionId);
    setEnrollSuccess(null);
    setEnrollError(null);
    try {
      await groupSessionService.enrollInGroupSession(sessionId, patientId);
      setEnrollSuccess(sessionId);
      const updated = await groupSessionService.getApprovedSessions();
      setGroupSessions(updated);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "No se pudo completar la inscripción";
      setEnrollError(msg);
    } finally {
      setEnrollingSessionId(null);
      setTimeout(() => {
        setEnrollSuccess(null);
        setEnrollError(null);
      }, 4000);
    }
  };

  const openModal = (session: GroupSession) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  if (loadingPsychologists && psychologists.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: FOG }}>
        <Loader2 className="animate-spin" size={32} style={{ color: TEAL }} />
      </div>
    );
  }

  return (
    <div style={{ background: FOG }}>
      {/* Hero section (sin cambios) */}
      <section
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${TEAL_DARK} 0%, ${TEAL} 60%, #2D7D9A 100%)` }}
      >
        <div className="max-w-4xl mx-auto px-6 py-16 lg:py-20 text-center text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 mb-5"
            style={{ background: "rgba(255,255,255,0.1)" }}>
            <Sparkles size={13} style={{ color: CORAL }} />
            <span style={{ fontSize: "0.78rem" }}>
              +500 psicólogos certificados
            </span>
          </div>

          <h1 className="mb-4 font-extrabold text-3xl">
            Tu bienestar mental <span style={{ color: MINT }}>siempre accesible</span>
          </h1>

          <p className="mb-8 text-sm opacity-80 max-w-md mx-auto">
            Encuentra psicólogos verificados y agenda fácilmente
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-6">
            <div
              className="flex-1 flex items-center gap-3 rounded-xl px-4 shadow-md"
              style={{ background: "white" }}
            >
              <Search size={17} style={{ color: "#94A3B8" }} />
              <input
                type="text"
                placeholder="Busca por especialidad o nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-slate-800 outline-none py-3.5 placeholder-slate-400"
                style={{ fontSize: "0.9rem" }}
              />
            </div>

            <button
              type="submit"
              className="px-5 py-3 rounded-xl"
              style={{ background: CORAL, color: "white", fontWeight: 700 }}
            >
              Buscar
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_SPECIALTIES.map((s) => (
              <button
                key={s}
                onClick={() => navigate(`/paciente/psicologos?q=${s}`)}
                className="px-3 py-1 rounded-full border border-white/20 hover:bg-white/20"
                style={{ color: MINT, fontSize: "0.78rem" }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Próxima cita (mock) */}
      {nextAppointment && (
        <div className="max-w-4xl mx-auto px-6 pt-6">
          <div className="bg-white p-4 rounded-xl border">
            <p className="text-xs text-gray-500">Próxima sesión</p>
            <p className="font-bold">{nextAppointment.psychologistName}</p>
            <p className="text-sm text-gray-500">
              {formatNextDate(nextAppointment.date)} · {nextAppointment.time}
            </p>
          </div>
        </div>
      )}

      {/* Psicólogo destacado */}
      {featuredPsychologist && (
        <section className="max-w-4xl mx-auto px-6 pt-10">
          <h2 className="font-bold mb-3">Psicólogo destacado</h2>
          <PsychologistCard
            psychologist={mapToMockFormat(featuredPsychologist)}
            featuredOffer={{ discountPercent: activeOffer!.discountPercent, label: activeOffer!.label }}
          />
        </section>
      )}

      {/* Otros psicólogos destacados */}
      <section className="max-w-4xl mx-auto px-6 pt-8 pb-14">
        <h2 className="font-bold mb-3">Mejor valorados</h2>
        {regularFeatured.length === 0 ? (
          <p className="text-slate-400 text-center">No hay más psicólogos disponibles</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularFeatured.map((p) => (
              <PsychologistCard key={p.id} psychologist={mapToMockFormat(p)} />
            ))}
          </div>
        )}
      </section>

      {/* Sesiones grupales */}
      <section className="max-w-4xl mx-auto px-6 pt-8 pb-14 border-t" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
        <h2 className="font-bold mb-3">Sesiones Grupales</h2>
        {loadingGroupSessions ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin" size={28} style={{ color: TEAL }} />
          </div>
        ) : groupSessions.length === 0 ? (
          <p className="text-slate-400 text-center py-10">No hay sesiones grupales disponibles por el momento.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {groupSessions.map((session) => {
              const sessionImage = getGroupImage(session.id);
              const availableSpots = (session.maxParticipants ?? 0) - (session.currentParticipants ?? 0);
              return (
                <div key={session.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-md transition-shadow flex flex-col" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
                  <div className="h-40 relative">
                    <img
                      src={sessionImage}
                      alt={session.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = `https://picsum.photos/id/${Math.abs(parseInt(session.id.slice(0, 8), 16) % 80)}/400/200`;
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-semibold" style={{ color: TEAL }}>
                      {availableSpots} cupos libres
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-slate-900 font-bold text-lg">{session.title}</h3>
                    {/* Descripción eliminada: ya no se muestra en la tarjeta */}
                    <div className="mt-3 space-y-1 text-slate-500 text-xs">
                      <div className="flex items-center gap-2"><CalendarIcon size={14} /> {new Date(session.scheduledAt).toLocaleDateString()}</div>
                      <div className="flex items-center gap-2"><Clock size={14} /> {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {session.durationMinutes} min</div>
                      <div className="flex items-center gap-2"><Users size={14} /> {(session.currentParticipants ?? 0)} / {(session.maxParticipants ?? 0)} inscritos</div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleEnroll(session.id)}
                        disabled={enrollingSessionId === session.id || (session.currentParticipants ?? 0) >= (session.maxParticipants ?? 0)}
                        className={`flex-1 py-2 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all ${(session.currentParticipants ?? 0) >= (session.maxParticipants ?? 0) ? 'bg-gray-400 cursor-not-allowed' : 'hover:opacity-90'}`}
                        style={{ background: CORAL }}
                      >
                        {enrollingSessionId === session.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <UserPlus size={16} />
                        )}
                        {enrollingSessionId === session.id ? "Inscribiendo..." : (session.currentParticipants ?? 0) >= (session.maxParticipants ?? 0) ? "Llena" : "Inscribirse"}
                      </button>
                      <button
                        onClick={() => openModal(session)}
                        className="px-3 py-2 rounded-xl border border-teal-200 text-teal-700 font-semibold text-sm hover:bg-teal-50 transition-colors"
                      >
                        Ver detalles
                      </button>
                    </div>

                    {enrollSuccess === session.id && (
                      <p className="text-green-600 text-xs mt-2 text-center">¡Inscripción exitosa!</p>
                    )}
                    {enrollError && (
                      <p className="text-red-500 text-xs mt-2 text-center">{enrollError}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal de detalles (sin cambios, aquí sí se muestra la descripción) */}
      {isModalOpen && selectedSession && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
              <h2 className="text-xl font-bold text-slate-900">Detalles de la sesión</h2>
              <button onClick={closeModal} className="p-1 rounded-full hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <img
                src={getGroupImage(selectedSession.id)}
                alt={selectedSession.title}
                className="w-full h-48 object-cover rounded-xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = `https://picsum.photos/id/${Math.abs(parseInt(selectedSession.id.slice(0, 8), 16) % 80)}/400/200`;
                }}
              />
              <div>
                <h3 className="text-slate-900 font-bold text-lg">{selectedSession.title}</h3>
                <p className="text-slate-600 text-sm mt-1">{selectedSession.description}</p>
              </div>
              <div className="space-y-2 text-slate-600 text-sm">
                <div className="flex items-center gap-2"><CalendarIcon size={16} className="text-teal-600" /> <span className="font-medium">Fecha:</span> {new Date(selectedSession.scheduledAt).toLocaleDateString()}</div>
                <div className="flex items-center gap-2"><Clock size={16} className="text-teal-600" /> <span className="font-medium">Hora:</span> {new Date(selectedSession.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="flex items-center gap-2"><Clock size={16} className="text-teal-600" /> <span className="font-medium">Duración:</span> {selectedSession.durationMinutes} minutos</div>
                <div className="flex items-center gap-2"><Users size={16} className="text-teal-600" /> <span className="font-medium">Participantes:</span> {(selectedSession.currentParticipants ?? 0)} / {(selectedSession.maxParticipants ?? 0)}</div>
                <div className="flex items-center gap-2"><Video size={16} className="text-teal-600" /> <span className="font-medium">Psicólogo:</span> {selectedSession.psychologistId.substring(0, 8)}... (próximamente nombre)</div>
              </div>
              <div className="pt-3 flex gap-3">
                <button
                  onClick={() => {
                    handleEnroll(selectedSession.id);
                    closeModal();
                  }}
                  disabled={enrollingSessionId === selectedSession.id || (selectedSession.currentParticipants ?? 0) >= (selectedSession.maxParticipants ?? 0)}
                  className={`flex-1 py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 ${(selectedSession.currentParticipants ?? 0) >= (selectedSession.maxParticipants ?? 0) ? 'bg-gray-400 cursor-not-allowed' : 'hover:opacity-90'}`}
                  style={{ background: CORAL }}
                >
                  {enrollingSessionId === selectedSession.id ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                  {enrollingSessionId === selectedSession.id ? "Inscribiendo..." : (selectedSession.currentParticipants ?? 0) >= (selectedSession.maxParticipants ?? 0) ? "Llena" : "Inscribirme"}
                </button>
                <button
                  onClick={() => alert("🔜 Próximamente: videollamada grupal disponible aquí")}
                  className="flex-1 py-2.5 rounded-xl border border-teal-300 text-teal-700 font-semibold flex items-center justify-center gap-2 hover:bg-teal-50"
                >
                  <Video size={16} /> Unirse a videollamada
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}