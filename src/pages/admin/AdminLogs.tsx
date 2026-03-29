import { useState } from "react";
import { Search, RefreshCw, Download, ChevronDown } from "lucide-react";

const TEAL = "#1A4A5C";
const SAGE = "#4E8B7A";
const FOG = "#EEF4F7";
const MINT = "#A8D5C2";

const services = ["Todos", "auth-service", "booking-api", "chat-service", "video-service", "payment-gateway", "notification-svc", "scheduler"];
const levels = ["Todos", "error", "warn", "info", "debug"];

const generateLogs = () =>
  Array.from({ length: 60 }, (_, i) => ({
    id: `L${String(i + 1).padStart(3, "0")}`,
    level: (["error", "warn", "info", "info", "info", "debug"] as const)[Math.floor(Math.random() * 6)],
    service: services.slice(1)[Math.floor(Math.random() * 7)],
    message: [
      "User authentication successful",
      "Appointment booked: appt_id=APT-" + Math.floor(Math.random() * 9999),
      "WebSocket connection established: room=" + Math.floor(Math.random() * 9999),
      "Payment processed: $" + (Math.floor(Math.random() * 100) + 30),
      "Cache miss — fetching from database",
      "Rate limit approached: IP 192.168.1." + Math.floor(Math.random() * 255),
      "Email notification sent: type=reminder",
      "Slot availability updated: psych_id=P0" + Math.floor(Math.random() * 9),
      "Database query slow: " + (Math.floor(Math.random() * 3000) + 200) + "ms",
      "Session expired: user_id=U" + Math.floor(Math.random() * 9999),
    ][Math.floor(Math.random() * 10)],
    ts: new Date(Date.now() - i * 180000).toISOString().replace("T", " ").slice(0, 19),
    traceId: Math.random().toString(36).slice(2, 8),
    userId: "U" + Math.floor(Math.random() * 9999),
    duration: Math.floor(Math.random() * 3000) + "ms",
  }));

const allLogs = generateLogs();

const levelMeta: Record<string, { color: string; bg: string; label: string }> = {
  error: { color: "#EF4444", bg: "#FEF2F2", label: "ERROR" },
  warn: { color: "#F59E0B", bg: "#FFF7ED", label: "WARN" },
  info: { color: TEAL, bg: FOG, label: "INFO" },
  debug: { color: "#8B5CF6", bg: "#F5F3FF", label: "DEBUG" },
};

