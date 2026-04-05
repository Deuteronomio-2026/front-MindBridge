import { useState, useEffect, useCallback } from "react";
import { Plus, Tag, CheckCircle, XCircle, Calendar, User, Sparkles, AlertCircle } from "lucide-react";
import { AxiosError } from "axios";
import { offerService } from "../../service/offerService";
import type { Offer } from "../../service/offerService";

const TEAL = "#1A4A5C";
const SAGE = "#4E8B7A";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const MINT = "#A8D5C2";

export default function AdminOffers() {
  const [openOffers, setOpenOffers] = useState<Offer[]>([]);
  const [takenOffers, setTakenOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Formulario
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [benefitsRaw, setBenefitsRaw] = useState("");
  const [boostMultiplier, setBoostMultiplier] = useState(2);
  const [discountPercent, setDiscountPercent] = useState(15);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const getErrorMessage = (err: unknown): string => {
    if (err instanceof AxiosError) {
      return err.response?.data?.message || err.message;
    }
    return "Ocurrió un error inesperado";
  };

  // ✅ Función de carga memoizada
  const loadOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [active, taken] = await Promise.all([
        offerService.getActiveOffers(),
        offerService.getTakenOffers(),
      ]);
      setOpenOffers(active);
      setTakenOffers(taken);
    } catch (err: unknown) {
      console.error("Error cargando ofertas:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []); // No depende de nada externo

  // ✅ useEffect con la dependencia correcta
  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !startDate || !endDate) {
      setError("Todos los campos marcados con * son obligatorios");
      setTimeout(() => setError(null), 5000);
      return;
    }

    const benefitsList = benefitsRaw
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);

    const newOfferData = {
      title,
      description,
      benefits: benefitsList,
      boostMultiplier,
      discountPercent,
      startDate,
      endDate,
    };

    try {
      await offerService.createOffer(newOfferData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setTitle("");
      setDescription("");
      setBenefitsRaw("");
      setBoostMultiplier(2);
      setDiscountPercent(15);
      setStartDate("");
      setEndDate("");
      await loadOffers(); // ✅ reutiliza la función
    } catch (err: unknown) {
      console.error("Error creando oferta:", err);
      setError(getErrorMessage(err));
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await offerService.cancelOffer(id);
      await loadOffers(); // ✅ reutiliza
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      console.error("Error cancelando oferta:", err);
      setError(getErrorMessage(err));
      setTimeout(() => setError(null), 5000);
    }
  };

  if (loading && openOffers.length === 0 && takenOffers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: FOG }}>
        <div className="text-slate-500">Cargando ofertas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: FOG }}>
      <div style={{ background: `linear-gradient(135deg, #0D2E38 0%, ${TEAL} 100%)` }} className="py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-white" style={{ fontWeight: 800, fontSize: "1.8rem" }}>Gestión de Ofertas</h1>
          <p style={{ color: MINT, fontSize: "0.9rem", marginTop: 4 }}>Crea convocatorias y monitorea la suscripción de psicólogos</p>
          <div className="flex gap-4 mt-5">
            {[
              { label: "Abiertas", count: openOffers.length },
              { label: "Tomadas", count: takenOffers.length }
            ].map((s) => (
              <div key={s.label} className="bg-white/15 rounded-xl px-4 py-2 text-center">
                <p className="text-white" style={{ fontWeight: 700, fontSize: "1.4rem" }}>{s.count}</p>
                <p style={{ color: MINT, fontSize: "0.75rem" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {success && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: "#E8F5F1", color: SAGE }}>
            <CheckCircle size={16} />
            <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Operación realizada exitosamente</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: "#FFE5E5", color: "#C41E3A" }}>
            <AlertCircle size={16} />
            <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
          <div className="flex items-center gap-2 mb-5">
            <Plus size={18} style={{ color: TEAL }} />
            <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1rem" }}>Crear nueva oferta</h2>
          </div>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div>
              <label className="block text-slate-600 mb-1.5" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Título *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Oferta Abril 2026"
                required
                className="w-full px-4 py-3 rounded-xl border outline-none"
                style={{ borderColor: "rgba(26,74,92,0.2)", fontSize: "0.875rem" }}
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1.5" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Descripción *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el beneficio que obtendrá el psicólogo suscrito..."
                required
                rows={3}
                className="w-full px-4 py-3 rounded-xl border outline-none resize-none"
                style={{ borderColor: "rgba(26,74,92,0.2)", fontSize: "0.875rem" }}
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1.5" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                Beneficios <span className="text-slate-400 font-normal">(separados por coma)</span>
              </label>
              <input
                type="text"
                value={benefitsRaw}
                onChange={(e) => setBenefitsRaw(e.target.value)}
                placeholder="Ej: Apareces primero en búsquedas, Insignia destacado, 3× impresiones"
                className="w-full px-4 py-3 rounded-xl border outline-none"
                style={{ borderColor: "rgba(26,74,92,0.2)", fontSize: "0.875rem" }}
              />
              {benefitsRaw && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {benefitsRaw.split(",").map((b) => b.trim()).filter(Boolean).map((b, i) => (
                    <span key={i} className="flex items-center gap-1 px-2.5 py-0.5 rounded-full"
                      style={{ background: "#E8F5F1", color: SAGE, fontSize: "0.72rem" }}>
                      <CheckCircle size={10} /> {b}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 mb-1.5" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                  Multiplicador de visibilidad — <span style={{ color: TEAL, fontWeight: 700 }}>{boostMultiplier}×</span>
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setBoostMultiplier(n)}
                      className="flex-1 py-2.5 rounded-xl border transition-colors"
                      style={{
                        background: boostMultiplier === n ? TEAL : "white",
                        color: boostMultiplier === n ? "white" : "#4a6572",
                        borderColor: boostMultiplier === n ? TEAL : "rgba(26,74,92,0.2)",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                      }}
                    >
                      {n}×
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-slate-600 mb-1.5" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                  Descuento al paciente — <span style={{ color: CORAL, fontWeight: 700 }}>{discountPercent}% OFF</span>
                </label>
                <div className="flex gap-2">
                  {[10, 15, 20, 25].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setDiscountPercent(n)}
                      className="flex-1 py-2.5 rounded-xl border transition-colors"
                      style={{
                        background: discountPercent === n ? CORAL : "white",
                        color: discountPercent === n ? "white" : "#4a6572",
                        borderColor: discountPercent === n ? CORAL : "rgba(26,74,92,0.2)",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                      }}
                    >
                      {n}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-4 py-3 rounded-xl" style={{ background: "#FFF7ED", border: "1px solid #FED7AA" }}>
              <p style={{ fontSize: "0.8rem", color: "#92400E" }}>
                💡 El psicólogo cede el <strong>{discountPercent}%</strong> de cada sesión durante el periodo.
                Los pacientes verán ese descuento aplicado al precio. El psicólogo decide si acepta al suscribirse.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 mb-1.5" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Fecha inicio *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border outline-none"
                  style={{ borderColor: "rgba(26,74,92,0.2)", fontSize: "0.875rem" }}
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1.5" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Fecha fin *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border outline-none"
                  style={{ borderColor: "rgba(26,74,92,0.2)", fontSize: "0.875rem" }}
                />
              </div>
            </div>
            <button
              type="submit"
              className="self-end px-8 py-3 rounded-xl text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ background: TEAL, fontWeight: 700, fontSize: "0.875rem" }}
            >
              <Sparkles size={15} /> Publicar oferta
            </button>
          </form>
        </div>

        {/* Ofertas abiertas */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
          <div className="flex items-center gap-2 px-6 py-4 border-b" style={{ borderColor: "rgba(26,74,92,0.06)" }}>
            <Tag size={17} style={{ color: TEAL }} />
            <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1rem" }}>Ofertas abiertas</h2>
            <span className="ml-auto px-2.5 py-0.5 rounded-full text-white" style={{ background: TEAL, fontSize: "0.72rem", fontWeight: 700 }}>{openOffers.length}</span>
          </div>
          {openOffers.length === 0 ? (
            <p className="px-6 py-10 text-center text-slate-400" style={{ fontSize: "0.875rem" }}>No hay ofertas abiertas</p>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {openOffers.map((offer) => (
                <div key={offer.id} className="p-5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <p className="text-slate-900" style={{ fontWeight: 700, fontSize: "0.95rem" }}>{offer.title}</p>
                        <span className="px-2 py-0.5 rounded-full" style={{ background: FOG, color: TEAL, fontSize: "0.68rem", fontWeight: 700 }}>{offer.boostMultiplier}× boost</span>
                        <span className="px-2 py-0.5 rounded-full" style={{ background: "#FCF0EB", color: CORAL, fontSize: "0.68rem", fontWeight: 700 }}>{offer.discountPercent}% OFF paciente</span>
                      </div>
                      <p className="text-slate-500 mb-2" style={{ fontSize: "0.82rem", lineHeight: 1.5 }}>{offer.description}</p>
                      {offer.benefits && offer.benefits.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {offer.benefits.map((b, i) => (
                            <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: FOG, color: TEAL, fontSize: "0.7rem" }}>
                              <CheckCircle size={9} /> {b}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-slate-400" style={{ fontSize: "0.78rem" }}>
                        <span className="flex items-center gap-1"><Calendar size={12} />{offer.startDate}</span>
                        <span>→</span>
                        <span className="flex items-center gap-1"><Calendar size={12} />{offer.endDate}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancel(offer.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border flex-shrink-0 hover:bg-red-50 transition-colors"
                      style={{ borderColor: "rgba(232,133,106,0.3)", color: CORAL, fontSize: "0.78rem", fontWeight: 600 }}
                    >
                      <XCircle size={13} /> Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ofertas tomadas */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
          <div className="flex items-center gap-2 px-6 py-4 border-b" style={{ borderColor: "rgba(26,74,92,0.06)" }}>
            <CheckCircle size={17} style={{ color: SAGE }} />
            <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1rem" }}>Ofertas tomadas</h2>
            <span className="ml-auto px-2.5 py-0.5 rounded-full text-white" style={{ background: SAGE, fontSize: "0.72rem", fontWeight: 700 }}>{takenOffers.length}</span>
          </div>
          {takenOffers.length === 0 ? (
            <p className="px-6 py-10 text-center text-slate-400" style={{ fontSize: "0.875rem" }}>Ningún psicólogo se ha suscrito aún</p>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {takenOffers.map((offer) => (
                <div key={offer.id} className="p-5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-slate-900" style={{ fontWeight: 700, fontSize: "0.95rem" }}>{offer.title}</p>
                        <span className="px-2 py-0.5 rounded-full" style={{ background: "#FCF0EB", color: CORAL, fontSize: "0.68rem", fontWeight: 700 }}>{offer.discountPercent}% OFF</span>
                      </div>
                      <p className="text-slate-500 mb-2" style={{ fontSize: "0.82rem" }}>{offer.description}</p>
                      <div className="flex items-center gap-3 text-slate-400" style={{ fontSize: "0.78rem" }}>
                        <span className="flex items-center gap-1"><Calendar size={12} />{offer.startDate}</span>
                        <span>→</span>
                        <span className="flex items-center gap-1"><Calendar size={12} />{offer.endDate}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="px-2.5 py-1 rounded-full" style={{ background: "#FAEEDA", color: "#BA7517", fontSize: "0.72rem", fontWeight: 600 }}>TAKEN</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "#E8F5F1" }}>
                          <User size={11} style={{ color: SAGE }} />
                        </div>
                        <span style={{ color: TEAL, fontWeight: 600, fontSize: "0.82rem" }}>{offer.psychologistId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}