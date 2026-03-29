import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Users, Calendar, TrendingUp, AlertTriangle, CheckCircle,
  Clock, Cpu, Wifi, Activity, BarChart3, ArrowUpRight, ArrowDownRight,
  Zap, Shield, RefreshCw, ChevronRight, FileText
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell
} from "recharts";

const TEAL = "#1A4A5C";
const SAGE = "#4E8B7A";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const SAND = "#F5EDD8";
const MINT = "#A8D5C2";

// --- Mock data ---
const responseTimeData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  p50: 120 + Math.random() * 80,
  p95: 280 + Math.random() * 200,
  p99: 600 + Math.random() * 400,
}));

const concurrencyData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  users: Math.floor(15 + Math.sin((i - 9) * 0.5) * 40 + Math.random() * 10),
  sessions: Math.floor(8 + Math.sin((i - 10) * 0.5) * 20 + Math.random() * 5),
}));

const errorRateData = Array.from({ length: 12 }, (_, i) => ({
  time: `${(i * 5).toString().padStart(2, "0")}:00`,
  rate: Math.max(0, 0.5 + Math.random() * 2),
}));

const kpiData = [
  { month: "Sep", bookings: 820, revenue: 45100, nps: 71 },
  { month: "Oct", bookings: 940, revenue: 51800, nps: 74 },
  { month: "Nov", bookings: 1100, revenue: 60500, nps: 73 },
  { month: "Dic", bookings: 980, revenue: 53900, nps: 76 },
  { month: "Ene", bookings: 1240, revenue: 68200, nps: 78 },
  { month: "Feb", bookings: 1380, revenue: 75900, nps: 80 },
  { month: "Mar", bookings: 1520, revenue: 83600, nps: 82 },
];

const modalityDistribution = [
  { name: "Videollamada", value: 52, color: TEAL },
  { name: "Presencial", value: 32, color: SAGE },
  { name: "Chat", value: 16, color: CORAL },
];

const recentLogs = [
  { id: "L001", level: "error", service: "chat-service", message: "WebSocket connection timeout after 30s", ts: "2026-03-06 14:32:11", traceId: "abc123" },
  { id: "L002", level: "warn", service: "booking-api", message: "High response time: 2341ms for POST /reservar", ts: "2026-03-06 14:30:45", traceId: "def456" },
  { id: "L003", level: "info", service: "auth-service", message: "User session created: role=psicologo", ts: "2026-03-06 14:29:22", traceId: "ghi789" },
  { id: "L004", level: "info", service: "notification-svc", message: "Email notification sent: appointment_reminder", ts: "2026-03-06 14:28:01", traceId: "jkl012" },
  { id: "L005", level: "error", service: "payment-gateway", message: "Payment timeout: order_id=ORD-2026-08421", ts: "2026-03-06 14:25:33", traceId: "mno345" },
  { id: "L006", level: "warn", service: "scheduler", message: "Slot availability cache miss — cold read from DB", ts: "2026-03-06 14:24:10", traceId: "pqr678" },
  { id: "L007", level: "info", service: "video-service", message: "WebRTC session initiated: roomId=ROOM-4421", ts: "2026-03-06 14:22:55", traceId: "stu901" },
];

const systemMetrics = [
  { label: "CPU (avg)", value: 42, unit: "%", color: TEAL, ok: true },
  { label: "Memoria", value: 68, unit: "%", color: SAGE, ok: true },
  { label: "Latencia p95", value: 380, unit: "ms", color: "#F59E0B", ok: false },
  { label: "Error rate", value: 2.1, unit: "%", color: CORAL, ok: false },
];

const kpiCards = [
  { label: "Usuarios totales", value: "12,840", delta: "+18%", up: true, icon: Users, color: TEAL, bg: FOG },
  { label: "Citas este mes", value: "1,520", delta: "+10%", up: true, icon: Calendar, color: SAGE, bg: "#E8F5F1" },
  { label: "Ingresos (MXN)", value: "$83,600", delta: "+12%", up: true, icon: TrendingUp, color: "#F59E0B", bg: "#FFF7ED" },
  { label: "NPS Score", value: "82", delta: "+4", up: true, icon: Zap, color: CORAL, bg: "#FCF0EB" },
  { label: "Tasa conversión", value: "34.2%", delta: "+2.1%", up: true, icon: BarChart3, color: "#8B5CF6", bg: "#F5F3FF" },
  { label: "Retención 30d", value: "71%", delta: "-2%", up: false, icon: RefreshCw, color: "#0EA5E9", bg: "#F0F9FF" },
];

