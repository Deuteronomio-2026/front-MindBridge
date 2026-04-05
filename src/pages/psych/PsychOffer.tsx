import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Sparkles, TrendingUp, Star, Users, CheckCircle,
  Clock, ChevronLeft, Lock, Zap, BadgeDollarSign,
} from "lucide-react";
import { offerService } from "../../service/offerService";
import type { Offer as ApiOffer } from "../../service/offerService";

const TEAL = "#1A4A5C";
const SAGE = "#4E8B7A";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const MINT = "#A8D5C2";

const PSYCHOLOGIST_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa7";

type OfferStatus = "available" | "subscribed" | "taken";

interface Offer {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  boostMultiplier: number;
  discountPercent: number;
  spotsTotal: number;
  spotsTaken: number;
  expiresAt: string;
  status: OfferStatus;
}

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
  return `${Math.floor(hours / 24)}d restantes`;
}

function mapApiToOffer(api: ApiOffer): Offer {
  const isTaken = api.status === "TAKEN";
  const isSubscribed = api.psychologistId === PSYCHOLOGIST_ID;
  return {
    id: api.id,
    title: api.title,
    description: api.description,
    benefits: api.benefits,
    boostMultiplier: api.boostMultiplier,
    discountPercent: api.discountPercent,
    spotsTotal: 1,
    spotsTaken: isTaken ? 1 : 0,
    expiresAt: api.endDate,
    status: isSubscribed ? "subscribed" : isTaken ? "taken" : "available",
  };
}