export default function AdminLogs() {
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("Todos");
  const [selectedService, setSelectedService] = useState("Todos");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = allLogs.filter((log) => {
    const matchLevel = selectedLevel === "Todos" || log.level === selectedLevel;
    const matchService = selectedService === "Todos" || log.service === selectedService;
    const matchSearch = !search || log.message.toLowerCase().includes(search.toLowerCase()) || log.traceId.includes(search);
    return matchLevel && matchService && matchSearch;
  });

  return (
    <div className="min-h-screen" style={{ background: FOG }}>
      <div style={{ background: `linear-gradient(135deg, #0D2E38 0%, ${TEAL} 100%)` }} className="py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-white" style={{ fontWeight: 800, fontSize: "1.8rem" }}>Logs del Sistema</h1>
          <p style={{ color: MINT, fontSize: "0.9rem", marginTop: 4 }}>
            Trazabilidad completa de eventos críticos en tiempo real
          </p>
          <div className="flex gap-3 mt-5 flex-wrap">
            {Object.entries(levelMeta).map(([lvl, meta]) => {
              const count = allLogs.filter((l) => l.level === lvl).length;
              return (
                <div key={lvl} className="px-3 py-1.5 rounded-full bg-white/15">
                  <span style={{ color: "white", fontSize: "0.78rem", fontWeight: 600 }}>
                    {meta.label}: <strong>{count}</strong>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow-sm border flex-1 min-w-48" style={{ borderColor: "rgba(26,74,92,0.1)" }}>
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Buscar mensaje o traceId..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-slate-700"
              style={{ fontSize: "0.875rem" }}
            />
          </div>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2.5 bg-white rounded-xl border shadow-sm outline-none"
            style={{ borderColor: "rgba(26,74,92,0.1)", fontSize: "0.875rem", color: "#4a6572" }}
          >
            {levels.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-4 py-2.5 bg-white rounded-xl border shadow-sm outline-none"
            style={{ borderColor: "rgba(26,74,92,0.1)", fontSize: "0.875rem", color: "#4a6572" }}
          >
            {services.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            className="px-4 py-2.5 bg-white rounded-xl border shadow-sm flex items-center gap-2 transition-colors hover:bg-slate-50"
            style={{ borderColor: "rgba(26,74,92,0.1)", color: TEAL, fontSize: "0.875rem", fontWeight: 600 }}
          >
            <RefreshCw size={15} /> Actualizar
          </button>
          <button
            className="px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors hover:opacity-90 text-white"
            style={{ background: SAGE, fontSize: "0.875rem", fontWeight: 600 }}
          >
            <Download size={15} /> Exportar
          </button>
        </div>

        <p className="text-slate-500 mb-3" style={{ fontSize: "0.82rem" }}>
          Mostrando <strong style={{ color: TEAL }}>{filtered.length}</strong> de {allLogs.length} eventos
        </p>

        {/* Log table */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ background: FOG, borderBottom: "1px solid rgba(26,74,92,0.08)" }}>
                  {["Nivel", "Timestamp", "Servicio", "Mensaje", "TraceID", ""].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left"
                      style={{ color: "#6a8a9a", fontWeight: 600, fontSize: "0.78rem", fontFamily: "Inter, sans-serif" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 30).map((log) => {
                  const meta = levelMeta[log.level];
                  const isExpanded = expanded === log.id;
                  return (
                    <>
                      <tr
                        key={log.id}
                        className="border-b hover:bg-slate-50 cursor-pointer transition-colors"
                        style={{ borderColor: "rgba(26,74,92,0.05)" }}
                        onClick={() => setExpanded(isExpanded ? null : log.id)}
                      >
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded"
                            style={{ background: meta.bg, color: meta.color, fontWeight: 700, fontSize: "0.7rem" }}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3" style={{ color: "#6a8a9a", whiteSpace: "nowrap" }}>{log.ts}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded" style={{ background: "#EAF2F5", color: TEAL, fontSize: "0.72rem" }}>
                            {log.service}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate" style={{ color: "#2d4a5a" }}>{log.message}</td>
                        <td className="px-4 py-3" style={{ color: SAGE }}>{log.traceId}</td>
                        <td className="px-4 py-3">
                          <ChevronDown
                            size={14}
                            className="text-slate-400 transition-transform"
                            style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                          />
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${log.id}-expanded`} style={{ background: "#F8FAFB" }}>
                          <td colSpan={6} className="px-6 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ fontFamily: "Inter, sans-serif" }}>
                              <div>
                                <p style={{ color: "#94a3b8", fontSize: "0.72rem" }}>Trace ID</p>
                                <p style={{ color: TEAL, fontWeight: 600, fontSize: "0.82rem" }}>{log.traceId}</p>
                              </div>
                              <div>
                                <p style={{ color: "#94a3b8", fontSize: "0.72rem" }}>Usuario</p>
                                <p style={{ color: TEAL, fontWeight: 600, fontSize: "0.82rem" }}>{log.userId}</p>
                              </div>
                              <div>
                                <p style={{ color: "#94a3b8", fontSize: "0.72rem" }}>Duración</p>
                                <p style={{ color: TEAL, fontWeight: 600, fontSize: "0.82rem" }}>{log.duration}</p>
                              </div>
                              <div>
                                <p style={{ color: "#94a3b8", fontSize: "0.72rem" }}>Servicio</p>
                                <p style={{ color: TEAL, fontWeight: 600, fontSize: "0.82rem" }}>{log.service}</p>
                              </div>
                              <div className="col-span-2 md:col-span-4 p-3 rounded-xl" style={{ background: "#0F1B22", fontFamily: "monospace" }}>
                                <p style={{ color: MINT, fontSize: "0.78rem" }}>
                                  [{log.ts}] [{meta.label}] [{log.service}] {log.message} trace_id={log.traceId} user_id={log.userId} duration={log.duration}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