const logLevelStyle: Record<string, { bg: string; color: string; label: string }> = {
  error: { bg: "#FEF2F2", color: "#EF4444", label: "ERROR" },
  warn: { bg: "#FFF7ED", color: "#F59E0B", label: "WARN" },
  info: { bg: "#EEF4F7", color: TEAL, label: "INFO" },
};

function MetricCard({ label, value, unit, color, ok }: { label: string; value: number; unit: string; color: string; ok: boolean }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-slate-500" style={{ fontSize: "0.8rem", fontWeight: 500 }}>{label}</p>
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: ok ? SAGE : CORAL }}
        />
      </div>
      <p style={{ color, fontWeight: 800, fontSize: "1.6rem" }}>
        {value}{unit}
      </p>
      <p className="mt-1" style={{ color: ok ? SAGE : CORAL, fontSize: "0.72rem", fontWeight: 600 }}>
        {ok ? "✓ Normal" : "⚠ Revisar"}
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [liveUsers, setLiveUsers] = useState(87);
  const [liveSessions, setLiveSessions] = useState(34);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Simulate live metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers((u) => Math.max(50, u + Math.floor(Math.random() * 10) - 4));
      setLiveSessions((s) => Math.max(15, s + Math.floor(Math.random() * 6) - 2));
      setLastRefresh(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: FOG }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #0D2E38 0%, ${TEAL} 100%)` }} className="py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <p style={{ color: MINT, fontSize: "0.875rem", fontWeight: 500 }}>Panel de Administración</p>
              <h1 className="text-white mt-1" style={{ fontWeight: 800, fontSize: "1.8rem" }}>
                Dashboard MindBridge
              </h1>
              <p style={{ color: "rgba(168,213,194,0.7)", fontSize: "0.85rem", marginTop: 4 }}>
                Actualizado {lastRefresh.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </p>
            </div>
            {/* Live indicators */}
            <div className="flex gap-3">
              <div className="bg-white/15 rounded-2xl px-5 py-3 text-center">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: MINT }} />
                  <p style={{ color: MINT, fontSize: "0.72rem", fontWeight: 600 }}>EN VIVO</p>
                </div>
                <p className="text-white" style={{ fontWeight: 800, fontSize: "1.8rem", lineHeight: 1 }}>{liveUsers}</p>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.72rem" }}>usuarios activos</p>
              </div>
              <div className="bg-white/15 rounded-2xl px-5 py-3 text-center">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: CORAL }} />
                  <p style={{ color: CORAL, fontSize: "0.72rem", fontWeight: 600 }}>SESIONES</p>
                </div>
                <p className="text-white" style={{ fontWeight: 800, fontSize: "1.8rem", lineHeight: 1 }}>{liveSessions}</p>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.72rem" }}>en curso</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpiCards.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="bg-white rounded-2xl p-4 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: k.bg }}>
                  <Icon size={18} style={{ color: k.color }} />
                </div>
                <p style={{ color: TEAL, fontWeight: 800, fontSize: "1.3rem" }}>{k.value}</p>
                <p className="text-slate-500" style={{ fontSize: "0.72rem" }}>{k.label}</p>
                <div className="flex items-center gap-1 mt-1">
                  {k.up ? <ArrowUpRight size={12} style={{ color: SAGE }} /> : <ArrowDownRight size={12} style={{ color: CORAL }} />}
                  <span style={{ color: k.up ? SAGE : CORAL, fontSize: "0.72rem", fontWeight: 600 }}>{k.delta}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* System health */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-slate-900" style={{ fontWeight: 700, fontSize: "1rem" }}>
              🖥 Salud del Sistema
            </h2>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "#FFF7ED", color: "#F59E0B", fontSize: "0.75rem", fontWeight: 700 }}>
              <AlertTriangle size={12} /> 2 advertencias
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {systemMetrics.map((m) => (
              <MetricCard key={m.label} {...m} />
            ))}
          </div>
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Concurrency */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-slate-900" style={{ fontWeight: 700, fontSize: "0.95rem" }}>Concurrencia (24h)</h3>
                <p className="text-slate-400" style={{ fontSize: "0.78rem" }}>Usuarios y sesiones simultáneas</p>
              </div>
              <Wifi size={18} style={{ color: TEAL }} />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={concurrencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,74,92,0.06)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#94a3b8" }} interval={3} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="users" stroke={TEAL} fill={`${TEAL}15`} strokeWidth={2} name="Usuarios" />
                <Area type="monotone" dataKey="sessions" stroke={SAGE} fill={`${SAGE}15`} strokeWidth={2} name="Sesiones" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Response time */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-slate-900" style={{ fontWeight: 700, fontSize: "0.95rem" }}>Latencia de respuesta</h3>
                <p className="text-slate-400" style={{ fontSize: "0.78rem" }}>Percentiles p50, p95, p99 (ms)</p>
              </div>
              <Clock size={18} style={{ color: TEAL }} />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,74,92,0.06)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#94a3b8" }} interval={3} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                />
                <Line type="monotone" dataKey="p50" stroke={SAGE} strokeWidth={2} dot={false} name="p50" />
                <Line type="monotone" dataKey="p95" stroke="#F59E0B" strokeWidth={2} dot={false} name="p95" />
                <Line type="monotone" dataKey="p99" stroke={CORAL} strokeWidth={2} dot={false} name="p99" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* KPI bookings */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-slate-900" style={{ fontWeight: 700, fontSize: "0.95rem" }}>KPIs de Negocio</h3>
                <p className="text-slate-400" style={{ fontSize: "0.78rem" }}>Reservas y revenue mensual</p>
              </div>
              <TrendingUp size={18} style={{ color: SAGE }} />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={kpiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,74,92,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                />
                <Bar yAxisId="left" dataKey="bookings" fill={`${TEAL}CC`} name="Citas" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="nps" fill={`${SAGE}CC`} name="NPS" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Modality pie */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
            <h3 className="text-slate-900 mb-1" style={{ fontWeight: 700, fontSize: "0.95rem" }}>Distribución Modalidades</h3>
            <p className="text-slate-400 mb-4" style={{ fontSize: "0.78rem" }}>Mes actual</p>
            <div className="flex justify-center mb-4">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={modalityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {modalityDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2">
              {modalityDistribution.map((m) => (
                <div key={m.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: m.color }} />
                    <span className="text-slate-600" style={{ fontSize: "0.82rem" }}>{m.name}</span>
                  </div>
                  <span style={{ color: TEAL, fontWeight: 700, fontSize: "0.82rem" }}>{m.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Error rate */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-slate-900" style={{ fontWeight: 700, fontSize: "0.95rem" }}>Tasa de Errores (última hora)</h3>
              <p className="text-slate-400" style={{ fontSize: "0.78rem" }}>Porcentaje de requests fallidos por ventana de 5 minutos</p>
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "#FCF0EB", color: CORAL, fontSize: "0.75rem", fontWeight: 700 }}>
              <AlertTriangle size={12} /> 2.1% actual
            </span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={errorRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,74,92,0.06)" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} unit="%" domain={[0, 5]} />
              <Tooltip formatter={(v) => `${Number(v).toFixed(2)}%`} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              {/* Threshold reference line at 1% */}
              <Area type="monotone" dataKey="rate" stroke={CORAL} fill={`${CORAL}20`} strokeWidth={2} name="Error %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(26,74,92,0.06)" }}>
            <div className="flex items-center gap-2">
              <FileText size={17} style={{ color: TEAL }} />
              <h3 className="text-slate-900" style={{ fontWeight: 700, fontSize: "0.95rem" }}>Logs Estructurados Recientes</h3>
            </div>
            <button
              onClick={() => navigate("/admin/logs")}
              className="flex items-center gap-1 transition-colors"
              style={{ color: TEAL, fontSize: "0.8rem", fontWeight: 600 }}
            >
              Ver todos <ChevronRight size={14} />
            </button>
          </div>
          <div className="font-mono text-xs" style={{ background: "#0F1B22" }}>
            {recentLogs.map((log, idx) => {
              const meta = logLevelStyle[log.level];
              return (
                <div
                  key={log.id}
                  className="flex items-start gap-3 px-5 py-2.5 border-b hover:bg-white/5 transition-colors"
                  style={{ borderColor: "rgba(255,255,255,0.04)" }}
                >
                  <span
                    className="px-2 py-0.5 rounded flex-shrink-0 mt-0.5"
                    style={{ background: meta.bg + "20", color: meta.color, fontSize: "0.65rem", fontWeight: 700, minWidth: 42, textAlign: "center" }}
                  >
                    {meta.label}
                  </span>
                  <span style={{ color: "rgba(168,213,194,0.5)", fontSize: "0.72rem", flexShrink: 0 }}>{log.ts}</span>
                  <span style={{ color: "#4E8B7A", flexShrink: 0 }}>[{log.service}]</span>
                  <span style={{ color: "rgba(255,255,255,0.85)", flex: 1 }}>{log.message}</span>
                  <span style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>trace:{log.traceId}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
