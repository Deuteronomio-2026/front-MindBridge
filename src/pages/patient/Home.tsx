import { useNavigate } from "react-router";
import { Search, Sparkles, Video, Users, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { psychologists, specialtyOptions } from "../../data/psychologists";
import { PsychologistCard } from "../../components/PsychologistCard";
import { useUser } from "../../hooks/useUser";
import { offerService } from "../../service/offerService";
import type { Offer as ApiOffer } from "../../service/offerService";

const TEAL = "#1A4A5C";
const TEAL_DARK = "#0D2E38";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const MINT = "#A8D5C2";

const QUICK_SPECIALTIES = specialtyOptions.slice(0, 8);

//const modalityIcon = {
  //video: Video,
  //presencial: Users,
  //chat: MessageCircle,
//};

export default function Home() {
  const navigate = useNavigate();
  const { appointments } = useUser();
  const [searchQuery, setSearchQuery] = useState("");

  const [activeOffer, setActiveOffer] = useState<{
    psychologistId: string;
    discountPercent: number;
    label: string;
    endDate: string;
  } | null>(null);

  const [loadingOffer, setLoadingOffer] = useState(true);

  useEffect(() => {
    offerService.getTakenOffers()
      .then((offers: ApiOffer[]) => {
        if (offers.length > 0) {
          const offer = offers[0];
          setActiveOffer({
            psychologistId: offer.psychologistId ?? "",
            discountPercent: 20,
            label: offer.title,
            endDate: offer.endDate,
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoadingOffer(false);
      });
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

  return (
    <div style={{ background: FOG }}>

      {/* ── HERO ── */}
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

            {/* 🔥 INPUT MEJORADO */}
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

      {/* ── BANNER DE OFERTA ── */}
      <section className="max-w-4xl mx-auto px-6 pt-8">
        <div className="bg-white border rounded-2xl p-5 shadow-sm">

          {loadingOffer ? (
            <p className="text-slate-400 text-sm">Cargando ofertas...</p>
          ) : activeOffer ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Oferta activa</p>
                <h3 className="font-bold text-lg">
                  {activeOffer.label}
                </h3>
                <p className="text-sm text-slate-500">
                  {activeOffer.discountPercent}% de descuento hasta {activeOffer.endDate}
                </p>
              </div>
              <Sparkles style={{ color: CORAL }} />
            </div>
          ) : (
            <div className="text-center">
              <p className="font-semibold text-slate-700">
                🎁 Próximamente ofertas especiales
              </p>
              <p className="text-sm text-slate-400">
                Estamos preparando beneficios exclusivos para ti
              </p>
            </div>
          )}

        </div>
      </section>

      {/* ── PRÓXIMA CITA ── */}
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

      {/* ── DESTACADO ── */}
      {featuredPsychologist && (
        <section className="max-w-4xl mx-auto px-6 pt-10">
          <h2 className="font-bold mb-3">Psicólogo destacado</h2>
          <PsychologistCard psychologist={featuredPsychologist} />
        </section>
      )}

      {/* ── OTROS ── */}
      <section className="max-w-4xl mx-auto px-6 pt-8 pb-14">
        <h2 className="font-bold mb-3">Mejor valorados</h2>
        <div className="grid grid-cols-3 gap-4">
          {regularFeatured.map((p) => (
            <PsychologistCard key={p.id} psychologist={p} />
          ))}
        </div>
      </section>

    </div>
  );
}