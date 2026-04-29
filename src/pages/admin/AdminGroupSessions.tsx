import { useState, useEffect } from "react";
import { Calendar, Clock, Users, CheckCircle, XCircle, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { groupSessionService, type GroupSession } from "../../service/groupSessionService";
import { format } from "date-fns"; // puedes instalar date-fns o usar Date directamente

const TEAL = "#1A4A5C";
const SAGE = "#4E8B7A";
const CORAL = "#E8856A";
const FOG = "#EEF4F7";
const MINT = "#A8D5C2";

const statusColors: Record<GroupSession["status"], { bg: string; text: string; label: string }> = {
  PENDING: { bg: "#FEF3C7", text: "#D97706", label: "Pendiente" },
  APPROVED: { bg: "#E8F5F1", text: SAGE, label: "Aprobada" },
  CANCELLED: { bg: "#F1F5F9", text: "#94A3B8", label: "Cancelada" },
  COMPLETED: { bg: "#E8F5F1", text: SAGE, label: "Completada" },
};

export default function AdminGroupSessions() {
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // session id being processed

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await groupSessionService.getAllGroupSessions();
      setSessions(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las sesiones grupales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleApprove = async (sessionId: string) => {
    setActionLoading(sessionId);
    try {
      await groupSessionService.approveGroupSession(sessionId);
      await loadSessions();
    } catch (err) {
      setError("Error al aprobar la sesión.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (sessionId: string) => {
    if (!window.confirm("¿Cancelar esta sesión? No se podrá revertir.")) return;
    setActionLoading(sessionId);
    try {
      await groupSessionService.cancelGroupSession(sessionId);
      await loadSessions();
    } catch (err) {
      setError("Error al cancelar la sesión.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!window.confirm("¿Eliminar permanentemente esta sesión? No se puede deshacer.")) return;
    setActionLoading(sessionId);
    try {
      await groupSessionService.deleteGroupSession(sessionId);
      await loadSessions();
    } catch (err) {
      setError("Error al eliminar la sesión.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin" size={32} style={{ color: TEAL }} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-900" style={{ fontWeight: 800, fontSize: "1.8rem" }}>Sesiones Grupales</h1>
          <p style={{ color: "#6a8a9a", fontSize: "0.9rem", marginTop: 4 }}>
            Administra todas las solicitudes de sesiones grupales
          </p>
        </div>
        <button
          onClick={loadSessions}
          className="px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
          style={{ background: TEAL, fontSize: "0.85rem", fontWeight: 600 }}
        >
          Refrescar
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-600">X</button>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border shadow-sm">
          <Calendar size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No hay sesiones grupales registradas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sessions.map((session) => (
            <div key={session.id} className="bg-white rounded-2xl shadow-sm border p-5 flex flex-col" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
              <div className="flex items-start justify-between">
                <h3 className="text-slate-900 font-bold text-lg">{session.title}</h3>
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: statusColors[session.status].bg, color: statusColors[session.status].text }}
                >
                  {statusColors[session.status].label}
                </span>
              </div>
              <p className="text-slate-600 text-sm mt-2 line-clamp-3">{session.description}</p>
              <div className="mt-3 space-y-1 text-slate-500 text-xs">
                <div className="flex items-center gap-2"><Calendar size={14} />{new Date(session.scheduledAt).toLocaleString()}</div>
                <div className="flex items-center gap-2"><Clock size={14} />{session.durationMinutes} min</div>
                <div className="flex items-center gap-2"><Users size={14} />{session.maxParticipants} participantes máx.</div>
                <div className="flex items-center gap-2 text-teal-600"><span className="font-medium">Psicólogo ID:</span> {session.psychologistId.substring(0, 8)}...</div>
              </div>

              <div className="mt-4 pt-3 border-t flex gap-2 justify-end" style={{ borderColor: "rgba(26,74,92,0.08)" }}>
                {session.status === "PENDING" && (
                  <button
                    onClick={() => handleApprove(session.id)}
                    disabled={actionLoading === session.id}
                    className="px-3 py-1.5 rounded-lg text-white flex items-center gap-1 disabled:opacity-50"
                    style={{ background: SAGE, fontSize: "0.75rem", fontWeight: 600 }}
                  >
                    {actionLoading === session.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                    Aprobar
                  </button>
                )}
                {session.status !== "COMPLETED" && session.status !== "CANCELLED" && (
                  <button
                    onClick={() => handleCancel(session.id)}
                    disabled={actionLoading === session.id}
                    className="px-3 py-1.5 rounded-lg border flex items-center gap-1 disabled:opacity-50"
                    style={{ borderColor: "rgba(26,74,92,0.2)", color: CORAL, fontSize: "0.75rem", fontWeight: 600 }}
                  >
                    {actionLoading === session.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                    Cancelar
                  </button>
                )}
                {session.status !== "APPROVED" && (
                  <button
                    onClick={() => handleDelete(session.id)}
                    disabled={actionLoading === session.id}
                    className="px-3 py-1.5 rounded-lg border flex items-center gap-1 disabled:opacity-50"
                    style={{ borderColor: "rgba(26,74,92,0.2)", color: "#94A3B8", fontSize: "0.75rem", fontWeight: 600 }}
                  >
                    {actionLoading === session.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}