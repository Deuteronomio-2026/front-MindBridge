import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Sparkles, TrendingUp, Eye, Star, Users, CheckCircle,
  Clock, ChevronLeft, Lock, Zap,
} from "lucide-react";

const TEAL = "#1A4A5C";
const SAGE = "#4E8B7A";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const MINT = "#A8D5C2";

type OfferStatus = "available" | "subscribed" | "taken";

interface Offer {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  spotsTotal: number;
  spotsTaken: number;
  expiresAt: string; // ISO date
  createdAt: string;
  status: OfferStatus;
  boostMultiplier: number; // ej: 3 = 3x más visibilidad
}

const mockOffers: Offer[] = [
  {
    id: "off-1",
    title: "Boost de Visibilidad — Abril 2025",
    description:
      "El administrador de MindBridge ha creado una oferta exclusiva para un psicólogo. El primero en suscribirse aparecerá en la posición destacada del listado de pacientes durante todo el mes de abril, con un multiplicador de visibilidad 3×.",
    benefits: [
      "Apareces primero en el listado de búsqueda de pacientes",
      "Insignia de 'Destacado' visible en tu perfil",
      "3× más impresiones durante abril",
      "Notificación push enviada a pacientes que vieron tu perfil",
    ],
    spotsTotal: 1,
    spotsTaken: 0,
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: "available",
    boostMultiplier: 3,
  },
  {
    id: "off-2",
    title: "Campaña Salud Mental — Marzo 2025",
    description:
      "Oferta del mes de marzo ya cerrada. El psicólogo suscrito obtuvo visibilidad destacada durante todo el mes.",
    benefits: [
      "Posición destacada en el listado",
      "Banner en la página principal",
      "2× más impresiones",
    ],
    spotsTotal: 1,
    spotsTaken: 1,
    expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    status: "taken",
    boostMultiplier: 2,
  },
];

const statusMeta: Record<OfferStatus, { label: string; color: string; bg: string }> = {
  available: { label: "Disponible", color: SAGE, bg: "#E8F5F1" },
  subscribed: { label: "Suscrito ✓", color: TEAL, bg: FOG },
  taken: { label: "No disponible", color: "#94a3b8", bg: "#F1F5F9" },
};

