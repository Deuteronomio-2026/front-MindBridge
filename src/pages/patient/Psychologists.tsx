import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Search, SlidersHorizontal, X, Star, LayoutGrid, List, Loader2 } from "lucide-react";
import { specialtyOptions } from "../../data/psychologists";
import { PsychologistCard } from "../../components/PsychologistCard";
import { userService } from "../../service/userService";
import type { Psychologist } from "../../types/user";

const TEAL = "#1A4A5C";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";

const modalityOptions = [
  { value: "video", label: "Videollamada" },
  { value: "presencial", label: "Presencial" },
  { value: "chat", label: "Chat" },
];

const ratingOptions = [
  { value: 4.5, label: "4.5+ estrellas" },
  { value: 4.0, label: "4.0+ estrellas" },
];

const mapToCardFormat = (p: Psychologist) => {
  const specialization = p.specialization || "General";
  // ✅ Convertir consultationFee a número (el backend lo envía como string)
  const fee = Number(p.consultationFee) || 0;

  console.log(`Psicólogo ${p.name} - fee original:`, p.consultationFee, "convertido a:", fee);

  return {
    id: p.id,
    name: `${p.name} ${p.lastName}`,
    title: specialization,
    specialties: [specialization],
    location: p.address || p.officeLocation || "Ubicación no especificada",
    rating: 4.5,
    reviewCount: 0,
    photo: "https://via.placeholder.com/120",
    verified: p.verificationStatus === "VERIFIED",
    experience: p.yearsOfExperience,
    bio: p.biography || "",
    education: [],
    languages: p.languages ?? [],
    prices: {
      video: fee,
      presencial: fee + 50,
      chat: fee - 30,
    },
    schedule: {},
    reviews: [],
  };
};