export default function PsychOffers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const [active, taken] = await Promise.all([
          offerService.getActiveOffers(),
          offerService.getTakenOffers(),
        ]);
        const all = [...active, ...taken].map(mapApiToOffer);
        setOffers(all);
      } catch {
        setError("No se pudieron cargar las ofertas. Verifica tu conexión.");
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const activeOffer = offers.find((o) => o.status === "available");
  const pastOffers = offers.filter((o) => o.status === "taken" || o.status === "subscribed");
  const isSubscribed = offers.some((o) => o.status === "subscribed");

  const handleSubscribe = async (offerId: string) => {
    setSubscribing(offerId);
    try {
      await offerService.subscribeOffer(offerId, PSYCHOLOGIST_ID);
      setOffers((prev) =>
        prev.map((o) => o.id === offerId ? { ...o, status: "subscribed", spotsTaken: 1 } : o)
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("409") || message.includes("conflict")) {
        setError("Alguien más se suscribió primero. La oferta ya no está disponible.");
        setOffers((prev) =>
          prev.map((o) => o.id === offerId ? { ...o, status: "taken", spotsTaken: 1 } : o)
        );
      } else {
        setError("Error al suscribirse. Intenta de nuevo.");
      }
    } finally {
      setSubscribing(null);
      setConfirming(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: FOG }}>
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: TEAL, borderTopColor: "transparent" }} />
          <p className="text-slate-500" style={{ fontSize: "0.9rem" }}>Cargando ofertas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: FOG }}>
      <div style={{ background: `linear-gradient(135deg, #0D2E38 0%, ${TEAL} 100%)` }} className="py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate("/panel-psicologo")}
            className="flex items-center gap-1.5 mb-5"
            style={{ color: MINT, fontSize: "0.85rem", fontWeight: 500 }}>
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

        {error && (
          <div className="rounded-xl px-4 py-3 border" style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#B91C1C", fontSize: "0.875rem" }}>
            {error}
            <button onClick={() => setError(null)} className="ml-3 underline" style={{ fontSize: "0.8rem" }}>Cerrar</button>
          </div>
        )}

        {isSubscribed && (
          <div className="rounded-2xl p-5 flex items-center gap-4 border" style={{ background: "#E8F5F1", borderColor: "#A7D4C5" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: SAGE }}>
              <Star size={18} className="text-white" />
            </div>
            <div>
              <p style={{ color: TEAL, fontWeight: 700, fontSize: "0.9rem" }}>¡Estás suscrito!</p>
              <p style={{ color: "#4E8B7A", fontSize: "0.82rem" }}>
                Tu visibilidad está activa. Los pacientes te ven primero en el listado con descuento aplicado.
              </p>
            </div>
          </div>
        )}

        {activeOffer ? (
          <div>
            <p className="text-slate-500 mb-3" style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Oferta activa
            </p>
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
              <div style={{ height: 4, background: "linear-gradient(90deg, #F59E0B 0%, #F97316 100%)" }} />
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded-full" style={{ background: "#FFF7ED", color: "#F59E0B", fontSize: "0.72rem", fontWeight: 700 }}>¡NUEVO!</span>
                      <span className="px-2.5 py-1 rounded-full" style={{ background: statusMeta[activeOffer.status].bg, color: statusMeta[activeOffer.status].color, fontSize: "0.72rem", fontWeight: 700 }}>
                        {statusMeta[activeOffer.status].label}
                      </span>
                    </div>
                    <h2 className="text-slate-900" style={{ fontWeight: 800, fontSize: "1.15rem" }}>{activeOffer.title}</h2>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-center justify-center rounded-2xl px-4 py-3"
                    style={{ background: "linear-gradient(135deg, #F59E0B, #F97316)" }}>
                    <p className="text-white" style={{ fontWeight: 900, fontSize: "1.6rem", lineHeight: 1 }}>{activeOffer.boostMultiplier}×</p>
                    <p className="text-white/80" style={{ fontSize: "0.65rem", fontWeight: 600 }}>VISIBILIDAD</p>
                  </div>
                </div>

                <p className="text-slate-600 mb-5" style={{ fontSize: "0.88rem", lineHeight: 1.6 }}>
                  {activeOffer.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  <div className="rounded-xl p-4" style={{ background: "#E8F5F1" }}>
                    <p className="mb-2" style={{ color: SAGE, fontWeight: 700, fontSize: "0.82rem" }}>Lo que ganas</p>
                    <div className="flex flex-col gap-1.5">
                      {activeOffer.benefits.map((b, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle size={13} style={{ color: SAGE, flexShrink: 0, marginTop: 1 }} />
                          <span className="text-slate-600" style={{ fontSize: "0.8rem" }}>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: "#FFF7ED" }}>
                    <p className="mb-2" style={{ color: "#B45309", fontWeight: 700, fontSize: "0.82rem" }}>Lo que cedes</p>
                    <div className="flex items-center gap-2 mb-2">
                      <BadgeDollarSign size={22} style={{ color: CORAL, flexShrink: 0 }} />
                      <p style={{ color: "#92400E", fontWeight: 800, fontSize: "1.4rem" }}>{activeOffer.discountPercent}%</p>
                    </div>
                    <p style={{ color: "#92400E", fontSize: "0.8rem", lineHeight: 1.5 }}>
                      De cada sesión durante el periodo. Ese {activeOffer.discountPercent}% se descuenta al paciente como incentivo.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { icon: Users, label: "Spots", value: `${activeOffer.spotsTaken}/${activeOffer.spotsTotal}` },
                    { icon: Clock, label: "Tiempo", value: timeLeft(activeOffer.expiresAt) },
                    { icon: TrendingUp, label: "Boost", value: `${activeOffer.boostMultiplier}× alcance` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-xl p-3 text-center border bg-white" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
                      <Icon size={16} style={{ color: TEAL, margin: "0 auto 4px" }} />
                      <p className="text-slate-900" style={{ fontWeight: 700, fontSize: "0.9rem" }}>{value}</p>
                      <p className="text-slate-400" style={{ fontSize: "0.72rem" }}>{label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-5" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                  <Zap size={15} style={{ color: CORAL, flexShrink: 0 }} />
                  <p style={{ color: "#B91C1C", fontSize: "0.82rem", fontWeight: 500 }}>
                    Solo <strong>1 spot disponible</strong>. El primer psicólogo en suscribirse obtiene el beneficio completo.
                  </p>
                </div>

                {confirming === activeOffer.id ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-center text-slate-600" style={{ fontSize: "0.85rem" }}>
                      Confirmas ceder el <strong>{activeOffer.discountPercent}%</strong> de tus sesiones durante el periodo a cambio de visibilidad {activeOffer.boostMultiplier}×.
                    </p>
                    <div className="flex gap-3">
                      <button onClick={() => setConfirming(null)}
                        className="flex-1 py-3 rounded-xl border"
                        style={{ borderColor: "rgba(26,74,92,0.2)", color: "#64748b", fontSize: "0.88rem", fontWeight: 600 }}>
                        Cancelar
                      </button>
                      <button onClick={() => handleSubscribe(activeOffer.id)}
                        disabled={subscribing === activeOffer.id}
                        className="flex-1 py-3 rounded-xl text-white flex items-center justify-center gap-2"
                        style={{ background: subscribing === activeOffer.id ? SAGE : "linear-gradient(135deg, #F59E0B, #F97316)", fontSize: "0.88rem", fontWeight: 700 }}>
                        {subscribing === activeOffer.id
                          ? <><span className="animate-spin inline-block">⏳</span> Procesando...</>
                          : <><Sparkles size={16} /> Confirmar suscripción</>}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setConfirming(activeOffer.id)}
                    className="w-full py-3.5 rounded-xl text-white flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #F59E0B 0%, #F97316 100%)", fontWeight: 700, fontSize: "0.95rem" }}>
                    <Sparkles size={18} /> Suscribirme a esta oferta
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : !isSubscribed && !loading && (
          <div className="bg-white rounded-2xl p-10 text-center border shadow-sm" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: FOG }}>
              <Sparkles size={24} className="text-slate-300" />
            </div>
            <p className="text-slate-700" style={{ fontWeight: 700 }}>No hay ofertas activas en este momento</p>
            <p className="text-slate-400 mt-1" style={{ fontSize: "0.85rem" }}>
              Te notificaremos cuando el administrador publique una nueva oferta.
            </p>
          </div>
        )}

        {pastOffers.length > 0 && (
          <div>
            <p className="text-slate-500 mb-3" style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Historial
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
                      {offer.boostMultiplier}× visibilidad · {offer.discountPercent}% cedido · Expirada
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: statusMeta[offer.status].bg, color: statusMeta[offer.status].color, fontSize: "0.72rem", fontWeight: 600 }}>
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