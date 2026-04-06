import { useNavigate } from "react-router";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { specialtyOptions } from "../../data/psychologists";
import { PsychologistCard } from "../../components/PsychologistCard";
import { useUser } from "../../hooks/useUser";
import { offerService } from "../../service/offerService";
import { userService } from "../../service/userService";
import type { Psychologist } from "../../types/user";

const TEAL = "#1A4A5C";
const TEAL_DARK = "#0D2E38";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const MINT = "#A8D5C2";

const QUICK_SPECIALTIES = specialtyOptions.slice(0, 8);

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
  const [searchQuery, setSearchQuery] = useState("");

  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [loadingPsychologists, setLoadingPsychologists] = useState(true);

  const [activeOffer, setActiveOffer] = useState<{
    psychologistId: string;
    discountPercent: number;
    label: string;
    endDate: string;
  } | null>(null);

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
      // finally vacío eliminado
    };
    fetchOffers();
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

  if (loadingPsychologists && psychologists.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: FOG }}>
        <Loader2 className="animate-spin" size={32} style={{ color: TEAL }} />
      </div>
    );
  }

  return (
    <div style={{ background: FOG }}>
      {/* Hero section */}
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
    </div>
  );
}