function timeLeft(isoDate: string): string {
  const diff = new Date(isoDate).getTime() - Date.now();
  if (diff <= 0) return "Expirada";
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h restantes`;
  const days = Math.floor(hours / 24);
  return `${days}d restantes`;
}

export default function PsychOffers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>(mockOffers);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const activeOffer = offers.find((o) => o.status === "available");
  const pastOffers = offers.filter((o) => o.status === "taken" || o.status === "subscribed");

  const handleSubscribe = async (offerId: string) => {
    setSubscribing(offerId);
    // Simula llamada a la API
    await new Promise((r) => setTimeout(r, 1400));
    setOffers((prev) =>
      prev.map((o) =>
        o.id === offerId ? { ...o, status: "subscribed", spotsTaken: 1 } : o
      )
    );
    setSubscribing(null);
    setConfirming(null);
  };

  return (
    <div className="min-h-screen" style={{ background: FOG }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #0D2E38 0%, ${TEAL} 100%)` }} className="py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/panel-psicologo")}
            className="flex items-center gap-1.5 mb-5"
            style={{ color: MINT, fontSize: "0.85rem", fontWeight: 500 }}
          >
            <ChevronLeft size={16} /> Volver al panel
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <Sparkles size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-white" style={{ fontWeight: 800, fontSize: "1.8rem" }}>Ofertas de Visibilidad</h1>
              <p style={{ color: MINT, fontSize: "0.9rem", marginTop: 2 }}>
                Ofertas exclusivas creadas por el administrador de MindBridge
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">

        {/* Active offer */}
        {activeOffer ? (
          <div>
            <p className="text-slate-500 mb-3" style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Oferta activa
            </p>
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
              {/* Top accent */}
              <div style={{ height: 4, background: "linear-gradient(90deg, #F59E0B 0%, #F97316 100%)" }} />

              <div className="p-6">
                {/* Title row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="px-2.5 py-1 rounded-full"
                        style={{ background: "#FFF7ED", color: "#F59E0B", fontSize: "0.72rem", fontWeight: 700 }}
                      >
                        ¡NUEVO!
                      </span>
                      <span
                        className="px-2.5 py-1 rounded-full"
                        style={{ background: statusMeta[activeOffer.status].bg, color: statusMeta[activeOffer.status].color, fontSize: "0.72rem", fontWeight: 700 }}
                      >
                        {statusMeta[activeOffer.status].label}
                      </span>
                    </div>
                    <h2 className="text-slate-900" style={{ fontWeight: 800, fontSize: "1.15rem" }}>{activeOffer.title}</h2>
                  </div>

                  {/* Multiplier badge */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center rounded-2xl px-4 py-3" style={{ background: "linear-gradient(135deg, #F59E0B, #F97316)" }}>
                    <p className="text-white" style={{ fontWeight: 900, fontSize: "1.6rem", lineHeight: 1 }}>{activeOffer.boostMultiplier}×</p>
                    <p className="text-white/80" style={{ fontSize: "0.65rem", fontWeight: 600 }}>VISIBILIDAD</p>
                  </div>
                </div>

                <p className="text-slate-600 mb-5" style={{ fontSize: "0.88rem", lineHeight: 1.6 }}>
                  {activeOffer.description}
                </p>

                {/* Benefits */}
                <div className="rounded-xl p-4 mb-5" style={{ background: FOG }}>
                  <p className="text-slate-700 mb-3" style={{ fontWeight: 700, fontSize: "0.85rem" }}>¿Qué incluye?</p>
                  <div className="flex flex-col gap-2">
                    {activeOffer.benefits.map((b, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle size={15} style={{ color: SAGE, flexShrink: 0, marginTop: 1 }} />
                        <span className="text-slate-600" style={{ fontSize: "0.85rem" }}>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { icon: Users, label: "Spots", value: `${activeOffer.spotsTaken}/${activeOffer.spotsTotal}` },
                    { icon: Clock, label: "Tiempo", value: timeLeft(activeOffer.expiresAt) },
                    { icon: TrendingUp, label: "Boost", value: `${activeOffer.boostMultiplier}× alcance` },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="rounded-xl p-3 text-center border bg-white" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
                        <Icon size={16} style={{ color: TEAL, margin: "0 auto 4px" }} />
                        <p className="text-slate-900" style={{ fontWeight: 700, fontSize: "0.9rem" }}>{stat.value}</p>
                        <p className="text-slate-400" style={{ fontSize: "0.72rem" }}>{stat.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Urgency note */}
                <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-5" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                  <Zap size={15} style={{ color: CORAL, flexShrink: 0 }} />
                  <p style={{ color: "#B91C1C", fontSize: "0.82rem", fontWeight: 500 }}>
                    Solo <strong>1 spot disponible</strong>. El primer psicólogo en suscribirse obtiene el beneficio completo.
                  </p>
                </div>

                {/* CTA */}
                {confirming === activeOffer.id ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-center text-slate-600" style={{ fontSize: "0.85rem" }}>
                      ¿Confirmas tu suscripción a esta oferta?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setConfirming(null)}
                        className="flex-1 py-3 rounded-xl border font-semibold"
                        style={{ borderColor: "rgba(26,74,92,0.2)", color: "#64748b", fontSize: "0.88rem" }}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSubscribe(activeOffer.id)}
                        disabled={subscribing === activeOffer.id}
                        className="flex-1 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2"
                        style={{ background: subscribing === activeOffer.id ? SAGE : "linear-gradient(135deg, #F59E0B, #F97316)", fontSize: "0.88rem" }}
                      >
                        {subscribing === activeOffer.id ? (
                          <><span className="animate-spin">⏳</span> Procesando...</>
                        ) : (
                          <><Sparkles size={16} /> Confirmar suscripción</>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirming(activeOffer.id)}
                    className="w-full py-3.5 rounded-xl text-white flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #F59E0B 0%, #F97316 100%)", fontWeight: 700, fontSize: "0.95rem" }}
                  >
                    <Sparkles size={18} /> Suscribirme a esta oferta
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          // No active offers
          <div className="bg-white rounded-2xl p-10 text-center border shadow-sm" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: FOG }}>
              <Eye size={24} className="text-slate-300" />
            </div>
            <p className="text-slate-700" style={{ fontWeight: 700 }}>No hay ofertas activas en este momento</p>
            <p className="text-slate-400 mt-1" style={{ fontSize: "0.85rem" }}>
              El administrador publicará nuevas ofertas próximamente. Te notificaremos cuando haya una disponible.
            </p>
          </div>
        )}

        {/* Already subscribed success state */}
        {offers.find((o) => o.status === "subscribed") && (
          <div className="rounded-2xl p-5 flex items-center gap-4 border" style={{ background: "#E8F5F1", borderColor: "#A7D4C5" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: SAGE }}>
              <Star size={18} className="text-white" />
            </div>
            <div>
              <p style={{ color: TEAL, fontWeight: 700, fontSize: "0.9rem" }}>¡Estás suscrito!</p>
              <p style={{ color: "#4E8B7A", fontSize: "0.82rem" }}>
                Tu visibilidad está activa. Los pacientes te verán primero en el listado.
              </p>
            </div>
          </div>
        )}

        {/* Past offers */}
        {pastOffers.length > 0 && (
          <div>
            <p className="text-slate-500 mb-3" style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Ofertas anteriores
            </p>
            <div className="flex flex-col gap-3">
              {pastOffers.map((offer) => (
                <div key={offer.id} className="bg-white rounded-2xl p-5 border flex items-center gap-4" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#F1F5F9" }}>
                    <Lock size={16} className="text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700" style={{ fontWeight: 600, fontSize: "0.9rem" }}>{offer.title}</p>
                    <p className="text-slate-400" style={{ fontSize: "0.78rem" }}>
                      {offer.boostMultiplier}× visibilidad · Expirada
                    </p>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: statusMeta[offer.status].bg, color: statusMeta[offer.status].color, fontSize: "0.72rem", fontWeight: 600 }}
                  >
                    {statusMeta[offer.status].label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}