export default function Psychologists() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(200);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPsychologists = async () => {
      try {
        setLoading(true);
        const data = await userService.getPsychologists();
        console.log("Psicólogos recibidos del backend:", data);
        setPsychologists(data);
        setError(null);
      } catch (err) {
        console.error("Error cargando psicólogos:", err);
        setError("No se pudieron cargar los psicólogos. Intenta más tarde.");
      } finally {
        setLoading(false);
      }
    };
    fetchPsychologists();
  }, []);

  const mappedPsychologists = psychologists.map(mapToCardFormat);
  console.log("Psicólogos mapeados (precios):", mappedPsychologists.map(p => p.prices));

  const filteredPsychologists = mappedPsychologists.filter((p) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.specialties.some((s) => s.toLowerCase().includes(q)) ||
      p.location.toLowerCase().includes(q);

    const matchesSpecialty =
      selectedSpecialties.length === 0 ||
      selectedSpecialties.some((s) => p.specialties.includes(s));

    const matchesModality =
      selectedModalities.length === 0 ||
      selectedModalities.some((m) => {
        if (m === "video") return p.prices.video <= maxPrice;
        if (m === "presencial") return p.prices.presencial <= maxPrice;
        if (m === "chat") return p.prices.chat <= maxPrice;
        return false;
      });

    const matchesRating = !minRating || p.rating >= minRating;

    const matchesPrice =
      p.prices.video <= maxPrice ||
      p.prices.presencial <= maxPrice ||
      p.prices.chat <= maxPrice;

    return matchesQuery && matchesSpecialty && matchesModality && matchesRating && matchesPrice;
  });

  console.log("filteredPsychologists length:", filteredPsychologists.length);

  const hasActiveFilters =
    selectedSpecialties.length > 0 ||
    selectedModalities.length > 0 ||
    minRating !== null ||
    maxPrice < 200;

  const clearFilters = () => {
    setSelectedSpecialties([]);
    setSelectedModalities([]);
    setMinRating(null);
    setMaxPrice(200);
    setQuery("");
  };

  const toggleSpecialty = (s: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const toggleModality = (m: string) => {
    setSelectedModalities((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: FOG }}>
        <Loader2 className="animate-spin" size={32} style={{ color: TEAL }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: FOG }}>
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 rounded-lg text-white" style={{ background: TEAL }}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: FOG }}>
      <div style={{ background: `linear-gradient(135deg, #0D2E38 0%, ${TEAL} 100%)` }} className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-white mb-2" style={{ fontSize: "2rem", fontWeight: 800 }}>
            Encuentra tu psicólogo
          </h1>
          <p className="mb-6" style={{ color: "#A8D5C2", fontSize: "1rem" }}>
            {filteredPsychologists.length} profesionales disponibles para ti
          </p>
          <div className="flex gap-3 max-w-2xl">
            <div className="flex-1 flex items-center gap-3 bg-white rounded-xl px-4 shadow-sm">
              <Search size={18} className="text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Buscar por nombre, especialidad o ciudad..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 py-3.5 bg-transparent outline-none text-slate-700 placeholder-slate-400"
                style={{ fontSize: "0.9rem" }}
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 px-4 py-3.5 rounded-xl transition-colors"
              style={{
                background: filtersOpen || hasActiveFilters ? "white" : "rgba(255,255,255,0.2)",
                color: filtersOpen || hasActiveFilters ? TEAL : "white",
                border: filtersOpen || hasActiveFilters ? "none" : "1px solid rgba(255,255,255,0.3)",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              <SlidersHorizontal size={17} />
              <span className="hidden sm:block">Filtros</span>
              {hasActiveFilters && (
                <span className="w-5 h-5 text-white rounded-full flex items-center justify-center" style={{ background: CORAL, fontSize: "0.7rem" }}>
                  {selectedSpecialties.length + selectedModalities.length + (minRating ? 1 : 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Sidebar Filters (desktop) */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-5 shadow-sm border sticky top-24" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1rem" }}>Filtros</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} style={{ color: TEAL, fontSize: "0.8rem", fontWeight: 500 }}>
                    Limpiar
                  </button>
                )}
              </div>

              <div className="mb-6">
                <p className="text-slate-700 mb-3" style={{ fontWeight: 600, fontSize: "0.875rem" }}>Calificación</p>
                <div className="flex flex-col gap-2">
                  {ratingOptions.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setMinRating(minRating === r.value ? null : r.value)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors"
                      style={{
                        background: minRating === r.value ? FOG : "transparent",
                        color: minRating === r.value ? TEAL : "#6a8a9a",
                        fontSize: "0.85rem",
                      }}
                    >
                      <Star size={13} style={{ color: minRating === r.value ? "#F59E0B" : "#cbd5e1", fill: minRating === r.value ? "#F59E0B" : "none" }} />
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-slate-700 mb-3" style={{ fontWeight: 600, fontSize: "0.875rem" }}>Modalidad</p>
                <div className="flex flex-col gap-2">
                  {modalityOptions.map((m) => (
                    <label key={m.value} className="flex items-center gap-2.5 cursor-pointer">
                      <div
                        onClick={() => toggleModality(m.value)}
                        className="flex items-center justify-center transition-colors cursor-pointer"
                        style={{
                          width: 18, height: 18, borderRadius: 4,
                          background: selectedModalities.includes(m.value) ? TEAL : "white",
                          border: selectedModalities.includes(m.value) ? `2px solid ${TEAL}` : "2px solid #cbd5e1",
                        }}
                      >
                        {selectedModalities.includes(m.value) && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span className="cursor-pointer" style={{ fontSize: "0.875rem", color: "#4a6572" }} onClick={() => toggleModality(m.value)}>
                        {m.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-700" style={{ fontWeight: 600, fontSize: "0.875rem" }}>Precio máximo</p>
                  <span style={{ color: TEAL, fontWeight: 700, fontSize: "0.875rem" }}>${maxPrice}</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={200}
                  step={5}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: TEAL }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-slate-400" style={{ fontSize: "0.75rem" }}>$20</span>
                  <span className="text-slate-400" style={{ fontSize: "0.75rem" }}>$200</span>
                </div>
              </div>

              <div>
                <p className="text-slate-700 mb-3" style={{ fontWeight: 600, fontSize: "0.875rem" }}>Especialidades</p>
                <div className="flex flex-wrap gap-1.5">
                  {specialtyOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleSpecialty(s)}
                      className="px-2.5 py-1 rounded-full border transition-colors"
                      style={{
                        background: selectedSpecialties.includes(s) ? TEAL : "white",
                        color: selectedSpecialties.includes(s) ? "white" : "#4a6572",
                        borderColor: selectedSpecialties.includes(s) ? TEAL : "rgba(26,74,92,0.2)",
                        fontSize: "0.75rem",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {filtersOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setFiltersOpen(false)}>
              <div
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1.1rem" }}>Filtros</h3>
                  <div className="flex items-center gap-3">
                    {hasActiveFilters && (
                      <button onClick={clearFilters} style={{ color: TEAL, fontSize: "0.875rem" }}>Limpiar</button>
                    )}
                    <button onClick={() => setFiltersOpen(false)}><X size={20} className="text-slate-500" /></button>
                  </div>
                </div>
                <div className="mb-5">
                  <p className="text-slate-700 mb-3" style={{ fontWeight: 600, fontSize: "0.875rem" }}>Modalidad</p>
                  <div className="flex gap-2 flex-wrap">
                    {modalityOptions.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => toggleModality(m.value)}
                        className="px-4 py-2 rounded-xl border transition-colors"
                        style={{
                          background: selectedModalities.includes(m.value) ? TEAL : "white",
                          color: selectedModalities.includes(m.value) ? "white" : "#4a6572",
                          borderColor: selectedModalities.includes(m.value) ? TEAL : "#e2e8f0",
                          fontSize: "0.875rem",
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-5">
                  <p className="text-slate-700 mb-3" style={{ fontWeight: 600, fontSize: "0.875rem" }}>Especialidades</p>
                  <div className="flex flex-wrap gap-2">
                    {specialtyOptions.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleSpecialty(s)}
                        className="px-3 py-1.5 rounded-full border transition-colors"
                        style={{
                          background: selectedSpecialties.includes(s) ? TEAL : "white",
                          color: selectedSpecialties.includes(s) ? "white" : "#4a6572",
                          borderColor: selectedSpecialties.includes(s) ? TEAL : "#e2e8f0",
                          fontSize: "0.8rem",
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="w-full py-3.5 text-white rounded-xl"
                  style={{ background: TEAL, fontWeight: 700 }}
                >
                  Aplicar filtros
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <div className="flex flex-wrap gap-2">
                {selectedSpecialties.map((s) => (
                  <span key={s} className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: "#EAF2F5", color: TEAL, fontSize: "0.8rem", fontWeight: 500 }}>
                    {s}
                    <button onClick={() => toggleSpecialty(s)}><X size={12} /></button>
                  </span>
                ))}
                {selectedModalities.map((m) => (
                  <span key={m} className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: "#EAF2F5", color: TEAL, fontSize: "0.8rem", fontWeight: 500 }}>
                    {modalityOptions.find((x) => x.value === m)?.label}
                    <button onClick={() => toggleModality(m)}><X size={12} /></button>
                  </span>
                ))}
                {minRating && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: "#EAF2F5", color: TEAL, fontSize: "0.8rem", fontWeight: 500 }}>
                    {minRating}+ ★
                    <button onClick={() => setMinRating(null)}><X size={12} /></button>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 p-1 bg-white rounded-xl border ml-auto" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
                <button
                  onClick={() => setViewMode("grid")}
                  className="p-2 rounded-lg transition-colors"
                  style={{ background: viewMode === "grid" ? FOG : "transparent", color: viewMode === "grid" ? TEAL : "#94a3b8" }}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className="p-2 rounded-lg transition-colors"
                  style={{ background: viewMode === "list" ? FOG : "transparent", color: viewMode === "list" ? TEAL : "#94a3b8" }}
                >
                  <List size={16} />
                </button>
              </div>
            </div>

            {filteredPsychologists.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: FOG }}>
                  <Search size={28} className="text-slate-400" />
                </div>
                <h3 className="text-slate-700 mb-2" style={{ fontWeight: 700 }}>No se encontraron resultados</h3>
                <p className="text-slate-400 mb-4" style={{ fontSize: "0.875rem" }}>
                  Intenta con otros filtros o términos de búsqueda.
                </p>
                <button onClick={clearFilters} className="px-5 py-2.5 text-white rounded-xl" style={{ background: TEAL, fontWeight: 600 }}>
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <p className="text-slate-500 mb-5" style={{ fontSize: "0.875rem" }}>
                  Mostrando <strong className="text-slate-700">{filteredPsychologists.length}</strong> psicólogos
                </p>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredPsychologists.map((p) => (
                      <PsychologistCard key={p.id} psychologist={p} variant="grid" />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {filteredPsychologists.map((p) => (
                      <PsychologistCard key={p.id} psychologist={p} variant="list" />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}