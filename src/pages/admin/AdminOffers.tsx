import { useState } from "react";
import { Plus, Tag, CheckCircle, XCircle, Calendar, User } from "lucide-react";

const TEAL = "#1A4A5C";
const SAGE = "#4E8B7A";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const MINT = "#A8D5C2";

type OfferStatus = "OPEN" | "TAKEN" | "CANCELLED";

interface Offer {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: OfferStatus;
  psychologistId: string | null;
}

const mockOffers: Offer[] = [
  { id: "1", title: "Oferta Abril", startDate: "2026-04-01", endDate: "2026-04-25", status: "OPEN", psychologistId: null },
  { id: "2", title: "Oferta Mayo", startDate: "2026-05-01", endDate: "2026-05-30", status: "OPEN", psychologistId: null },
  { id: "3", title: "Oferta Marzo", startDate: "2026-03-01", endDate: "2026-03-31", status: "TAKEN", psychologistId: "PSY-001" },
  { id: "4", title: "Oferta Febrero", startDate: "2026-02-01", endDate: "2026-02-28", status: "TAKEN", psychologistId: "PSY-003" },
];

export default function AdminOffers() {
  const [offers, setOffers] = useState<Offer[]>(mockOffers);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [success, setSuccess] = useState(false);

  const openOffers = offers.filter((o) => o.status === "OPEN");
  const takenOffers = offers.filter((o) => o.status === "TAKEN");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newOffer: Offer = {
      id: String(Date.now()),
      title,
      startDate,
      endDate,
      status: "OPEN",
      psychologistId: null,
    };
    setOffers([newOffer, ...offers]);
    setTitle("");
    setStartDate("");
    setEndDate("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleCancel = (id: string) => {
    setOffers(offers.map((o) => o.id === id ? { ...o, status: "CANCELLED" } : o));
  };

  return (
    <div className="min-h-screen" style={{ background: FOG }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #0D2E38 0%, ${TEAL} 100%)` }} className="py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-white" style={{ fontWeight: 800, fontSize: "1.8rem" }}>
            Gestión de Ofertas
          </h1>
          <p style={{ color: MINT, fontSize: "0.9rem", marginTop: 4 }}>
            Crea convocatorias y monitorea la suscripción de psicólogos
          </p>
          <div className="flex gap-4 mt-5">
            <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
              <p className="text-white" style={{ fontWeight: 700, fontSize: "1.4rem" }}>{openOffers.length}</p>
              <p style={{ color: MINT, fontSize: "0.75rem" }}>Abiertas</p>
            </div>
            <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
              <p className="text-white" style={{ fontWeight: 700, fontSize: "1.4rem" }}>{takenOffers.length}</p>
              <p style={{ color: MINT, fontSize: "0.75rem" }}>Tomadas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Crear oferta */}
        <div className="bg-white rounded-2xl shadow-sm border p-6" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
          <div className="flex items-center gap-2 mb-5">
            <Plus size={18} style={{ color: TEAL }} />
            <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1rem" }}>Crear nueva oferta</h2>
          </div>

          {success && (
            <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl" style={{ background: "#E8F5F1", color: SAGE }}>
              <CheckCircle size={16} />
              <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Oferta creada exitosamente</span>
            </div>
          )}

          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-slate-600 mb-1.5" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                Título de la oferta
              </label>
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
              <label className="block text-slate-600 mb-1.5" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                Fecha inicio
              </label>
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
              <label className="block text-slate-600 mb-1.5" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                Fecha fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border outline-none"
                style={{ borderColor: "rgba(26,74,92,0.2)", fontSize: "0.875rem" }}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-3 rounded-xl text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                style={{ background: TEAL, fontWeight: 700, fontSize: "0.875rem" }}
              >
                <Plus size={16} /> Crear oferta
              </button>
            </div>
          </form>
        </div>

        {/* Ofertas abiertas */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
          <div className="flex items-center gap-2 px-6 py-4 border-b" style={{ borderColor: "rgba(26,74,92,0.06)" }}>
            <Tag size={17} style={{ color: TEAL }} />
            <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1rem" }}>
              Ofertas abiertas
            </h2>
            <span className="ml-auto px-2.5 py-0.5 rounded-full text-white" style={{ background: TEAL, fontSize: "0.72rem", fontWeight: 700 }}>
              {openOffers.length}
            </span>
          </div>
          {openOffers.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-400" style={{ fontSize: "0.875rem" }}>
              No hay ofertas abiertas en este momento
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ background: FOG, borderBottom: "1px solid rgba(26,74,92,0.08)" }}>
                  {["Título", "Fecha inicio", "Fecha fin", "Estado", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left" style={{ color: "#6a8a9a", fontWeight: 600, fontSize: "0.78rem" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {openOffers.map((offer) => (
                  <tr key={offer.id} className="border-b hover:bg-slate-50 transition-colors" style={{ borderColor: "rgba(26,74,92,0.05)" }}>
                    <td className="px-5 py-4" style={{ fontWeight: 600, color: "#2d4a5a", fontSize: "0.875rem" }}>
                      {offer.title}
                    </td>
                    <td className="px-5 py-4 text-slate-500" style={{ fontSize: "0.85rem" }}>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        {offer.startDate}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500" style={{ fontSize: "0.85rem" }}>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        {offer.endDate}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full" style={{ background: "#E8F5F1", color: SAGE, fontSize: "0.75rem", fontWeight: 600 }}>
                        OPEN
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleCancel(offer.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border hover:bg-red-50 transition-colors"
                        style={{ borderColor: "rgba(232,133,106,0.3)", color: CORAL, fontSize: "0.78rem", fontWeight: 600 }}
                      >
                        <XCircle size={13} /> Cancelar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Ofertas tomadas */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
          <div className="flex items-center gap-2 px-6 py-4 border-b" style={{ borderColor: "rgba(26,74,92,0.06)" }}>
            <CheckCircle size={17} style={{ color: SAGE }} />
            <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1rem" }}>
              Ofertas tomadas
            </h2>
            <span className="ml-auto px-2.5 py-0.5 rounded-full text-white" style={{ background: SAGE, fontSize: "0.72rem", fontWeight: 700 }}>
              {takenOffers.length}
            </span>
          </div>
          {takenOffers.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-400" style={{ fontSize: "0.875rem" }}>
              Ningún psicólogo se ha suscrito aún
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ background: FOG, borderBottom: "1px solid rgba(26,74,92,0.08)" }}>
                  {["Título", "Fecha inicio", "Fecha fin", "Psicólogo", "Estado"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left" style={{ color: "#6a8a9a", fontWeight: 600, fontSize: "0.78rem" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {takenOffers.map((offer) => (
                  <tr key={offer.id} className="border-b hover:bg-slate-50 transition-colors" style={{ borderColor: "rgba(26,74,92,0.05)" }}>
                    <td className="px-5 py-4" style={{ fontWeight: 600, color: "#2d4a5a", fontSize: "0.875rem" }}>
                      {offer.title}
                    </td>
                    <td className="px-5 py-4 text-slate-500" style={{ fontSize: "0.85rem" }}>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        {offer.startDate}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500" style={{ fontSize: "0.85rem" }}>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        {offer.endDate}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#E8F5F1" }}>
                          <User size={13} style={{ color: SAGE }} />
                        </div>
                        <span style={{ color: TEAL, fontWeight: 600, fontSize: "0.85rem" }}>
                          {offer.psychologistId}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full" style={{ background: "#FAEEDA", color: "#BA7517", fontSize: "0.75rem", fontWeight: 600 }}>
                        TAKEN
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}